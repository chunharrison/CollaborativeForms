const express = require('express');
const app = express()
const http = require('http').Server(app)
const io = require('socket.io');
const CryptoJS = require("crypto-js");

var url = "mongodb://localhost:27017";
var MongoClient = require('mongodb').MongoClient;
// 
var db;
// Initialize connection once
MongoClient.connect(url, {useUnifiedTopology: true}, function(err, database) {
    if(err) throw err;
    db = database.db('canvasdb'); // creating a connection to the database named 'canvasdb'
});

const port = 5000;
//Bind socket.io socket to http server
const socket = io(http);

var usersConnected = 0;
//store incoming canvas in database and send canvas to users connected
function initCanvas(roomKey, currentCanvas, socket) {    

    let cipherObject = CryptoJS.AES.encrypt(JSON.stringify(currentCanvas.canvas), 'secret key 123').toString();

    let canvasData = {
        room: roomKey,
        canvas: cipherObject,
        pageCount: currentCanvas.pageCount,
        pageHeight: currentCanvas.pageHeight,
        pageWidth: currentCanvas.pageWidth
    }

    db.collection("canvases").insertOne( canvasData, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");

        canvasData.canvas = currentCanvas.canvas;
        socket.emit('canvasSetup', canvasData);
    });

}

//define socket.io behavior when users connect
socket.on('connection', (socket)=>{
    //check if database has canvas if not request it, if it does send it to users
    socket.on('join', ({ name, roomKey }) => {
        console.log(`${name} just joined ${roomKey}`)
        usersConnected++;
        console.log(`current number of users in ${roomKey}: ${usersConnected}`);

        db.collection("canvases").findOne({ room: roomKey }, function(err, result) {
            if (err) throw err;
    
            if (result !== null) {
                let bytes  = CryptoJS.AES.decrypt(result.canvas, 'secret key 123');
                let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                result.canvas = decryptedData

                console.log(`fetching canvas data from room name: ${roomKey}`)
                socket.emit('canvasSetup', result);
            } else {
                console.log(`initial setup for room name: ${roomKey}`)
                socket.emit('needCanvas');
            }
        });
    
        //force reset canvas, only gets called when 'needCanvas' gets emitted
        socket.on('initCanvas', (data) => {
            initCanvas(roomKey, data.currentCanvas, socket);
        })
    
        //force send clients canvas that are missing it
        socket.on('missingCanvas', (data) => {
            socket.emit('canvasSetup', canvasData);
        })
    
        //receive incoming changes to the canvases and save the changes in the database. after saving, send edited canvas to users who did not send changes
        socket.on('editIn', (data) => {
            console.log(db.collection("canvases").find(
                { room: roomKey }
             ).explain("executionStats"));
            db.collection("canvases").findOne({room: roomKey}, function(err, result) {
                if (err) throw err;

                let bytes  = CryptoJS.AES.decrypt(result.canvas, 'secret key 123');
                let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                result.canvas = decryptedData
                result.canvas[data.canvasData.id] = data.canvasData.json;
    
                let cipherObject = CryptoJS.AES.encrypt(JSON.stringify(result.canvas), 'secret key 123').toString();

                console.log("canvasdb found")

                db.collection("canvases").updateOne({room: roomKey}, {$set: {canvas: cipherObject}}, function(err, res) {
                    if (err) throw err;
                    console.log("1 document updated");
    
                    let dataOut = {
                        json: data.canvasData.json,
                        id: data.canvasData.id
                    };
                    console.log(roomKey)
                    socket.to(roomKey).emit('editOut', dataOut); 
                });
            });
        })

        // socket.on('editIn', (data) => {
        //     db.collection("canvases").findOne({}, function(err, result) {
        //         if (err) throw err;
        
        //         result.canvas[data.canvasData.id] = data.canvasData.json;
    
        //         db.collection("canvases").updateOne({}, {$set: {canvas: result.canvas}}, function(err, res) {
        //             if (err) throw err;
        //             console.log("1 document updated");
    
        //             let dataOut = {
        //                 json: data.canvasData.json,
        //                 id: data.canvasData.id
        //             };
        //             socket.to(data.roomKey).emit('editOut', dataOut); 
        //         });
        //     });
        // })

        socket.on("disconnect", ()=>{
            console.log(`${name} just left ${roomKey}`);
            usersConnected--;
            console.log(`current number of users in ${roomKey}: ${usersConnected}`);
        })

        console.log("------------------------------")
        // socket.join(room); monkahmm
    })

    // socket.on("disconnect", ()=>{
    //     usersConnected--;
    //     console.log('user connected');
    //     // const user = removeUser(socket.id);
    //     // if (user) {
    //     //     socket.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left`})
    //     // }
    // })
});

http.listen(port, ()=>{
    console.log('connected to port: ' + port)
});