//These functions are responsible for handling the logic of a request.
// They receive input from the request, process it (often by calling services),
// and return a response.
const AiPlan = require('../services/ai.services.js');
const UserInputs = require('../models/UserInputs.js');

module.exports.renderHomePage = (req, res) => {
    res.render('home');
}
module.exports.renderIndexPage = (req, res) => {
    res.render('index');
}
module.exports.renderDestinationsPage = (req, res) => {
    res.render('destinations');
}
module.exports.generateTripPlan = async (req, res) => {
    try {
        // 1. Extract data from the request body
        // Note: HTML text inputs are grouped under 'userInputs', but checkboxes are separate
        const rawInputs = req.body.userInputs; 
        
        // 2. Process the data to match your Mongoose Schema
        const processedData = {
            cities: rawInputs.cities,
            duration: parseInt(rawInputs.duration),
            budget: rawInputs.budget,
            // Convert comma-separated string to an Array for the DB
            interests: rawInputs.interests.split(',').map(item => item.trim()),
            // Checkboxes send 'on' if checked, undefined if not. Convert to Boolean.
            includeHiddenPlace: req.body.includeHiddenPlace === 'on',
            allowAiSuggestions: req.body.allowAiSuggestions === 'on'
        };

        // 3. Save to MongoDB
        // const dbEntry = new UserInputs(processedData);
        // await dbEntry.save();
        // console.log("User inputs saved to DB with ID:", dbEntry._id);

        // 4. Store formData in session (using the clean processed data)
        req.session.formData = processedData;
        
        // 5. Call AI service using the processed data
        const tripPlan = await AiPlan.getTripPlan(processedData);
        
        // 6. Store the AI result in session
        req.session.tripPlan = tripPlan;
        
        // 7. Redirect to results
        res.redirect('/trip-results');
        
    } catch (error) {
        console.error("Error:", error);
        req.session.error = {
            status: "error",
            message: error.message
        };
        res.redirect('/trip-results');
    }
};

module.exports.showTripResults = (req, res) => {
    // Get data from session
    const tripPlan = req.session.tripPlan || { tripPlan: [] };
    const formData = req.session.formData || {};
    const error = req.session.error || {};
    
    // Render the results page
    res.render('results', { 
        tripPlan: tripPlan.tripPlan || [],
        status: tripPlan.status || error.status || "success",
        message: tripPlan.message || error.message || "",
        citiesString: formData.cities || "",
        unsplashApiKey: process.env.UNSPLASH_API_KEY || ""
    });
    
    // Clear session data after rendering
    // req.session.tripPlan = null;
    // req.session.error = null;
};



module.exports.getTextMessage = (req, res) => {
    res.json({ message: 'Hello from controller!!' });
}
