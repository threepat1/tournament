let express = require("express");
let router = express.Router();
let mongoose = require("mongoose");

let jwt = require("jsonwebtoken");
//create reference to the model (dbschema )
let Bracket = require("../models/bracket");
let moment = require("moment");
const { contains } = require("jquery");
let dateToday = new Date().toISOString().slice(0, 10);

//display tournament info
module.exports.displayBracketList = (req, res, next) => {//display teamlist
  Bracket.find((err, bracketList) => {
    var startDate = moment(bracketList.startdate).utc().format("YYYY-MM-DD");
    var endDate = moment(bracketList.enddate).utc().format("MMMM Do YY");
    if (err) {
      return console.error(err);
    } else {
      res.render("bracket/teamlist", {
        title: "Bracket",
        BracketList: bracketList,
        User: req.user,
        enddate: endDate,
        displayName: req.user ? req.user.displayName : "",
      });
      //render bracket.ejs and pass title and Bracketlist variable we are passing bracketList object to BracketList property
    }
  });
};

module.exports.addpage = (req, res, next) => {//add tournament
  res.render("bracket/createPage", {
    title: "Add TeamBracket",
    displayName: req.user ? req.user.displayName : "",
  });
};

module.exports.addprocesspage = (req, res, next) => {//place created tournament into db
  let len = req.body.players;
  let tempStatus = "";
  if (req.body.startdate <= dateToday && req.body.enddate >= dateToday) {
    tempStatus = "Active";
  } else if (req.body.enddate < dateToday) {
    tempStatus = "Complete";
  } else {
    tempStatus = "In-Active";
  }
  console.log(len);
  let newbracket;
  if (len == 16) {
    newbracket = Bracket({
      //16
      tournamentName: req.body.tournamentName,
      status: tempStatus,
      gameType: req.body.gameType,
      players: req.body.players, //len
      description: req.body.description,
      teams: req.body.teams,
      scoreG1: [],
      scoreG2: [],
      scoreG3: [],
      scoreG4: [],
      winner: [
        "Game 1",
        "Game 1",
        "Game 1",
        "Game 1",
        "Game 1",
        "Game 1",
        "Game 1",
        "Game 1",
        "Game 2",
        "Game 2",
        "Game 2",
        "Game 2",
        "Game 3",
        "Game 3",
        "Final",
      ], //required defualt values for the winner array
      startdate: req.body.startdate,
      enddate: req.body.enddate,
      userid: req.user._id,
      //scoreG1: req.body.players//this adds players to scoreG1
    });
  } else if (len == 8) {
    newbracket = Bracket({
      //8
      tournamentName: req.body.tournamentName,
      status: tempStatus,
      gameType: req.body.gameType,
      players: req.body.players,
      description: req.body.description,
      teams: req.body.teams,
      scoreG1: [],
      scoreG2: [],
      scoreG3: [],
      scoreG4: [],
      winner: [
        "Game 1",
        "Game 1",
        "Game 1",
        "Game 1",
        "Game 2",
        "Game 2",
        "Final",
      ],
      startdate: req.body.startdate,
      enddate: req.body.enddate,
      userid: req.user._id,
    });
  }
  Bracket.create(newbracket, (err, Bracket) => {
    if (err) {
      console.log(err);
      res.end(err);
    } else {
      res.redirect("/bracket-list");
      console.log(newbracket);
    }
  });
};

module.exports.addPlayerpage = async (req, res, next) => {//show display for add player
  let id = req.params.id; //id of actual object
  Bracket.findById(id, (err, bracketoshow) => {
    if (err) {
      console.log(err);
      res.end(err);
    } else {
      //show the edit view
      res.render("bracket/list", {
        title: "Tournament Bracket",
        moment: moment,
        bracket: bracketoshow,
        user: req.user,
        displayName: req.user ? req.user.displayName : "",
      });
      console.log(bracketoshow);
    }
  });
};

module.exports.completeBracketEarly = (req, res, next) => {//process early finish of game
  let id = req.params.id; //if a winner has been decided before the end date of the tournament this can mark it as complete
  console.log("test running");
  let tempt = Bracket({//this function always turns arrays to null for some reason. need to put error handling like process page has
    _id: id,
    status: "Complete",
    teams: req.body.teams,
    scoreG1: req.body.t1,
    scoreG2: req.body.t2,
    scoreG3: req.body.t3,
    scoreG4: req.body.t4,
    winner: req.body.w,
  });
  console.log(tempt);
  Bracket.updateOne({ _id: id }, tempt, (err) => {
    if (err) {
      console.log(err);
      res.end(err);
    } else {
      console.log("Bracket updated to complete");
      res.redirect("/bracket-list/showall/" + id);
    }
  });
};

module.exports.displayeditpage = (req, res, next) => {//display edit page
  let id = req.params.id; //id of actual object
  Bracket.findById(id, (err, bracketoedit) => {
    var startDate = moment(bracketoedit.startdate).utc().format("YYYY-MM-DD");
    var endDate = moment(bracketoedit.enddate).utc().format("YYYY-MM-DD");

    if (err) {
      console.log(err);
      res.end(err);
    } else {
      //show the edit view
      res.render("bracket/edit", {
        title: "Edit Bracket",
        bracket: bracketoedit,
        startdate: startDate,
        enddate: endDate,
        user: req.user,
        displayName: req.user ? req.user.displayName : "",
      });
    }
  });
};

module.exports.processingeditpage = (req, res, next) => {//process edit page
  let len = req.body.players;
  let id = req.params.id; //id of actual object
        
  let updatebracket;
  if (len == 16) {
   updatebracket = Bracket({
    _id: id,
    tournamentName: req.body.tournamentName,
    gameType: req.body.gameType,
    players: req.body.players,
    description: req.body.description,
    teams: req.body.teams,
    userid: req.user._id,
    startdate: req.body.startdate,
    enddate: req.body.enddate,
    winner: [
        "Game 1",
        "Game 1",
        "Game 1",
        "Game 1",
        "Game 1",
        "Game 1",
        "Game 1",
        "Game 2",
        "Game 2",
        "Game 2",
        "Game 2",
        "Game 3",
        "Game 3",
        "Final",
    ],
  });
} else if (len == 8) {
 updatebracket = Bracket({
    _id: id,
    tournamentName: req.body.tournamentName,
    gameType: req.body.gameType,
    players: req.body.players,
    description: req.body.description,
    teams: req.body.teams,
    userid: req.user._id,
    startdate: req.body.startdate,
    enddate: req.body.enddate,
    winner: [
      "Game 1",
      "Game 1",
      "Game 1",
      "Game 1",
      "Game 2",
      "Game 2",
      "Final",
    ],
  });
}

  Bracket.updateOne({ _id: id }, updatebracket, (err) => {
    if (err) {
      console.log(err);
      res.end(err);
    } else {
      //refresh the bracket list
      //bracket-list/show/:id
      //'back' refresh
      //req.get('referer') also refresh
      res.redirect("/bracket-list/show/" + id);
    }
  });
};

module.exports.deletepage = (req, res, next) => {//delete record
  let id = req.params.id;
  console.log("Deleting at id: " + id);
  Bracket.deleteOne({ _id: id }, (err) => {
    //remove
    if (err) {
      console.log(err);
      res.end(err);
    } else {
      //refresh bracket list
      res.redirect("/bracket-list");
    }
  });
};

module.exports.showTournamentpage = async (req, res, next) => {//final score display page
  let id = req.params.id; //id of actual object
  //console.log(id);
  Bracket.findById(id, (err, bracketoshow) => {
    if (err) {
      console.log(err);
      res.end(err);
    } else {
      //show the edit view
      res.render("bracket/anonymous", {
        title: "Tournament Bracket",
        bracket: bracketoshow,
        user: req.user,
        displayName: req.user ? req.user.displayName : "",
      });
      console.log(bracketoshow);
    }
  });
};

module.exports.scoreDisplayPage = (req, res, next) => {//displays scores for specific given game
  console.log("scoreDisplayPage runs");
  let tempid = req.params.id;
  let id = 0; //_id of the tourney
  let id2 = 0; //Game number
  let id3 = 0; //round number
  let idArr,
    player = 0;
  if (tempid.includes("+")) {
    idArr = tempid.split("+");
    player = 8;
  } else if (tempid.includes("-")) {
    idArr = tempid.split("-");
    player = 16;
  }
  id = idArr[0]; //gets id
  id2 = idArr[1]; //gets game #
  if (id2 <= Math.ceil(player / 2)) {
    //gets round #, scalable
    id3 = 1;
  } else if (id2 <= Math.ceil(player / 2) + Math.ceil(player / 4)) {
    id3 = 2;
  } else if (
    id2 <=
    Math.ceil(player / 2) + Math.ceil(player / 4) + Math.ceil(player / 8)
  ) {
    id3 = 3;
  } else {
    id3 = 4;
  }
  Bracket.findById(id, (err, bracketogame) => {
    if (err) {
      console.log(err);
      res.end(err);
    } else {
      //show the edit view
      res.render("bracket/display", {
        title: "Display Game", //title can be changed, should be changed?
        bracket: bracketogame,
        id: id, //_id of the tourney
        id2: id2, //Game number
        id3: id3, //round number
        player: player, //number of total players
        displayName: req.user ? req.user.displayName : id2,
      });
    }
  });
};

module.exports.scoreProcessPage = async (req, res, next) => {//calculates the winner and places that team into the winner array
  let tempid = req.params.id;
  let idArr;
  if (tempid.includes("+")) {
    idArr = tempid.split("+");
  } else if (tempid.includes("-")) {
    idArr = tempid.split("-");
  } else {
    console.log("url split error");
  }
  id = idArr[0];
  let id3 = req.body.t;
  //console.log("Currently processing game: " + id3);
  if (id3 == 1) {
    //round changes which score array is required
    var scorVal = req.body.t1;
  } else if (id3 == 2) {
    var scorVal = req.body.t2; //score is put into the variable as a long string of ' seperated values
  } else if (id3 == 3) {
    var scorVal = req.body.t3;
  } else {
    var scorVal = req.body.t4;
  }
  var winVal3 = await Bracket.find({ _id: id }, { winner: 1 }); //could do _id: 0 to make code clearer, but would require too many changes
  //winVal3 -> winVal is the processing of the winners array
  //scoreVal -> scoreVal3 is the processing of the current round score array
  winVal3 = winVal3.toString(); //these might be causing comparison problems, again too tricky to change
  scorVal = scorVal.toString();
  let scorVal2 = scorVal.split(","); //score is split into an array
  scorVal2.slice(
    scorVal2.indexOf("'"),
    scorVal2.lastIndexOf("'", scorVal2.indexOf("'") + 1)
  ); //the actual values are taken from the score array

  let winVal2 = winVal3.split(",");
  for (var c = 1; c < winVal2.length; c++) {
    //removes line breaks for the whole winVal array
    while (winVal2[c].includes("\n")) {
      //console.log("before" + winVal2[c]);
      //console.log("location: " + winVal2[c].indexOf("\n"));
      //console.log("length: " + winVal2[c].length);
      if (winVal2[c].indexOf("\n") > 1) {
        //console.log("slice1: "+ winVal2[c].slice(0, (winVal2[c].indexOf("\n"))));//-1
        //console.log("slice2: "+ winVal2[c].slice(((winVal2[c].indexOf("\n"))+1/*+1*/), winVal2[c].length));
        winVal2[c] =
          winVal2[c].slice(0, winVal2[c].indexOf("\n") /*-1*/) +
          winVal2[c].slice(
            winVal2[c].indexOf("\n") + 1 /*+1*/,
            winVal2[c].length
          );
      } else {
        winVal2[c] = winVal2[c].slice(
          winVal2[c].indexOf("\n") + 1 /*+2*/,
          winVal2[c].length
        );
      }
    }
    //error handling to remove ][ that can apear inside ' under certain conditions
    while (winVal2[c].includes("[") || winVal2[c].includes("]")) {
      if (winVal2[c].includes("[")) {
        winVal2[c] =
          winVal2[c].slice(0, winVal2[c].indexOf("[")) +
          winVal2[c].slice(winVal2[c].indexOf("[") + 1, winVal2[c].length);
      } else if (winVal2[c].includes("]")) {
        winVal2[c] =
          winVal2[c].slice(0, winVal2[c].indexOf("]")) +
          winVal2[c].slice(winVal2[c].indexOf("]") + 1, winVal2[c].length);
      }
    }
  }
  if (winVal2[1].includes("winner:")) {
    //error handling, to fix a bug
    winVal2[1] = winVal2[1].slice(
      7 + winVal2[1].indexOf("winner:"),
      winVal2[1].length
    );
    //console.log("Error, contained 'winner: [' now reads: " + winVal2[1]);
  }
  let winVal = [];
  let scorVal3 = [];
  for (var c = 0; c < scorVal2.length; c++) {
    //starts at 1 because first line is _id
    if (scorVal2[c] !== undefined) {
      // || ((scorVal2[(c-1)].length)>0)){
      scorVal3[c] = scorVal2[c]; //.slice(1,-1).trim();
    }
  }
  for (var c = 0; c < winVal2.length; c++) {
    if (winVal2[c] !== undefined) {
      //trims out the values in the winval array
      if (winVal2[c].includes("'")) {
        //console.log(c + " w ' 1: " + winVal2[c].indexOf("'") + " w ' 2: " + winVal2[c].lastIndexOf("'"));
        winVal2[c] = winVal2[c].trim();
        winVal[c - 1] = winVal2[c].slice(
          winVal2[c].indexOf("'") + 1,
          winVal2[c].lastIndexOf("'")
        );
      } else if (c != 0) {
        winVal[c - 1] = winVal2[c];
      }
      if (winVal2[c] == "" && c != 0) {
        winVal[c - 1] = "0"; //error handling
        console.log("is null failsafe triggered");
      }
    }
  }
  for (var c = 0; c < winVal.length; c++) {
    winVal[c] = winVal[c].trim(); //final trim of winval
  }
  console.log(scorVal3);
  console.log("Beginning calculation");
  //winner calculation variables
  let eigh = Math.ceil(winVal.length / 8);
  let qurt = Math.ceil(winVal.length / 4);
  let half = Math.ceil(winVal.length / 2);
  if (id3 == 1) {
    //round 1 calcs
    for (var c = 0; c < half; c++) {
      //c = 0 -> 3 or 0 -> 7
      //b is the location of the scores to be compared, scalable
      b = c * 2;
      b2 = c * 2 + 1;
      //commented out sections for double checking calculations
      //console.log(b + "<b first half b2>" + b2);
      //console.log(scorVal3[b] + " <[b] + c:" +c + " [b2]> " + scorVal3[b2]);
      if (scorVal3[b] > scorVal3[b2]) {
        winVal[c] = b; //winner is output as a location into the winner array
      } else if (scorVal3[b] < scorVal3[b2]) {
        winVal[c] = b2;
        //for some reason undefined and "" aren't triggering for blanks
      } else if (
        scorVal3[b] === undefined ||
        scorVal3[b2] === undefined ||
        scorVal3[b] == "" ||
        scorVal3[b2] == ""
      ) {
        //error handling returns the output to the starting output
        winVal[c] = "Game 1";
      } else if (
        scorVal3[b] == "Game 1" ||
        scorVal3[b] == "Game 2" ||
        scorVal3[b] == "Game 3" ||
        scorVal3[b] == "Final"
      ) {
        winVal[c] = "Game 1";
      } else if (
        scorVal3[b2] == "Game 1" ||
        scorVal3[b2] == "Game 2" ||
        scorVal3[b2] == "Game 3" ||
        scorVal3[b2] == "Final"
      ) {
        winVal[c] = "Game 1";
      } else {
        console.log("possible error, outputing Tie just in case");
        winVal[c] = "Tie Game";
      }
      //console.log("winner: " + winVal[c]) + " at c: " + c;
    }
    //the rest of the winVal should still be returned to the db
    for (var c = half; c < half; c++) {
      winVal[c] = winVal[c];
    }
  } else if (id3 == 2) {
    //round 2 calcs
    for (var c = 0; c < half; c++) {
      winVal[c] = winVal[c];
    } //first half of winval should still be returned to db
    for (var c = half; c < half + qurt; c++) {
      //c = 4 -> 6 or 8 -> 12
      //a is the values from the previous games
      a = (c - half) * 2;
      a2 = (c - half) * 2 + 1;
      //b is the location of the compeating teams
      b = winVal[a];
      b2 = winVal[a2];
      //c is value position to go into winners[]
      //commented out sections for double checking calculations
      //console.log(a + " < teams > "+ a2);
      //console.log(b + " <b second half b2> " + b2);
      //console.log(scorVal3[b] + " <[b] + c:" +c + " [b2]> " + scorVal3[b2]);
      if (scorVal3[b] > scorVal3[b2]) {
        //same block as the previous section
        winVal[c] = b;
      } else if (scorVal3[b] < scorVal3[b2]) {
        winVal[c] = b2;
      } else if ((scorVal3[b] = scorVal3[b2])) {
        winVal[c] = "Tie Game";
      } else if (
        scorVal3[b] === undefined ||
        scorVal3[b2] === undefined ||
        scorVal3[b] == "" ||
        scorVal3[b2] == "" ||
        scorVal3[b] == "Game 1" ||
        scorVal3[b2] == "Game 1"
      ) {
        console.log("Probable error, outputing 'Game 2'");
        winVal[c] = "Game 2";
      } else {
        console.log("possible error, outputing Tie just in case");
        winVal[c] = "Tie Game";
      }
      //console.log("winner: " + winVal[c] + " at c: " + c);
    }
  } else if (id3 == 3) {
    //round 3 calcs
    for (var c = 0; c < half + qurt; c++) {
      winVal[c] = winVal[c];
    }
    //console.log("First 3/4 unchanged");
    for (var c = half + qurt; c < half + qurt + eigh; c++) {
      //c = 6 -> 7 or 13 -> 14
      a = (c - half - qurt) * 2 + 0 + half; //scalable values are complex
      a2 = (c - half - qurt) * 2 + 1 + half;
      //b is the location of the compeating teams
      b = winVal[a];
      b2 = winVal[a2];
      //c2 is value position to go into winners[]
      //commented out sections for double checking calculations
      //console.log(a + " < pos.teams > "+ a2);
      //console.log(b + " <b second half b2> " + b2);
      //console.log(scorVal3[b] + " <[b] + c:" +(c) + " [b2]> " + scorVal3[b2]);
      if (scorVal3[b] > scorVal3[b2]) {
        winVal[c] = b;
      } else if (scorVal3[b] < scorVal3[b2]) {
        winVal[c] = b2;
      } else if ((scorVal3[b] = scorVal3[b2])) {
        winVal[c] = "Tie Game";
      } else if (
        scorVal3[b] === undefined ||
        scorVal3[b2] === undefined ||
        scorVal3[b] == "" ||
        scorVal3[b2] == "Game 2" ||
        scorVal3[b] == "" ||
        scorVal3[b2] == "Game 2"
      ) {
        //
        console.log("Probable error, outputing Game 2");
        winVal[c] = "Game 3"; // winVal[c];
      } else {
        console.log("possible error, outputing Tie just in case");
        winVal[c] = "Tie Game";
      }
      //console.log("winner: " + winVal[c] + " at c: " + c);
    }
  } else {
    for (var c = 0; c < 14; c++) {
      //constants instead of variables for final of 16
      winVal[c] = winVal[c]; //initial winval processing
    }
    c = 14; //constants for simplicities sake, this section will only be accessed for the final of a 16 player bracket
    b = 12;
    b2 = 13;
    //commented out sections for double checking calculations
    console.log("c: " + c + " b: "+b+" b2: " +b2);
    console.log("c: " + winVal[c] + " b: "+ winVal[b] +" b2: " + winVal[b2]);
    console.log(" b: "+ scorVal3[winVal[b]] +" b2: " + scorVal3[winVal[b2]]);
    if (scorVal3[winVal[b]] > scorVal3[winVal[b2]]) {
      winVal[c] = winVal[b];
    } else if (scorVal3[winVal[b]] < scorVal3[winVal[b2]]) {
      winVal[c] = winVal[b2];
    } else if ((scorVal3[winVal[b]] = scorVal3[winVal[b2]])) {
      winVal[c] = "Tie Game";
    } else if (
      scorVal3[winVal[b]] === undefined ||
      scorVal3[winVal[b2]]=== undefined ||
      scorVal3[winVal[b]] == "" ||
      scorVal3[winVal[b2]] == "" ||
      scorVal3[winVal[b]] == "Game 3" ||
      scorVal3[winVal[b2]] == "Game 3"
    ) {
      console.log("this?");
      winVal[c] = winVal[c];
    } else {
      winVal[c] = "Tie Game";
    }
    console.log(winVal[c]);
  }
  //winners have been calculated now, note that because of the setup each time a form is commited all games of that round are calculated, but other rounds are just returned to the db
  let newScore;
  if (id3 == 1) {
    //new score reflects which scoreG has been altered
    newScore = Bracket({
      _id: id,
      teams: req.body.teams,
      scoreG1: scorVal3, //This is the input from the user
      scoreG2: req.body.t2,
      scoreG3: req.body.t3,
      scoreG4: req.body.t4,
      winner: winVal, //the determined winners are placed here
    });
  } else if (id3 == 2) {
    newScore = Bracket({
      _id: id,
      teams: req.body.teams,
      scoreG1: req.body.t1,
      scoreG2: scorVal3,
      scoreG3: req.body.t3,
      scoreG4: req.body.t4,
      winner: winVal,
    });
  } else if (id3 == 3) {
    newScore = Bracket({
      _id: id,
      teams: req.body.teams,
      scoreG1: req.body.t1,
      scoreG2: req.body.t2,
      scoreG3: scorVal3,
      scoreG4: req.body.t4,
      winner: winVal,
    });
  } else {
    newScore = Bracket({
      _id: id,
      teams: req.body.teams,
      scoreG1: req.body.t1,
      scoreG2: req.body.t2,
      scoreG3: req.body.t3,
      scoreG4: scorVal3,
      winner: winVal,
    });
  }

  Bracket.updateOne({ _id: id }, newScore, (err) => {
    //update is made to the database
    if (err) {
      console.log(err);
      res.end(err);
    } else {
      res.redirect("/bracket-list/show/" + id); //refresh
    }
  });
};
