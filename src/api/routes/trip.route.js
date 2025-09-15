const express = require('express');
const router = express.Router();
const {generateTripPlan} = require('../controllers/trip.controller.js');

// A GET request is easy to test in your browser
router.post('/generate-trip', generateTripPlan);

module.exports = router;
