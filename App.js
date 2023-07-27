const express = require("express");
const socket = require("socket.io");
const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("Port is running at " + PORT);
});

let io = socket(server);

io.on("connection", (socket) => {
  console.log("socket connection established");
  // received data
  socket.on("beginPath", (data) => {
    // Now transfer data to all connected connections
    io.sockets.emit("beginPath", data);
  });

  socket.on("drawStroke", (data) => {
    io.sockets.emit("drawStroke", data);
  });
  socket.on("redoUndo", (data) => {
    io.sockets.emit("redoUndo", data);
  });
  socket.on("sticky", (data) => {
    io.sockets.emit("sticky", data);
  });
});
