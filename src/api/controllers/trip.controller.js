//These functions are responsible for handling the logic of a request.
// They receive input from the request, process it (often by calling services),
// and return a response.
const AiPlan = require('../services/ai.services.js');

module.exports.renderHomePage = (req, res) => {
    res.render('index');
}

module.exports.generateTripPlan = async (req, res) => {
    try {
        // console.log("Form data received:", req.body);
        
        // Process form data - handle interests whether it's a string or array
        let interests;
        if (Array.isArray(req.body.interests)) {
            // If interests is already an array, use it directly
            interests = req.body.interests;
        } else {
            // If interests is a string, split it by commas
            interests = req.body.interests ? req.body.interests.split(',').map(item => item.trim()) : [];
        }
        
        const formData = {
            country: "Sri Lanka", // Fixed to Sri Lanka
            duration: parseInt(req.body.duration),
            interests: Array.isArray(req.body.interests) ? req.body.interests : req.body.interests.split(',').map(item => item.trim()),
            budget: req.body.budget,
            cities: req.body.cities // Add the cities from the form
        };
        
        // console.log("Processed form data:", formData);
        
        // Call the service function with the processed form data
        const tripPlan = await AiPlan.getTripPlan(formData);
        
        // Render the results page
        res.render('results', { 
            tripPlan: tripPlan.tripPlan || [],
            status: tripPlan.status || "success",
            message: tripPlan.message || ""
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).render('results', {
            tripPlan: [],
            status: "error",
            message: error.message || "Failed to generate trip plan"
        });
    }
};
module.exports.getTextMessage = (req, res) => {
    res.json({ message: 'Hello from controller!!' });
}