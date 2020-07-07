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
        // TODO change the 5 to a variable
        if (result && Object.keys(result.guests).length <= 5) {
            full = false
        }

        res.send({full})
    })
})

router.post('/add', (req, res) => {
    // res.header("Access-Control-Allow-Credentials", true);

    const { roomCode, guestName, guestID } =  req.query;

    // find
    db.collection("rooms").findOne({ roomCode: roomCode}, function(err, result) {
        if (err) throw err;

        // update
        result.guests[guestID] = guestName
    })

    // replace with updated data
    db.collection("rooms").updateOne({ roomCode: roomCode}, {$set: {guests: result.guests}})

    // send result
    res.send()
})

router.delete('/delete', (req, res) => {
    res.header("Access-Control-Allow-Credentials", true);

    const { roomCode, guestID } =  req.query;
    
    // find
    db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
        if (err) throw err;
        
        // remove
        delete result.guest[guestID]
    })
    
    // replace with updated data
    db.collection("rooms").updateOne({ roomCode: roomCode}, {$set: {guests: result.guests}})

    // send result
     res.send()
})


module.exports = router;