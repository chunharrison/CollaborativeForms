const express = require("express");
const router = express.Router();
var cors = require('cors');
router.use(cors({
    credentials: true,
    origin: 'http://localhost:3000',
    "Access-Control-Allow-Origin": "http://localhost:3000",
}))

var db;
var url = "mongodb://localhost:27017";
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(url, {useUnifiedTopology: true}, function(err, database) {
    if(err) throw err;
    db = database.db('roomsdb'); // creating a connection to the database named 'roomsdb'
});

router.get('/check-space-availability', (req, res) => {
    // res.header("Access-Control-Allow-Credentials", true);

    const { roomCode } = req.query;

    db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
        if (err) throw err;

        let full = true
        
        if (result !== null && Object.keys(result.guests).length < result.numMaxGuests) {
            full = false
        }

        res.send({full})
    })
})

router.get('/get-id-occupied', (req, res) => {
    res.header("Access-Control-Allow-Credentials", true);

    const { roomCode, guestID } =  req.query;
    
    // find
    db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
        if (err) throw err;
        
        // send
        if (result !== null) {
            res.send({occupied: result.guests.hasOwnProperty(guestID)})
        }
    })
})

router.get('/validate-invitation-code', (req, res) => {
    const {roomCode, invitationCode} = req.query

    db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
        if (err) throw err;

        if (result !== null) {
            res.send({validCode: result.invitationCode === invitationCode})
        } else {
            res.send({validCode: 'invalidRoomCode'})
        }
    })
})

module.exports = router;