const express = require('express');

var ensureLogIn = require("connect-ensure-login").ensureLoggedIn;
const router = express.Router();
const tripController = require('../controllers/trip.controller.js');
const passport = require("passport");

const BASE_URL = "https://api.asgardeo.io/t/roamly";

var ensureLoggedIn = ensureLogIn();

// Trip routes
router.get('/', tripController.renderHomePage);
router.get('/login', tripController.loginPage);  // Show login PAGE
router.get('/auth/login', passport.authenticate("asgardeo"));  // Start OAuth (for button)
router.get('/generate-trip', ensureLoggedIn, tripController.renderIndexPage);
router.post('/generate-trip', ensureLoggedIn, tripController.generateTripPlan);
router.get('/trip-results', tripController.showTripResults);
router.get('/destinations', tripController.renderDestinationsPage);
router.get('/saved-trips', tripController.showSavedTrips);
router.get('/test', tripController.getTextMessage);

// OAuth callback
router.get("/oauth2/redirect", tripController.authenticate);

// Logout
router.post("/auth/logout", tripController.authLogout);

module.exports = router;