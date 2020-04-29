const mongo = require('mongodb');
var url = "mongodb://localhost/roomsdb";

mongo.MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log("Database created!");

    let dbo = db.db('roomsdb');
    dbo.createCollection('rooms', function(err, res) {
        if (err) throw err;
        setCreatedAt();
        db.close();
    })

});

function setCreatedAt() {
    var dbcollection;

    mongo.MongoClient.connect(url, {useUnifiedTopology: true}, function(err, database) {
        if(err) throw err;
        dbcollection = database.db('roomsdb'); // creating a connection to the database named 'roomsdb'
        dbcollection.collection("rooms").createIndex( { "createdAt": 1 }, { expireAfterSeconds: 86400 } );
        console.log('Expire timer created');
    });
}