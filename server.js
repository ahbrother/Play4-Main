// server.js — Socket.io relay
// Install: npm install
// Run:     node server.js

const { createServer } = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 8080;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" } // allow any origin (iPad, laptop, Render)
});

io.on("connection", (socket) => {
  console.log(`[+] connected  (total: ${io.engine.clientsCount})`);

  // relay every event to all OTHER clients — generic, no hardcoding of keys
  socket.onAny((event, value) => {
    socket.broadcast.emit(event, value);
  });

  socket.on("disconnect", () => {
    console.log(`[-] disconnected (total: ${io.engine.clientsCount})`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`\n✅ Socket.io relay running on port ${PORT}`);
  console.log(`   Find your local IP: ipconfig getifaddr en0  (Mac)`);
});
