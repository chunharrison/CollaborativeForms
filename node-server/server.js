const express = require('express');
const app = express()
const http = require('http').Server(app)
const io = require('socket.io');
const fabric = require('fabric').fabric;

const mongo = require('mongodb');
var url = "mongodb://localhost:27017";
var MongoClient = require('mongodb').MongoClient;
var db;

// Initialize connection once
MongoClient.connect(url, {useUnifiedTopology: true}, function(err, database) {
    if(err) throw err;
    db = database.db('canvasdb');
});

const port = 5000;
//Bind socket.io socket to http server
const socket = io(http);

var usersConnected = 0;
//store incoming canvas in database and send canvas to users connected
function initCanvas(data, socket) {    
    let canvasData = {
        canvas: data.canvas,
        pageCount: data.pageCount,
        pageHeight: data.pageHeight,
        pageWidth: data.pageWidth
    }

    db.collection("canvases").insertOne( canvasData, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        socket.emit('canvasSetup', canvasData);
    });

}
//define socket.io behavior when users connect
socket.on('connection', (socket)=>{
    usersConnected++;
    console.log('user connected');
    console.log(usersConnected);
    //check if database has canvas if not request it, if it does send it to users
    db.collection("canvases").findOne({}, function(err, result) {
        if (err) throw err;

        if (result !== null) {
            socket.emit('canvasSetup', result);
        } else {
            socket.emit('needCanvas');
        }
    });
    //force reset canvas
    socket.on('initCanvas', (data) => {
        initCanvas(data, socket);
    })
    //force send clients canvas that are missing it
    socket.on('missingCanvas', (data) => {
        socket.emit('canvasSetup', canvasData);
    })
    //receive incoming changes to the canvases and save the changes in the database. after saving, send edited canvas to users who did not send changes
    socket.on('editIn', (data) => {
        db.collection("canvases").findOne({}, function(err, result) {
            if (err) throw err;
    
            result.canvas[data.id] = data.json;

            db.collection("canvases").updateOne({}, {$set: {canvas: result.canvas}}, function(err, res) {
                if (err) throw err;
                console.log("1 document updated");

                let dataOut = {json: data.json,
                    id: data.id};
                socket.broadcast.emit('editOut', dataOut); 
            });
        });
    })

    socket.on("disconnect", ()=>{
        usersConnected--;
        console.log("Disconnected")
    })
});

http.listen(port, ()=>{
    console.log('connected to port: ' + port)
});