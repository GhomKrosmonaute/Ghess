const express = require('express');
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static('public'));

const sessions = {};

io.on("connection", socket => {
  
  socket.on("login", session => {
    socket.session = session
    if(!sessions[session]){
      sessions[session] = [socket]
    }else{
      sessions[session].push(socket)
    }
    
    socket.emit("player", sessions[session].length < 3)
    
    socket.join(session)
  
    socket.emit("userJoin", sessions[session].length)
    socket.broadcast.to(session).emit("userJoin", sessions[session].length)
  
    socket.on("moveTo", (id, pos) => {
      socket.broadcast.to(socket.session).emit("moveTo", id, pos, socket.session)
    })
  
    socket.on("reset", () => {
      socket.broadcast.to(socket.session).emit("reset", socket.session)
    })
  
    socket.on("ajuste", (id) => {
      socket.broadcast.to(socket.session).emit("ajuste", id, socket.session)
    })
  
    socket.on("disconnect", () => {
      sessions[socket.session] = sessions[socket.session].filter(s => s !== socket)
    })
  })
})

server.listen(3000, () => {
  console.log('listening on localhost:3000');
});