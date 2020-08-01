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
        let hostID = ''
        if (result !== null) hostID = result.host.id
        res.send({hostID: hostID})
    })
})

router.get('/get-host-name', (req, res) => {
    const { roomCode } = req.query;

    db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
        if (err) throw err;
        if (result !== null) res.send({hostName: result.host.name})
    })
})

router.get('/get-guest-list', (req, res) => {
    const { roomCode } = req.query;
    db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
        if (err) throw err;
        res.send({guestList: result.guests})
    })
})

router.post('/set-pilot-mode-status', (req, res) => {  

    const { roomCode, status } = req.body;

    db.collection("rooms").findOne({ roomCode: roomCode}, function(err, result) {
        if (err) throw err;

        // update
        if (result !== null) {
            console.log('SETTING set-pilot-mode-status')
            // replace with updated data
            db.collection("rooms").updateOne({ roomCode: roomCode}, {$set: {pilotModeActivated: status}})
        }
    })
})


module.exports = router;