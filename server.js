// server.js — Socket.io relay
// Install: npm install
// Run:     node server.js

// server.js — Socket.io relay + static file server
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");

const PORT = process.env.PORT || 8080;

const app = express();

// Serve all files from the current directory (flat structure)
app.use(express.static(__dirname));

// Explicit fallback for root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log(`[+] connected (total: ${io.engine.clientsCount})`);

  // Relay every event to all other clients
  socket.onAny((event, value) => {
    socket.broadcast.emit(event, value);
  });

  socket.on("disconnect", () => {
    console.log(`[-] disconnected (total: ${io.engine.clientsCount})`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`✅ Socket.io relay + static server running on port ${PORT}`);
});
