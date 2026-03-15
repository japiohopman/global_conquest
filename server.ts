import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
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

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
      
      if (roomStates[roomId]) {
        socket.emit("init", roomStates[roomId]);
      }
    });

    socket.on("action", (data) => {
      const { roomId, action } = data;
      if (!roomId || !action) return;
      
      if (action.type === 'UPDATE_STATE') {
        roomStates[roomId] = { ...(roomStates[roomId] || {}), ...action.payload };
      }
      
      socket.to(roomId).emit("remote-action", action);
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

  // Vite middleware for local development ONLY
  if (process.env.NODE_ENV !== "production" && !process.env.BACKEND_ONLY) {
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
