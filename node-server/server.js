const express = require('express');
const app = express()
const http = require('http').Server(app)
const io = require('socket.io');
const fabric = require('fabric').fabric;

const port = 5000;
const socket = io(http);

var canvasData = null;
var usersConnected = 0;

function initCanvas(data, socket) {
    canvasData = {
        canvas: [],
        pageCount: data.pageCount,
        pageHeight: data.pageHeight,
        pageWidth: data.pageWidth
    }

    for (let i = 0; i < canvasData.pageCount; i++) {
        var canvas = new fabric.StaticCanvas(null, { width: canvasData.pageWidth, height: canvasData.pageHeight });
        canvasData.canvas.push(canvas);
        canvas.loadFromJSON(data.canvas[i], function() {
            canvas.renderAll.bind(canvas);

            if (i === canvasData.pageCount - 1) {
                socket.emit('canvasSetup', canvasData);
            }
        });
    }
}

socket.on('connection', (socket)=>{
    usersConnected++;
    console.log('user connected');
    console.log(usersConnected);

    if (canvasData !== null) {
        socket.emit('canvasSetup', canvasData);
    } else {
        socket.emit('needCanvas');
    }

    socket.on('initCanvas', (data) => {
        initCanvas(data, socket);
    })

    socket.on('missingCanvas', (data) => {
        socket.emit('canvasSetup', canvasData);
    })

    socket.on('editIn', (data) => {
        let canvas = canvasData.canvas[data.id];
        canvas.loadFromJSON(data.json, canvas.renderAll.bind(canvas));
        let dataOut = {json: data.json,
            id: data.id};
        socket.broadcast.emit('editOut', dataOut);
    })

    socket.on("disconnect", ()=>{
        usersConnected--;
        console.log("Disconnected")
    })
});

http.listen(port, ()=>{
    console.log('connected to port: ' + port)
});