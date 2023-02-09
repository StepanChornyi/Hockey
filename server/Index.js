const { Server } = require("socket.io");
const { DataManager } = require('./DataManager');
const { ServerController } = require("./ServerController");
const mongoose = require('mongoose');

(async () => {
  const PORT = 8080;
  const mongoCredentials = 'mongodb+srv://stepan:4fEK33egL8lcLo6x@hockey.wvoxfpu.mongodb.net/hockey?retryWrites=true&w=majority';

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoCredentials);

  const http = require('http').createServer().listen(PORT, '0.0.0.0');

  const io = new Server(http, {
    cors: {
      origin: ["https://localhost:3000", "http://localhost:3000", "http://192.168.3.7:3000"],
      methods: ["GET", "POST"]
    }
  });

  ServerController.init(io, new DataManager());

  console.log('\x1b[34m%s\x1b[0m', `======================================= PORT:${PORT}`);
})()
