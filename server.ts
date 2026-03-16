import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling'],
  });

  const PORT = process.env.PORT || 3001;

  const roomStates: Record<string, any> = {};
  const roomMessages: Record<string, any[]> = {};
  const roomLobbies: Record<string, any> = {}; 

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);

      if (!roomLobbies[roomId]) {
        roomLobbies[roomId] = {
          players: Array.from({length: 6}, (_, i) => ({
            slotIndex: i,
            socketId: null,
            name: `COMMANDER ${i + 1}`,
            npcId: null,
            isReady: false,
            isHost: false,
            type: 'human'
          })),
          difficulty: 'normal',
          setupRule: 'random'
        };
      }

      const lobby = roomLobbies[roomId];
      let mySlot = lobby.players.findIndex((p: any) => p.socketId === null && p.type === 'human');
      
      if (mySlot !== -1) {
        lobby.players[mySlot].socketId = socket.id;
        if (!lobby.players.some((p: any) => p.isHost)) {
          lobby.players[mySlot].isHost = true;
        }
      }

      io.to(roomId).emit("lobby-update", lobby);
      
      if (!roomStates[roomId]) roomStates[roomId] = { isGameStarted: false };
      if (!roomMessages[roomId]) roomMessages[roomId] = [];
      
      socket.emit("init", {
        state: roomStates[roomId],
        messages: roomMessages[roomId]
      });
    });

    socket.on("update-lobby", ({ roomId, lobby }) => {
      roomLobbies[roomId] = lobby;
      io.to(roomId).emit("lobby-update", lobby);
    });

    socket.on("start-game", ({ roomId, gameState }) => {
      roomStates[roomId] = gameState;
      io.to(roomId).emit("game-started", gameState);
    });

    socket.on("action", (data) => {
      const { roomId, action } = data;
      if (!roomId || !action) return;
      if (action.type === 'UPDATE_STATE') {
        roomStates[roomId] = { ...(roomStates[roomId] || {}), ...action.payload };
      }
      socket.to(roomId).emit("remote-action", action);
    });

    socket.on("chat-message", (data) => {
      const { roomId, message } = data;
      if (!roomMessages[roomId]) roomMessages[roomId] = [];
      roomMessages[roomId].push(message);
      if (roomMessages[roomId].length > 50) roomMessages[roomId].shift();
      socket.to(roomId).emit("incoming-chat", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      for (const roomId in roomLobbies) {
        const lobby = roomLobbies[roomId];
        const slot = lobby.players.find((p: any) => p.socketId === socket.id);
        if (slot) {
          slot.socketId = null;
          slot.isReady = false;
          if (slot.isHost) {
            slot.isHost = false;
            const nextHuman = lobby.players.find((p: any) => p.socketId !== null);
            if (nextHuman) nextHuman.isHost = true;
          }
          io.to(roomId).emit("lobby-update", lobby);
        }
      }
    });
  });

  app.get("/", (req, res) => res.send("Global Conquest Backend Active"));
  app.get("/api/health", (req, res) => res.json({ status: "ok", rooms: Object.keys(roomStates).length }));
  app.get("/api/rooms", (req, res) => {
    const rooms = Object.keys(roomStates).map(roomId => {
      const socketRoom = io.sockets.adapter.rooms.get(roomId);
      return {
        id: roomId,
        playerCount: socketRoom ? socketRoom.size : 0,
        isStarted: roomStates[roomId]?.isGameStarted || false
      };
    });
    res.json(rooms);
  });

  if (process.env.NODE_ENV !== "production" && !process.env.BACKEND_ONLY) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}

startServer();