//These functions are responsible for handling the logic of a request.
// They receive input from the request, process it (often by calling services),
// and return a response.
const AiPlan = require('../services/ai.services.js');

module.exports.renderHomePage = (req, res) => {
    res.render('index');
}

module.exports.generateTripPlan = async (req, res) => {
    try {
        // Process form data
        const formData = {
            country: "Sri Lanka",
            duration: parseInt(req.body.duration),
            interests: Array.isArray(req.body.interests) ? req.body.interests : req.body.interests.split(',').map(item => item.trim()),
            budget: req.body.budget,
            cities: req.body.cities,
            includeHiddenPlace: req.body.includeHiddenPlace === 'on' // Checkbox values come as 'on' when checked
        };
        
        // Store formData in session for use in showTripResults
        req.session.formData = formData;
        
        // Call AI service
        const tripPlan = await AiPlan.getTripPlan(formData);
        
        // Store the plan in session
        req.session.tripPlan = tripPlan;
        
        // Redirect to results page
        res.redirect('/trip-results');
        
    } catch (error) {
        console.error("Error:", error);
        // Store error in session
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
        citiesString: formData.cities || ""
    });
    
    // Clear session data after rendering
    req.session.tripPlan = null;
    req.session.error = null;
};

module.exports.getTextMessage = (req, res) => {
    res.json({ message: 'Hello from controller!!' });
}