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
      origin: "*", // In production, replace with your Netlify URL for security
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling'],
  });

  const PORT = process.env.PORT || 3001; // Default to 3001 to avoid Vite conflict
// Game states per room
const roomStates: Record<string, any> = {};
const roomMessages: Record<string, any[]> = {};
const roomMembers: Record<string, string[]> = {}; // roomId -> [socketId, socketId, ...]

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    if (!roomMembers[roomId]) roomMembers[roomId] = [];
    if (!roomMembers[roomId].includes(socket.id)) {
      roomMembers[roomId].push(socket.id);
    }

    const mySlot = roomMembers[roomId].indexOf(socket.id);
    console.log(`User ${socket.id} joined room: ${roomId} as Slot: ${mySlot}`);

    // Notify the user of their assigned slot
    socket.emit("slot-assigned", mySlot);

    // Initialize room structures if new
    if (!roomStates[roomId]) roomStates[roomId] = { isGameStarted: false };
    if (!roomMessages[roomId]) roomMessages[roomId] = [];

    // Send current state AND chat history
    socket.emit("init", {
      state: roomStates[roomId],
      messages: roomMessages[roomId]
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Cleanup room members
    for (const roomId in roomMembers) {
      roomMembers[roomId] = roomMembers[roomId].filter(id => id !== socket.id);
    }
  });

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
    });
  });

  // Health check for Render/Railway
  app.get("/", (req, res) => {
    res.send("Global Conquest Backend Active");
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", rooms: Object.keys(roomStates).length });
  });

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

  // Vite middleware for local development ONLY
  if (process.env.NODE_ENV !== "production" && !process.env.BACKEND_ONLY) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In BACKEND_ONLY mode, we don't serve the frontend
    console.log("Running in Backend-Only mode.");
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
