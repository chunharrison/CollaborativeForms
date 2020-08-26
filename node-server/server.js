require('dotenv').config()
const express = require('express');
const app = express()
const http = require('http').Server(app)
const socketio = require('socket.io');
const CryptoJS = require("crypto-js");
var cors = require('cors');

const { generateGetUrl, generatePutUrl, deleteDocument } = require('./AWSPresigner');

var url = "mongodb://localhost:27017";
var MongoClient = require('mongodb').MongoClient;
var db;

// Users
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const passport = require("passport");

const users = require("./routes/api/users");
const guests = require("./routes/api/guests")
const room = require("./routes/api/room")
const emails = require("./routes/api/emails")
const demo = require("./routes/api/demo")
const payments = require("./routes/api/payments")
const products = require("./routes/api/products")

const Product = require("./models/Product");
const User = require("./models/User");

const stripe = require('stripe')(`${process.env.STRIPE_API_KEY}`);

//update product db in case there is a change in product lineup
async function updateProducts() {
    const products = await stripe.products.list({
        limit: 3,
    });
      products.data.forEach(product => 
          Product.findOneAndUpdate({ productId: product.id }, { 
              productId: product.id, 
              productName: product.name, 
              price: product.metadata.price, 
              priceId: product.metadata.priceId, 
              docCount: product.metadata.docCount, 
              guestCount: product.metadata.guestCount 
            })
          .then(result => {
              if (result === null) {
                const newProduct = new Product({
                    productId: product.id,
                    productName: product.name,
                    price: product.metadata.price,
                    priceId: product.metadata.priceId,
                    docCount: product.metadata.docCount,
                    guestCount: product.metadata.guestCount,
                });

                newProduct.save()
                    .then(res => console.log(res))
                    .catch(err => console.log(err));
              }
          })
      )
}

updateProducts();

// API JEW AUTHENTICATION
const jwt = require("jsonwebtoken");
const checkToken = (req, res, next) => { //Check to make sure header is not undefined, if so, return Forbidden (403)
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

// Bodyparser middleware
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use((req, res, next) => {
    if (req.originalUrl === '/api/payments/stripe-webhook') {
      next();
    } else {
      bodyParser.json()(req, res, next);
    }
});
app.use(express.static("client/build"));
// DB Config
const roomsdb = require("./config/keys").mongoURI;
// Connect to MongoDB
mongoose
  .connect(
    roomsdb,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));


// Passport middleware
app.use(passport.initialize());
// app.use(passport.session());
var session = require('express-session');
app.use(session({ secret: process.env.EXPRESS_SESSION_SECRET }));
// Passport config
require("./config/passport")(passport);
// Routes
app.use("/api/users", users);
app.use("/api/guests", guests);
app.use("/api/room", room);
app.use("/api/emails", emails);
app.use("/api/demo", demo);
app.use("/api/payments", payments);
app.use("/api/products", products);

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
app.get('/api/generate-get-url', (req, res) => {
    // jwt.verify(req.token, process.env.JWT_PRIVATE_KEY, (err, authorizedData) => {
    //     if (err) {
    //         //If error send Forbidden (403)
    //         console.log('ERROR: Could not connect to the protected route');
    //         res.sendStatus(403);
    //     } else {
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
    //     }
    // })
});
  
// PUT URL
app.get('/api/generate-put-url', checkToken, (req,res)=>{
    jwt.verify(req.token, process.env.JWT_PRIVATE_KEY, (err, authorizedData) => {
        if (err) {
            //If error send Forbidden (403)
            console.log('ERROR: Could not connect to the protected route');
            res.sendStatus(403);
        } else {
            // Both Key and ContentType are defined in the client side.
            // Key refers to the remote name of the file.
            // ContentType refers to the MIME content type, in this case image/jpeg
            const { Key, ContentType } =  req.query;
            generatePutUrl(Key, ContentType)
            .then(putURL => {
                res.send({putURL});
            })
            .catch(err => {
                res.send(err);
            });
        }
    })
});

app.get('/api/get-spaces-left', (req, res) => {
    res.header("Access-Control-Allow-Credentials", true);

    db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
        if (err) throw err;

        if (result !== null && Object.keys(result.guests).length < result.numMaxGuests) {
            res.send({spaceAvailable: true})
        } else {
            res.send({spaceAvailable: false})
        }
    })
})

app.post('/api/create-room', checkToken, async (req,res)=>{
    jwt.verify(req.token, process.env.JWT_PRIVATE_KEY, async (err, authorizedData) => {
        if (err) {
            //If error send Forbidden (403)
            console.log('ERROR: Could not connect to the protected route');
            res.sendStatus(403);
        } else {
            const user = await User.findOne({'_id': req.body.userId});
            let timestamp = Math.floor(new Date().getTime() / 1000);
            let product = user.product;
            let docCount = 1;
            let guestCount = 1;

            if (user.subscription && user.expire && user.expire > timestamp) {
                product = await Product.findOne({productId: user.subscription.plan.product})
            }

            if (product !== 'free' && user.expire && user.expire > timestamp) {
                docCount = product.docCount;
                guestCount = product.guestCount;
            }
            const rooms = await db.collection("rooms").find({'host.id': user.id, 'demo': {$exists: false}}).toArray();

            if (rooms.length >= docCount) {
                return res.status('400').send({message: 'You have reached your document limit'})
            }
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
                numMaxGuests: guestCount, 
                downloadOption: 'Both',
                pilotModeActivated: false,
                invitationCode: ''
            }

            req.body.objects.forEach((object) => {
                let currentPageSignatures = get(roomData.signatures, object[1].toString(), null)
                let objectList = []
                if (currentPageSignatures !== null) {
                    // decryption
                    let bytes  = CryptoJS.AES.decrypt(currentPageSignatures, process.env.ENCRYPT_KEY);
                    objectList = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                }
                objectList.push(object[0]);
                // encrypt the list again before updating the database
                let encrypted = CryptoJS.AES.encrypt(JSON.stringify(objectList), process.env.ENCRYPT_KEY).toString();
                // update the database
                roomData.signatures[object[1].toString()] = encrypted;
            })

            db.collection("rooms").insertOne(roomData, function(err, response) {
                if(err) throw err;
                res.send()
            })
        }
    })
});

app.get('/api/get-owners-documents', checkToken, (req,res)=>{
    jwt.verify(req.token, process.env.JWT_PRIVATE_KEY, (err, authorizedData) => {
        if (err) {
            //If error send Forbidden (403)
            console.log('ERROR: Could not connect to the protected route');
            res.sendStatus(403);
        } else {
            db.collection("rooms").find({'host.id': req.query.owner, 'demo': {$exists: false}}).sort({_id: -1})
            .project({roomCode:1, fileName:1, _id:0})
            .toArray(function (err, result) {
                res.send(result);
            })
        }
    })
});

app.delete('/api/delete-document', checkToken, function(req, res) {
    jwt.verify(req.token, process.env.JWT_PRIVATE_KEY, (err, authorizedData) => {
        if (err) {
            //If error send Forbidden (403)
            console.log('ERROR: Could not connect to the protected route');
            res.sendStatus(403);
        } else {
            db.collection("rooms").deleteOne({roomCode: req.body.roomCode}, function(err, obj) {
                if (err) throw err;
                deleteDocument(`${req.body.roomCode}.pdf`);
                deleteDocument(`${req.body.roomCode}.jpeg`);
                console.log("1 document deleted");
                res.send();
            });
        }
    })
});

app.put('/api/edit-document-name', checkToken, function(req, res) {
    jwt.verify(req.token, process.env.JWT_PRIVATE_KEY, (err, authorizedData) => {
        if (err) {
            //If error send Forbidden (403)
            console.log('ERROR: Could not connect to the protected route');
            res.sendStatus(403);
        } else {
            db.collection("rooms").deleteOne({roomCode: req.body.roomCode}, function(err, obj) {
                if (err) throw err;
                deleteDocument(`${req.body.roomCode}.pdf`);
                deleteDocument(`${req.body.roomCode}.jpeg`);
                console.log("1 document deleted");
                res.send();
            });
        }
    })
});

app.get("/api/auth/google", passport.authenticate('google', { scope: ["profile", "email"] }));

app.get("/api/auth/google/callback", passport.authenticate("google", 
{ failureRedirect: `${process.env.FRONTEND_ADDRESS}/`, session: false }),
    function(req, res) {
        //   var token = req.user.token;
        // TODO: HARRISON
        // check if we need the user.token that we receive after logging into google

        // Create JWT Payload
        const payload = {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            customerId: req.user.customerId
        };
        // Sign token
        jwt.sign(
            payload,
            process.env.JWT_PRIVATE_KEY,
            { expiresIn: '24h' },
            (err, token) => {
                // res.json({
                //     success: true,
                //     token: "Bearer " + token
                // });
                res.redirect(`${process.env.FRONTEND_ADDRESS}/login-callback?token=` + token);

            }
        );
    }
);

app.get('/api/auth/facebook', passport.authenticate('facebook', { scope: ["email"] }));

app.get('/api/auth/facebook/callback', passport.authenticate('facebook', { 
    // successRedirect: '/account-portal', 
    failureRedirect: `${process.env.FRONTEND_ADDRESS}/` }), 
    function(req, res) {
        if (req.user.error === 'no email') {
            res.redirect(`${process.env.FRONTEND_ADDRESS}/facebook-email-error`);
        }
        //   var token = req.user.token;
        // TODO: HARRISON
        // check if we need the user.token that we receive after logging into google

        // Create JWT Payload
        const payload = {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            customerId: req.user.customerId
        };
        // Sign token
        jwt.sign(
            payload,
            process.env.JWT_PRIVATE_KEY,
            { expiresIn: '24h' },
            (err, token) => {
                // res.json({
                //     success: true,
                //     token: "Bearer " + token
                // });
                res.redirect(`${process.env.FRONTEND_ADDRESS}/login-callback?token=` + token);

            }
        );
    }
);

app.get('/api/auth/linkedin', passport.authenticate('linkedin'));
  
app.get('/api/auth/linkedin/callback', 
    passport.authenticate('linkedin', {
        failureRedirect: `${process.env.FRONTEND_ADDRESS}/` 
    }),
    function(req, res) {

    // Create JWT Payload
    const payload = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        customerId: req.user.customerId
    };
    // Sign token
    jwt.sign(
        payload,
        process.env.JWT_PRIVATE_KEY,
        { expiresIn: '24h' },
        (err, token) => {
            // res.json({
            //     success: true,
            //     token: "Bearer " + token
            // });
            // console.log(`${process.env.FRONTEND_ADDRESS}login-callback?token=` + token)
            res.redirect(`${process.env.FRONTEND_ADDRESS}/login-callback?token=` + token);

        }
    );
}
);

//Bind socket.io socket to http server
const io = socketio(http);

function get(object, key, default_value) {
    var result = object[key];
    return (typeof result !== "undefined") ? result : default_value;
}

//define socket.io behavior when users connect
io.on('connection', (socket)=>{

    //check if database has canvas if not request it, if it does send it to users
    socket.emit('join');
    socket.on('join', ({ username, roomCode, guestID, isHost }) => {
        socket.join(roomCode);

        console.log(`${username} just joined ${roomCode}`)
        db.collection("rooms").findOne({ roomCode: roomCode }, function(err, result) {
            if (err) throw err;  

            // database found under given roomCode (the roomCode that the person entered when joining the room)
            // (the room exists)
            if (result !== null) {

                // update the guestlist
                if (!isHost) {
                    result.guests[guestID] = username
                    socket.to(roomCode).emit('updateGuestList', {currentGuests: result.guests})
                    db.collection("rooms").updateOne({ roomCode: roomCode }, {$set: { guests: result.guests }});
                } 

                if (result.pilotModeActivated) {
                    console.log('pilotModeUserConnected')
                    socket.emit('pilotModeUserConnected')
                }

                socket.emit('updateGuestList', {currentGuests: result.guests});
                socket.emit('updateHighlights', result.highlights);
            } 
            
            // could not find the database under the given roomCode
            // (the room does not exist)
            else {
                socket.emit('invalidRoomCode')
            }
        });

        // //force send clients canvas that are missing it
        // socket.on('missingCanvas', (data) => {
        //     socket.emit('canvasSetup', canvasData);
        // })

        // person requests the signature objects that are on the page
        // the callback function requires the signature objects
        // this happens when somebody joins the room and renders the page for the first time
        socket.on('getCurrentPageSignatures', (pageNum, callback) => {
            db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
                if (err) throw err;

                // the list of signatures for that page from the database (encrypted)
                if (result !== null) {
                    let currentPageSignatures = get(result.signatures, pageNum.toString(), null)
                    let decryptedSignatureObjectList = []
                    if (currentPageSignatures !== null) {
                        // decryption
                        let bytes  = CryptoJS.AES.decrypt(currentPageSignatures, process.env.ENCRYPT_KEY);
                        decryptedSignatureObjectList = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                    }
                    callback(decryptedSignatureObjectList);
                }
            })
        })

        socket.on('getCurrentPageHighlights', (pageNum, callback) => {
            db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
                if (err) throw err;

                if (result !== null) {
                    let currentPageHighlights = {};

                    if (result.highlights[pageNum]) {
                        currentPageHighlights = result.highlights[pageNum];
    
                    }
                    callback(currentPageHighlights);
                }
            })
        })

        socket.on("addIn", (pageData) => {
            const { pageNum, newSignatureObjectJSON } = pageData
            
            db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
                if (err) throw err;

                if (result !== null) {
                    // the list of signatures for that page from the database (encrypted)
                    let currentPageSignatures = get(result.signatures, pageNum.toString(), null)
                    let decryptedSignatureObjectList = []
                    if (currentPageSignatures !== null) {
                        // decrypt
                        let bytes  = CryptoJS.AES.decrypt(currentPageSignatures, process.env.ENCRYPT_KEY);
                        decryptedSignatureObjectList = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                    }

                    // add the new signature to the list
                    decryptedSignatureObjectList.push(newSignatureObjectJSON);

                    // encrypt the list again before updating the database
                    let encrypted = CryptoJS.AES.encrypt(JSON.stringify(decryptedSignatureObjectList), process.env.ENCRYPT_KEY).toString();
                    // update the database
                    result.signatures[pageNum.toString()] = encrypted;
                    db.collection("rooms").updateOne({ roomCode: roomCode}, {$set: {signatures: result.signatures}})

                    // emit the changes to other users in the room
                    socket.to(roomCode).emit('addOut', pageData)
                }
            })
        })

        socket.on('editIn', (pageData) => {
            const {pageNum, modifiedSignatureObjectJSON} = pageData

            db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
                if (err) throw err;

                if (result !== null) {
                    // the list of signatures for that page from the database (encrypted)
                    let currentPageSignatures = get(result.signatures, pageNum.toString(), null)
                    let decryptedSignatureObjectList = []
                    if (currentPageSignatures !== null) {
                        // decrypt
                        let bytes  = CryptoJS.AES.decrypt(currentPageSignatures, process.env.ENCRYPT_KEY);
                        decryptedSignatureObjectList = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                    }

                    // remove the old signature from the list (before the modification)
                    decryptedSignatureObjectList.forEach(function(currentSignatureObjectJSON) {
                        if (modifiedSignatureObjectJSON.id === currentSignatureObjectJSON.id) {
                            decryptedSignatureObjectList.splice( decryptedSignatureObjectList.indexOf(currentSignatureObjectJSON), 1 );
                        }
                    })

                    // add the new signature to the list (after the modification)
                    decryptedSignatureObjectList.push(modifiedSignatureObjectJSON);

                    // encrypt the list again before updating the database
                    let encrypted = CryptoJS.AES.encrypt(JSON.stringify(decryptedSignatureObjectList), process.env.ENCRYPT_KEY).toString();
                    // update the database
                    result.signatures[pageNum.toString()] = encrypted
                    db.collection("rooms").updateOne({ roomCode: roomCode}, {$set: {signatures: result.signatures}})

                    // emit the changes to other users in the room
                    socket.to(roomCode).emit('editOut', pageData)
                }
            })
        })

        socket.on('deleteIn', (pageData) => {
            console.log('delete coming in')
            const {pageNum, removedSignatureObjectJSON} = pageData

            db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
                if (err) throw err;

                if (result !== null) {
                    // the list of signatures for that page from the database (encrypted)
                    let currentPageSignatures = get(result.signatures, pageNum.toString(), null)
                    let decryptedSignatureObjectList = []
                    if (currentPageSignatures !== null) {
                        // decrypt
                        let bytes  = CryptoJS.AES.decrypt(currentPageSignatures, process.env.ENCRYPT_KEY);
                        decryptedSignatureObjectList = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                    }

                    // remove the old signature from the list (before the modification)
                    decryptedSignatureObjectList.forEach(function(currentSignatureObjectJSON) {
                        if (removedSignatureObjectJSON.id === currentSignatureObjectJSON.id) {
                            decryptedSignatureObjectList.splice( decryptedSignatureObjectList.indexOf(currentSignatureObjectJSON), 1 );
                        }
                    })

                    // encrypt the list again before updating the database
                    let encrypted = CryptoJS.AES.encrypt(JSON.stringify(decryptedSignatureObjectList), process.env.ENCRYPT_KEY).toString();
                    // update the database
                    result.signatures[pageNum.toString()] = encrypted
                    db.collection("rooms").updateOne({ roomCode: roomCode}, {$set: {signatures: result.signatures}})

                    // emit the changes to other users in the room
                    socket.to(roomCode).emit('deleteOut', pageData)
                }
            })
        })

        socket.on("highlightIn", (pageData) => {
            db.collection("rooms").findOne({ roomCode: roomCode }, function(err, result) {

                if (result !== null) {
                    let highlights = result.highlights;
                    let highlight = pageData.highlight;
                    highlights[pageData.pageNum] = {...highlights[pageData.pageNum], [pageData.id]: highlight};
                    db.collection("rooms").updateOne({ roomCode: roomCode}, {$set: {highlights: highlights}}, function(err,result) {
                        socket.to(roomCode).emit('highlightOut', {pageNum: pageData.pageNum, id: pageData.id, values: highlights[pageData.pageNum], text: pageData.highlight[1]})
                    })        
                }
            })
        })

        socket.on("commentIn", (pageData) => {
            db.collection("rooms").findOne({ roomCode: roomCode }, function(err, result) {

                if (result !== null) {
                    let highlights = result.highlights;
                    let comment = pageData.comment;
                    highlights[pageData.pageNum][pageData.id][2] = comment;
                    db.collection("rooms").updateOne({ roomCode: roomCode}, {$set: {highlights: highlights}}, function(err,result) {
                        socket.to(roomCode).emit('commentOut', pageData)
                    })        
                }
            })
        })

        socket.on("commentDelete", (pageData) => {

            if (result !== null) {
                db.collection("rooms").findOne({ roomCode: roomCode }, function(err, result) {
                    let highlights = result.highlights;
                    delete highlights[pageData.pageNum][pageData.id];
                    db.collection("rooms").updateOne({ roomCode: roomCode}, {$set: {highlights: highlights}}, function(err,result) {
                        socket.to(roomCode).emit('commentDeleteOut', pageData)
                    })        
                })
            }
        })

        // Pilot Mode //////////////////////////////////////////////////
        socket.on("pilotModeRequested", (requestData) => {
            // const { requesterUsername, requesterSocketID, currNumUsers } = requestData
            // emit to everyone else in the room to either accept or decline the request
            console.log("pilotModeRequested", requestData)
            socket.to(roomCode).emit('confirmPilotMode', requestData)
        })


        socket.on("pilotModeRequestCallback", (callbackData) => {
            const {confirmed, confirmingUserGuestID, requesterSocketID } = callbackData
            console.log("pilotModeRequestCallback", confirmed, confirmingUserGuestID, requesterSocketID)
            if (confirmed) {
                socket.to(requesterSocketID).emit('pilotModeUserAccepted', confirmingUserGuestID)
            } else {
                socket.to(requesterSocketID).emit("pilotModeDeclined", confirmingUserGuestID)
            }
        })

        socket.on('pilotModeActivated', () => {
            socket.to(roomCode).emit('pilotModeActivated')
        })

        socket.on("sendScrollPercent", (scrollPercent) => {
            socket.to(roomCode).emit("setScrollPercent", scrollPercent)
        })

        socket.on("pilotModeStopped", () => {
            socket.to(roomCode).emit("pilotModeStopped")
        })

        socket.on("setDownloadOption", (newDownloadOption) => {
            db.collection("rooms").updateOne({ roomCode: roomCode}, {$set: {downloadOption: newDownloadOption}})
            socket.to(roomCode).emit("updateDownloadOption", newDownloadOption)
        })


        socket.on("reconnect", () => {
            console.log('reconnect')
            socket.emit("reconnect")
        })

        socket.on("disconnect", () => {
            console.log(`${username} just left ${roomCode}`);
            
            // update the list of users in the database
            db.collection("rooms").findOne({roomCode: roomCode}, function(err, result) {
                if (err) throw err;
                if (result !== null & !isHost) {
                    console.log("removing guest")
                    // remove the first occurence of the username from database
                    delete result.guests[guestID]

                    // broadcast to every other users in the room that this user joined
                    // with the newly updated list of users 
                    // socket.to(roomCode).emit('userDisconnected', result.users, username);
                    socket.to(roomCode).emit('updateGuestList', { currentGuests: result.guests });

                    db.collection("rooms").updateOne({ roomCode: roomCode }, {$set: { guests: result.guests }});
                }
            })
            // socket.to(roomCode).emit('guestDisconnected', guestID);
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