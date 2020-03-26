const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mysql = require('mysql2');

//Port from environment variable or default - 4001
const port = process.env.PORT || 4001;

//Setting up express and adding socketIo middleware
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'document-contents'
});
//Setting up a socket with the namespace "connection" for new sockets
io.on("connection", socket => {
    console.log("New client connected");
    //Here we listen on a new namespace called "incoming data"
    socket.on("incoming data", (data)=>{
        console.log(data);
        //Here we broadcast it out to all other sockets EXCLUDING the socket which sent us the data
       socket.broadcast.emit("outgoing data", {val: data});
    });

    //A special namespace "disconnect" for when a client disconnects
    socket.on("disconnect", () => console.log("Client disconnected"));
});

server.listen(port, () => console.log(`Listening on port ${port}`));