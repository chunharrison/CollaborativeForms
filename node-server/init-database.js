const mongo = require('mongodb');
var url = "mongodb://localhost/canvasdb";

mongo.MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log("Database created!");

    let dbo = db.db('canvasdb');
    dbo.createCollection('canvases', function(err, res) {
        if (err) throw err;
        console.log('Canvas collection created');
        setCreatedAt();
        db.close();
    })

});

function setCreatedAt() {
    var dbcollection;

    mongo.MongoClient.connect(url, {useUnifiedTopology: true}, function(err, database) {
        if(err) throw err;
        dbcollection = database.db('canvasdb'); // creating a connection to the database named 'canvasdb'
        dbcollection.collection("canvases").createIndex( { "createdAt": 1 }, { expireAfterSeconds: 86400 } );
        console.log('Expire timer created');
    });
}