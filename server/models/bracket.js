let express = require("express");
let router = express.Router();
let mongoose = require("mongoose");

//create a model class
let bracketModel = mongoose.Schema(
  {
    tournamentName: String,
    status: String,
    gameType: String,
    players: Number,
    description: String,
    startdate: Date,
    enddate: Date,
    userid: String,
    teams: Array,
    scoreG1: Array,
    scoreG2: Array,
    scoreG3: Array,
    scoreG4: Array, //might need a winner array?
    winner: Array,
  },

  {
    collection: "bracketsample",
  }
);

//bracketmodel to create new bracket more powerful than just class
module.exports = mongoose.model("Bracket", bracketModel);
