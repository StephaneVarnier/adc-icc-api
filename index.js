const cron = require("node-cron")
const fetchUserGames = require('./fetchUserGames.js')
const express = require('express')
let shell = require("shelljs")

var app = express();
var port = 3000;
var host = 'localhost'

  app.listen(port, host, () => {
    console.log('Server started on '+host+":"+port)
  })

  app.use(function(req, res, next) {  
    res.header("Access-Control-Allow-Origin", "*"); //"*" ou "xy.com , ..."  
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS"); //default: GET, ...  
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept , Authorization"); 
    next(); 
});

  app.use(fetchUserGames.myRouter)


cron.schedule("0 0 0 1 * *", function () {
    console.log("Leaderboard scheduler running...")
    if (shell.exec("node fetchLeaderboard.js").code !== 0) {
        console.log("error with cron task Leaderboard")
    }

});


cron.schedule("0 0 * * * *", function () {
    console.log("Games scheduler running...")
    if (shell.exec("node fetchGames.js").code !== 0) {
        console.log("error with cron task Games")
    }

});






