require('dotenv').config()
const express = require('express');
const app = express()
const http = require('http').Server(app)
const socketio = require('socket.io');
const CryptoJS = require("crypto-js");
var cors = require('cors');

const { generateGetUrl, generatePutUrl } = require('./AWSPresigner');

var url = "mongodb://localhost:27017";
var MongoClient = require('mongodb').MongoClient;
var db;

// Initialize connection once
MongoClient.connect(url, {useUnifiedTopology: true}, function(err, database) {
    if(err) throw err;
    db = database.db('roomsdb'); // creating a connection to the database named 'roomsdb'
});

const port = 5000;

app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000',
    "Access-Control-Allow-Origin": "http://localhost:3000",
    
}));

// GET URL
app.get('/generate-get-url', (req, res) => {
    // Both Key and ContentType are defined in the client side.
    // Key refers to the remote name of the file.
    const { Key } = req.query;
    generateGetUrl(Key)
        .then(getURL => {      
        res.send(getURL);
        })
        .catch(err => {
        res.send(err);
        });
});
  
// PUT URL
app.get('/generate-put-url', (req,res)=>{
// Both Key and ContentType are defined in the client side.
// Key refers to the remote name of the file.
// ContentType refers to the MIME content type, in this case image/jpeg
res.header("Access-Control-Allow-Credentials", true);
const { Key, ContentType } =  req.query;
generatePutUrl(Key, ContentType).then(putURL => {
    res.send({putURL});
})
.catch(err => {
    res.send(err);
});
});


//Bind socket.io socket to http server
const io = socketio(http);

//store incoming canvas in database and send canvas to users connected
function initCanvas(username, roomCode, currentCanvas, socket) {    

    let cipherCanvases = [];
    for (let i = 0; i < currentCanvas.canvas.length; i++) {
        let cipherObject = CryptoJS.AES.encrypt(JSON.stringify(currentCanvas.canvas[i]), process.env.ENCRYPT_KEY).toString();
        cipherCanvases.push(cipherObject);
    }

    let canvasData = {
        createdAt: new Date(),
        room: roomCode,
        users: [username],
        canvas: cipherCanvases,
        lowerCanvasDataURLs: currentCanvas.lowerCanvasDataURLs,
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

function roomCreation(roomCode, username, socket) {
    // data
    let roomData = {
        roomCode: roomCode,
        users: [username],
        signatures: [], 
    }

    db.collection("rooms").insertOne(roomData, function(err, res) {
        if(err) throw err;
        

    })
}

//define socket.io behavior when users connect
io.on('connection', (socket)=>{

    //check if database has canvas if not request it, if it does send it to users
    socket.emit('join');
    socket.on('join', ({ username, roomCode, creation }) => {
        socket.join(roomCode);

        console.log(`${username} just joined ${roomCode}`)
        const PDFDocument = generateGetUrl(`${roomCode}.pdf`)
        socket.emit('sendPDFDocument', PDFDocument)
        // room creation
        if (creation) {
            roomCreation(roomCode, username, socket)
        } 
        
        // room join
        else {
            db.collection("rooms").findOne({ roomCode: roomCode }, function(err, result) {
                if (err) throw err;
    
                // database found under given roomCode (the roomCode that the person entered when joining the room)
                // (the room exists)
                if (result !== null) {
    
                    // for (let i = 0; i < result.canvas.length; i++) {
                    //     let bytes  = CryptoJS.AES.decrypt(result.canvas[i], process.env.ENCRYPT_KEY);
                    //     result.canvas[i] = (JSON.parse(bytes.toString(CryptoJS.enc.Utf8)));
                    // }
    
                    console.log(`fetching data from room: ${roomCode}`)
    
                    // update the list of users in the database
                    result.users.push(username);
                    db.collection("rooms").updateOne({ roomCode: roomCode }, {$set: { users: result.users }});
    
                    // broadcast to every other users in the room that this user joined
                    // with the newly updated list of users 
                    socket.to(roomCode).emit('userJoined', result.users, username);
    
                    // socket.emit('canvasSetup', result);
                } 
                
                // could not find the database under the given roomCode
                // (the room does not exist)
                else {
                    socket.emit('invalidRoomCode')
                }
            });
        }
    
        // //force reset canvas, only gets called when 'needCanvas' gets emitted
        // socket.on('initCanvas', function(data, callback) {
        //     initCanvas(username, roomCode, data.currentCanvas, socket);
        //     callback();
        // });
        
        // //force send clients canvas that are missing it
        // socket.on('missingCanvas', (data) => {
        //     socket.emit('canvasSetup', canvasData);
        // })

        // person requests 
        socket.on('requestPage', (pageNum) => {
            db.collection("canvases").findOne({roomCode: roomCode}, function(err, result) {
                if (err) throw err;

                if (result === null) {
                    socket.emit('invalidRoomCode');
                } else {
                    // let bytes  = CryptoJS.AES.decrypt(result.canvas[pageNum], process.env.ENCRYPT_KEY);
                    // let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                    db.collection("canvases").findOne({ roomCode: roomCode }, function(err, result) {
                        let pageData = {
                            pageNum: pageNum,
                        }
                        socket.emit('sendPage', pageData);
                    })
                }
            });
        })

        // for Downloads only (currently)
        socket.on('requestCanvasData', () => {
            console.log("PERFORMING requestCanvasData")
            db.collection("canvases").findOne({room: roomCode}, function(err, result) {
                if (err) throw err;

                for (let i = 0; i < result.pageCount; i++) {
                    const bytes = CryptoJS.AES.decrypt(result.canvas[i], process.env.ENCRYPT_KEY);
                    result.canvas[i] = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                }
                socket.emit('sendCanvasData', {
                    canvas: result.canvas,
                    lowerCanvasDataURLs: result.lowerCanvasDataURLs, 
                    pageCount: result.pageCount,
                    pageWidth: result.pageWidth,
                    pageHeight: result.pageHeight
                })
            })
        })

        //receive incoming changes to the canvases and save the changes in the database. after saving, send edited canvas to users who did not send changes
        socket.on('editIn', (data) => {
            db.collection("canvases").findOne({room: roomCode}, function(err, result) {
                if (err) throw err;

                let cipherObject = CryptoJS.AES.encrypt(JSON.stringify(data.canvasData.canvasJson), process.env.ENCRYPT_KEY).toString();
                result.canvas[data.canvasData.id] = cipherObject;
                result.lowerCanvasDataURLs[data.canvasData.id] = data.canvasData.canvasDataURL;

                db.collection("canvases").updateOne({room: roomCode}, {$set: {canvas: result.canvas, lowerCanvasDataURLs: result.lowerCanvasDataURLs}}, function(err, res) {
                    if (err) throw err;
                    console.log("1 document updated");
    
                    let dataOut = {
                        json: data.canvasData.json,
                        id: data.canvasData.id,
                        action: data.canvasData.action
                    };

                    socket.broadcast.to(roomCode).emit('editOut', dataOut);
                });
            });
        })

        socket.on('deleteIn', (data) => {
            db.collection("canvases").findOne({room: roomCode}, function(err, result) {
                if (err) throw err;

                let cipherObject = CryptoJS.AES.encrypt(JSON.stringify(data.canvasData.canvasJson), process.env.ENCRYPT_KEY).toString();
                result.canvas[data.canvasData.id] = cipherObject;
                result.lowerCanvasDataURLs[data.canvasData.id] = data.canvasData.canvasDataURL

                db.collection("canvases").updateOne({room: roomCode}, {$set: {canvas: result.canvas, lowerCanvasDataURLs: result.lowerCanvasDataURLs}}, function(err, res) {
                    if (err) throw err;
                    console.log("1 document updated");
    
                    let dataOut = {
                        objectId: data.canvasData.objectId,
                        id: data.canvasData.id,
                        action: data.canvasData.action
                    };

                    socket.broadcast.to(roomCode).emit('deleteOut', dataOut);
                });
            });
        })

        socket.on("disconnect", () => {
            console.log(`${username} just left ${roomCode}`);
            
            // update the list of users in the database
            db.collection("canvases").findOne({room: roomCode}, function(err, result) {
                if (err) throw err;

                result.users.splice(result.users.indexOf(username), 1); // remove the first occurence of the username from database
                db.collection("canvases").updateOne({ room: roomCode }, {$set: { users: result.users }});

                // broadcast to every other users in the room that this user joined
                // with the newly updated list of users 
                socket.to(roomCode).emit('userDisconnected', result.users, username);
            })
            // result.users.push(username);
            // db.collection("canvases").updateOne({ room: roomCode }, {$set: { users: result.users }});
        })

        console.log("------------------------------")
    })

    socket.on('error', function (err) {
        console.log(err);
    });
});

http.listen(port, ()=>{
    console.log('connected to port: ' + port)
});