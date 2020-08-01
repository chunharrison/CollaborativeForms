const express = require("express");
const router = express.Router();

var db;
var url = "mongodb://localhost:27017";
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(url, {useUnifiedTopology: true}, function(err, database) {
    if(err) throw err;
    db = database.db('roomsdb'); // creating a connection to the database named 'roomsdb'
});

router.post('/create-demo-room', (req, res) => {
    // Both Key and ContentType are defined in the client side.
    // Key refers to the remote name of the file.
    // ContentType refers to the MIME content type, in this case image/jpeg
    res.header("Access-Control-Allow-Credentials", true);
    // initial room
    // data
    let roomData = {
        roomCode: req.body.roomCode,
        fileName: req.body.fileName,
        signatures: {},
        highlights: {}, 
        host: {id: req.body.userId, name: req.body.userName},
        guests: {},
        numMaxGuests: 3, 
        pilotModeActivated: false,
        demo: true,
    }

    db.collection("rooms").insertOne(roomData, function(err, response) {
        if(err) throw err;
        res.send()
    })
})

router 


module.exports = router;