const fetch = require("node-fetch");
const mongoClient = require('./my_generic_mongo_client')
const CATEGORY = "live_rapid"
const url = "https://api.chess.com/pub/leaderboards";


const getData = async url => {
  try {
    const response = await fetch(url);
    const json = await response.json();

    fillMongoDbWithJson(json);
  } catch (error) {
    console.log(error);
  }
};

function fillMongoDbWithJson(jsonn) {
    
    for (i in jsonn.live_rapid) {
       
        let jsonCorrected = prepareJson(jsonn.live_rapid[i])
       
        mongoClient.genericUpdateOne
        (
            'Leader',
            jsonCorrected._id,
            jsonCorrected,
            function(err,playerId) {
                 if (err) console.log(`error on game : ${playerId} --> ${err}`)
                }
        )

    }

}

function prepareJson(jsonn) {
    
        let jsonCorrected =  {};

        jsonCorrected._id = jsonn.player_id
        jsonCorrected.username = jsonn.username
        jsonCorrected.name = jsonn.name
        jsonCorrected.score = jsonn.score
        jsonCorrected.title = jsonn.title
        jsonCorrected.avatar = jsonn.avatar


        return jsonCorrected
}

getData(url);