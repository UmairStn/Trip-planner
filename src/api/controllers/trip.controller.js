//These functions are responsible for handling the logic of a request.
// They receive input from the request, process it (often by calling services),
// and return a response.
const AiPlan = require('../services/ai.services.js');
const UserInputs = require('../models/UserInputs.js');
const { asyncHandler } = require('../../middleware/error.middleware.js');

// Render pages
module.exports.renderHomePage = (req, res) => {
    res.render('home');
}

module.exports.renderIndexPage = (req, res) => {
    res.render('index');
}

module.exports.renderDestinationsPage = (req, res) => {
    res.render('destinations');
}

// Main trip generation function (using AI service)
module.exports.generateTripPlan = async (req, res) => {
    try {
        //console.log('Session ID:', req.sessionID);
        //console.log('Form submitted with data:', req.body);
        
        // Extract data from the request body
        const rawInputs = req.body.userInputs; 
        
        // Process the data to match your Mongoose Schema
        const processedData = {
            cities: rawInputs.cities,
            duration: parseInt(rawInputs.duration),
            budget: rawInputs.budget,
            interests: rawInputs.interests.split(',').map(item => item.trim()),
            includeHiddenPlace: req.body.includeHiddenPlace === 'on',
            allowAiSuggestions: req.body.allowAiSuggestions === 'on'
        };

        // Validation
        if (!processedData.cities || !processedData.duration || !processedData.budget || !processedData.interests.length) {
            throw new Error('Please fill in all required fields: cities, duration, budget, and interests.');
        }

        // Validate duration range
        if (isNaN(processedData.duration) || processedData.duration < 1 || processedData.duration > 30) {
            throw new Error('Trip duration must be between 1 and 30 days.');
        }

        // Store formData in session
        req.session.formData = processedData;
        
        // Track user's trip generation count
        req.session.tripCount = (req.session.tripCount || 0) + 1;
        
        // Call AI service using the processed data (REAL AI GENERATION)
        //console.log('Calling AI service with processed data:', processedData);
        const tripPlan = await AiPlan.getTripPlan(processedData);
        
        // Store the AI result in session
        req.session.tripPlan = tripPlan;
        
        // Redirect to results
        res.redirect('/trip-results');
        
    } catch (error) {
        console.error("Error generating trip:", error);
        req.session.error = {
            status: "error",
            message: error.message
        };
        res.redirect('/trip-results');
    }
};

// Show trip results (using real AI data)
module.exports.showTripResults = (req, res) => {
    // Get data from session
    const tripPlan = req.session.tripPlan || { tripPlan: [] };
    const formData = req.session.formData || {};
    const error = req.session.error || {};
    
    // console.log('Rendering results with:', {
    //     tripPlan: tripPlan.tripPlan || [],
    //     status: tripPlan.status || error.status || "success",
    //     formData
    // });
    
    // Render the results page with REAL AI data
    res.render('results', { 
        tripPlan: tripPlan.tripPlan || [],
        status: tripPlan.status || error.status || "success",
        message: tripPlan.message || error.message || "",
        citiesString: formData.cities || "",
        unsplashApiKey: process.env.UNSPLASH_API_KEY || "",
        tripData: formData,
        sessionInfo: {
            tripCount: req.session.tripCount || 0
        }
    });
    
    // Clear session error after rendering
    req.session.error = null;
};

module.exports.getTextMessage = (req, res) => {
    res.json({ message: 'Hello from controller!!' });
};

// Simple function to show saved trips from session
module.exports.showSavedTrips = (req, res) => {
    const savedTrips = req.session.savedTrips || [];
    const currentTripPlan = req.session.tripPlan;
    
    res.json({
        currentTripPlan,
        savedTrips,
        tripCount: req.session.tripCount || 0,
        sessionId: req.sessionID
    });
};