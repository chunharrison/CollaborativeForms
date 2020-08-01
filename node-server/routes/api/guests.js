const express = require("express");
const router = express.Router();

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

router.post('/add-guest', (req, res) => {
    // res.header("Access-Control-Allow-Credentials", true);
    const { roomCode, guestName, guestID } =  req.body.params;
    // find
    db.collection("rooms").findOne({ roomCode: roomCode}, function(err, result) {
        if (err) throw err;

        // update
        if (result !== null) {
            result.guests[guestID] = guestName
            // replace with updated data
            db.collection("rooms").updateOne({ roomCode: roomCode}, {$set: {guests: result.guests}})
        }
    })
})

router.delete('/delete', (req, res) => {
    res.header("Access-Control-Allow-Credentials", true);

    const { roomCode, guestID } =  req.query;
    
    // find
    db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
        if (err) throw err;
        
        // remove
        if (result !== null) {
            delete result.guests[guestID]
        }
    })
    
    // replace with updated data
    db.collection("rooms").updateOne({ roomCode: roomCode}, {$set: {guests: result.guests}})

    // send result
     res.send()
})

router.get('/get-guests', (req, res) => {
    res.header("Access-Control-Allow-Credentials", true);
    const { roomCode } =  req.query;
    
    // find
    db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
        if (err) throw err;
        
        // send
        if (result !== null) {
            res.send(result.guests)
        }
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


module.exports = router;