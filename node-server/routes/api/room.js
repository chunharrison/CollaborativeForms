const express = require("express");
const router = express.Router();

const jwt = require('jsonwebtoken');

var db;
var url = "mongodb://localhost:27017";
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(url, {useUnifiedTopology: true}, function(err, database) {
    if(err) throw err;
    db = database.db('roomsdb'); // creating a connection to the database named 'roomsdb'
});

//Check to make sure header is not undefined, if so, return Forbidden (403)
const checkToken = (req, res, next) => {
    const header = req.headers['authorization'];
  
    if(typeof header !== 'undefined') {
        const bearer = header.split(' ');
        const token = bearer[1];
  
        req.token = token;
        next();
    } else {
        //If header is undefined return Forbidden (403)
        res.sendStatus(403)
    }
  }

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

router.post('/set-pilot-mode-status', checkToken, (req, res) => {  

    jwt.verify(req.token, process.env.JWT_PRIVATE_KEY, (err, authorizedData) => {
        if (err) {
            //If error send Forbidden (403)
            console.log('ERROR: Could not connect to the protected route');
            res.sendStatus(403);
        } else {
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
        }
    })
})

router.get('/get-num-max-guests', (req, res) => {
    const { roomCode } = req.query;

    db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
        if (err) throw err;
        res.send({numMaxGuests: result.numMaxGuests})
    })
})

router.post('/set-num-max-guests', checkToken, (req, res) => {
    jwt.verify(req.token, process.env.JWT_PRIVATE_KEY, (err, authorizedData) => {
        if (err) {
            //If error send Forbidden (403)
            console.log('ERROR: Could not connect to the protected route');
            res.sendStatus(403);
        } else {
            const { roomCode, newCapacity } = req.body;

            db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
                if (err) throw err;

                // update
                if (result !== null) {
                    // replace with updated data
                    db.collection("rooms").updateOne({ roomCode: roomCode}, {$set: {numMaxGuests: newCapacity}})
                }
            })
        }
    })
})

router.get('/get-download-option', (req, res) => {
    const { roomCode } = req.query;

    db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
        if (err) throw err;
        res.send({downloadOption: result.downloadOption})
    })
})

router.post('/set-download-option', checkToken, (req, res) => {
    jwt.verify(req.token, process.env.JWT_PRIVATE_KEY, (err, authorizedData) => {
        if (err) {
            //If error send Forbidden (403)
            console.log('ERROR: Could not connect to the protected route');
            res.sendStatus(403);
        } else {
            const { roomCode, newDownloadOption } = req.body;
            console.log('set-download-option', roomCode, newDownloadOption)
            db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
                if (err) throw err;

                // update
                if (result !== null) {
                    // replace with updated data
                    db.collection("rooms").updateOne({ roomCode: roomCode}, {$set: {downloadOption: newDownloadOption}})
                }
            })
        }
    })
})

router.get('/get-room-capacity-status', (req, res) => {
    const { roomCode } = req.query;

    db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
        if (err) throw err;
        console.log('/get-room-capacity-status', result.numMaxGuests, Object.keys(result.guests).length)
        const full = result.numMaxGuests <= Object.keys(result.guests).length
        console.log(full)
        res.send({roomFull: full})
    })
})


module.exports = router;