const express = require("express");
const router = express.Router();


var db;
var url = "mongodb://localhost:27017";
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(url, {useUnifiedTopology: true}, function(err, database) {
    if(err) throw err;
    db = database.db('roomsdb'); // creating a connection to the database named 'roomsdb'
});

router.get('/get-host-id', (req, res) => {
    const { roomCode } = req.query;
    db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
        if (err) throw err;

        res.send({hostID: result.host.id})
    })
})

router.get('/get-host-name', (req, res) => {
    const { roomCode } = req.query;
    console.log('/get-host-name', roomCode)
    db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
        if (err) throw err;
        // console.log(result.host.name)
        res.send({hostName: result.host.name})
    })
})

router.get('/get-guest-list', (req, res) => {
    const { roomCode } = req.query;
    db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
        if (err) throw err;
        // console.log(result.host.name)
        res.send({guestList: result.guests})
    })
})

router.post('/set-pilot-mode-status', (req, res) => {  
    console.log('/set-pilot-mode-status')

    const { roomCode, status } = req.query;

    db.collection("rooms").findOne({ roomCode: roomCode}, function(err, result) {
        if (err) throw err;

        // update
        if (result) {
            result.pilotModeActivated = status
            // replace with updated data
            db.collection("rooms").updateOne({ roomCode: roomCode}, {$set: {pilotModeActivated: result.pilotModeActivated}})
        }
    })
})


module.exports = router;