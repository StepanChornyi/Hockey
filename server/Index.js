const { Server } = require("socket.io");
const { DataManager } = require('./DataManager');
const { ServerController } = require("./ServerController");

const PORT = 8080;

const io = new Server(PORT, {
  cors: {
    origin: ["https://localhost:3000", "http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

ServerController.init(io, new DataManager());

console.log('\x1b[34m%s\x1b[0m', `======================================= PORT:${PORT}`);