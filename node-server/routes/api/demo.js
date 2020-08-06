const express = require("express");
const router = express.Router();
var cors = require('cors');
const jwt = require("jsonwebtoken");

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

router.post('/create-demo-room', checkToken, (req, res) => {
    jwt.verify(req.token, process.env.JWT_PRIVATE_KEY, (err, authorizedData) => {
        if (err) {
            //If error send Forbidden (403)
            console.log('ERROR: Could not connect to the protected route');
            res.sendStatus(403);
        } else {
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
        }
    })
})

router 


module.exports = router;