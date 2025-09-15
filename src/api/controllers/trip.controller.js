//These functions are responsible for handling the logic of a request.
// They receive input from the request, process it (often by calling services),
// and return a response.
const AiPlan = require('../services/ai.services.js');


const generateTripPlan = async (req, res) => {
    try{
        // 2. Call the service function with the user's input from the request body
        const tripPlan = await AiPlan.getTripPlan(req.body);
        // Add debug log to check if req.body exists
        // console.log("Request body:", req.body);

        // 3. Send the result from the service back to the client
        res.status(200).json(tripPlan);
    }catch (error) {
        res.status(500).json({error: 'Failed to generate trip plan', error: error.message});
    }
}
const getTextMessage = (req, res) => {
    res.json({ message: 'Hello from controller!!' });
}

module.exports = { generateTripPlan }