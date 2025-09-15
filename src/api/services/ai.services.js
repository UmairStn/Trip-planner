//This function will eventually hold your AI prompt generation and axios call.
// This function will handle the core logic of creating a trip plan.

const axios = require('axios');

const getTripPlan = async (userInput) => {
   try {
        // extract values from user input
        const duration = userInput.duration;
        const interString = userInput.interests.join(", ");
        const budget = userInput.budget;
        const country = userInput.country;


        //1. Get the api key and url
        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

        //2. create the prompt
        const generatePrompt = `Create a detailed trip plan for a ${duration}-day trip to ${country}. The trip should be suitable for a ${budget} budget. The traveler is primarily interested in exploring ${interString}.`;

        //3. Create a combined prompt
        const combinedPrompt = `You are an expert travel agent. Your response MUST be in a clean JSON format. The JSON object should have a single key named 'tripPlan' which is an array of day objects. Each day object must have these keys: 'day' (number), 'location' (string), 'description' (string), and 'activities' (an array of strings). Here is the user's request:${generatePrompt}`

        // 4. Structure the payload for Gemini
        const payload = {
        contents: [{
            parts: [{
            text: combinedPrompt
            }]
        }]
        };

        //5. Make the API request to Gemini
        const response = await axios.post(apiUrl, payload);
        const aiResponseText = response.data.candidates[0].content.parts[0].text;

        // FIX: Clean the response string before parsing
        const startIndex = aiResponseText.indexOf('{');
        const endIndex = aiResponseText.lastIndexOf('}');
        const jsonString = aiResponseText.substring(startIndex, endIndex + 1);
        // 6. Parse and return the final JSON trip plan
        const tripPlanJson = JSON.parse(jsonString);
        return tripPlanJson;

   }catch (error){
        console.error("Error calling Gemini API:", error.response ? error.response.data : error.message);
        throw new Error("Failed to generate trip plan from the AI service.");
   } 

}

module.exports = { getTripPlan };