const express = require("express");
const router = express.Router();


var db;
var url = "mongodb://localhost:27017";
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(url, {useUnifiedTopology: true}, function(err, database) {
    if(err) throw err;
    db = database.db('roomsdb'); // creating a connection to the database named 'roomsdb'
});


// router.get('/get-users', (req, res) => {

//     const { roomCode } = req.query;

//     db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
//         if (err) throw err;

//         let users = []
//         // TODO change the 5 to a variable
//         users.append(result.host.name)
//         users.append(Object.values(result.guests))

//         res.send({users})
//     })
// })

router.get('/get-host-id', (req, res) => {
    const { roomCode } = req.query;
    db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
        if (err) throw err;

        res.send({hostID: result.host.id})
    })
})

router.get('/get-host-name', (req, res) => {
    const { roomCode } = req.query;
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


module.exports = router;