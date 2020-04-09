const mongo = require('mongodb');
var url = "mongodb://localhost/canvasdb";

mongo.MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log("Database created!");

    let dbo = db.db('canvasdb');
    dbo.createCollection('canvases', function(err, res) {
        if (err) throw err;
        console.log('Canvas collection created');
        db.close();
    })

});