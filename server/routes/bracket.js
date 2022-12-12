let express = require("express");
let router = express.Router();
let mongoose = require("mongoose");

let jwt = require("jsonwebtoken");
let passport = require("passport");
// connect to our Bracket Model
let Bracket = require("../models/bracket");

let bracketController = require("../controllers/bracket");

// helper function for guard purposes
function requireAuth(req, res, next) {
    // check if the user is logged in
    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }
    next();
  }

// /* GET Route for the Bracket List page - READ OPeration */
 router.get("/", bracketController.displayBracketList);

// /* GET Route for displaying Add page - Create OPeration */
router.get("/createPage",requireAuth, bracketController.addpage);

// /* POST Route for processing Add page - Create OPeration */
router.post("/createPage", bracketController.addprocesspage);

router.get("/show/:id", bracketController.addPlayerpage);

router.post("/show/:id", bracketController.completeBracketEarly);//functionality to complete a game early

// /* GET Route for displaying Edit page -UPDATE OPeration */
router.get("/edit/:id", requireAuth, bracketController.displayeditpage);

// /*POST Route for processing Edit page - UPDATE OPeration */
router.post("/edit/:id", requireAuth, bracketController.processingeditpage);

// /* GET to perform book deletion -Delete OPeration */
router.get("/delete/:id", requireAuth, bracketController.deletepage);

router.get("/display/:id", bracketController.scoreDisplayPage);

router.post("/display/:id", bracketController.scoreProcessPage);

//*Get to perform page for anonymous
router.get("/showall/:id", bracketController.showTournamentpage);


module.exports = router;

