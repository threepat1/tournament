let express = require("express");
let router = express.Router();

let bracketController = require("../controllers/index");

/* GET about page. */
router.get("/About", bracketController.displayAbout);


/* GET home page. */
router.get("/", bracketController.displayHomepage);

/* GET home page. */
router.get("/Tourney Team", bracketController.displayHomepage);

/* GET Route for displaying the Login page */
router.get("/login", bracketController.displayLoginPage);

/* POST Route for processing the Login page */
router.post("/login", bracketController.processLoginPage);

/* GET Route for displaying the Register page */
router.get("/register", bracketController.displayRegisterPage);

/* POST Route for processing the Register page */
router.post("/register", bracketController.processRegisterPage);

/* GET to perform UserLogout */
router.get("/logout", bracketController.performLogout);


module.exports = router;
