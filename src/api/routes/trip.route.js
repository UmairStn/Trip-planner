const express = require('express');
const router = express.Router();
const generate = require('../controllers/trip.controller.js');


// GET route to display the form
router.get('/generate-trip', generate.renderHomePage);

// POST route to handle form submission - simplified
router.post('/generate-trip', generate.generateTripPlan);

module.exports = router;
