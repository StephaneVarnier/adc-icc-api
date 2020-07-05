const fetch = require("node-fetch");
const mongoClient = require('./my_generic_mongo_client')
const winston = require('winston')
const RULE = "chess"

const logConfiguration = {
  'transports': [
    new winston.transports.File({
      filename : './logs/fetchGames.log'
    })
  ]
}

const logger = winston.createLogger(logConfiguration);
//var user = "tiou"
var year = "2020"

const URL_LEADERS = "http://localhost:9997/archiduchess/leaders"
const URL_USERS = "http://localhost:9998/archiduchess/users"
const ONLINE_GAME = 'OnlineGame'

// const getDataAndPersist = async url => {
//   try {
//     const response = await fetch(url);
//     const json = await response.json();

//     fillMongoDbWithJson(json);
//   } catch (error) {
//     console.log(error);
//   }
// };



async function getData(url) {
  try {
    const response = await fetch(url);

    logger.info("response ====> ");
    logger.info(response.text());

    const json = await response.json();

    // logger.info("response.json() ====> ");
    // logger.info(response.body);

    return (json);

  } catch (error) {
    logger.info("error ===> " + error);
    
    return null;
  }
};

async function getDataAndPersist(url) {
  try {
    let json = await getData(url);
    logger.info(url)
    logger.info(json.games.length)
    if (json != null) fillMongoDbWithJson(json);
  }
  catch (error) {
    logger.info(error);
  }
}

async function getGames(user) {
  try {
    logger.info("user -> " + user)
    for (let month = 6; month > 0; month--) {

      let url = "https://api.chess.com/pub/player/" + user + "/games/" + year + "/0" + month;
      logger.info(url)
      await getDataAndPersist(url);

    }
  } catch (error) {
    logger.info(error);
  }
}

async function getPlayers() {
  try {
    let users = await getData(URL_USERS)
    let leaders = await getData(URL_LEADERS)
    let usernames = []
    for (let user of users) {
      usernames.push(user.username)
    }
    for (let leader of leaders) {
      usernames.push(leader.username)
    }
    return usernames
  } catch (error) {
    logger.info(error)
    return null;
  }
}

function fillMongoDbWithJson(jsonn) {

  for (i in jsonn.games) {

    if (jsonn.games[i].rules == RULE) {

      let jsonCorrected = prepareJson(jsonn.games[i])

      mongoClient.genericUpdateOne
        (
          ONLINE_GAME,
          jsonCorrected._id,
          jsonCorrected,
          function (err, gameId) {
            if (err) logger.info(`error on game : ${gameId} --> ${err}`)
          }
        )
    }
  }

}



function prepareJson(jsonn) {

  let jsonCorrected = jsonn
  jsonCorrected._id = (jsonn.url).toString().substr(32)
  delete jsonCorrected.time_class;
  jsonCorrected.playerWhite = jsonCorrected.white.username
  jsonCorrected.eloWhite = jsonCorrected.white.rating
  jsonCorrected.playerBlack = jsonCorrected.black.username
  jsonCorrected.eloBlack = jsonCorrected.black.rating
  delete jsonCorrected.white;
  delete jsonCorrected.black;
  delete jsonCorrected.end_time;
  delete jsonCorrected.fen;
  delete jsonCorrected.rated;
  delete jsonCorrected.rules;
  splittedPgn = (jsonCorrected.pgn).toString().split(" ")
  jsonCorrected.resultat = splittedPgn[splittedPgn.length - 1]
  jsonCorrected.opening = (((jsonCorrected.pgn).toString().split("\n"))[8].split("\""))[1].substr(31)
  jsonCorrected.date = ((jsonCorrected.pgn).toString().split("\n"))[2].substr(7, 10)
  return jsonCorrected
}

async function getAllGames() {

  try {
    const players = await getPlayers()
    for (let player of players) {
      getGames(player);
      //console.log(player)
    }
  } catch (error) {
    logger.info(error);
  }
}

getAllGames()

