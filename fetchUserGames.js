const fetch = require("node-fetch");
const mongoClient = require('./my_generic_mongo_client')
const winston = require('winston')
const RULE = "chess"
const BASE_URL = "https://api.chess.com/pub/player/"

var express = require('express');
var fetchGames = require('./fetchGames')


var myRouter = express.Router(); 


myRouter.route('/fetchUserGames/:user').get(function(req, res) {
    var user = req.params.user;
    fetchGames.getGames(user);
    res.send(user);
  })

exports.myRouter = myRouter




