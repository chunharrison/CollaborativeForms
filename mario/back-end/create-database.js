var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "marioh",
  password: "ratchetwalgreens"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("CREATE DATABASE document-contents", function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
});