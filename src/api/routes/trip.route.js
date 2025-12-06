const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller.js');

// Routes using the cleaned controller
router.get('/', tripController.renderHomePage);
router.get('/generate-trip', tripController.renderIndexPage);
router.post('/generate-trip', tripController.generateTripPlan); // Uses REAL AI service
router.get('/trip-results', tripController.showTripResults); // Shows REAL AI results
router.get('/destinations', tripController.renderDestinationsPage);
router.get('/saved-trips', tripController.showSavedTrips);

// Test route
router.get('/test', tripController.getTextMessage);

module.exports = router;