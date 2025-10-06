//This function will eventually hold your AI prompt generation and axios call.
// This function will handle the core logic of creating a trip plan.

const axios = require('axios');

const getTripPlan = async (userInput) => {
   try {
        // extract values from user input
        const duration = userInput.duration;
        const interString = userInput.interests.join(", ");
        const budget = userInput.budget;
        const country = "Sri Lanka"; // Fixed country
        const citiesString = userInput.cities ? userInput.cities.split(',').map(city => city.trim()).join(', ') : "major cities";

        //1. Get the api key and url
        const apiKey = process.env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

        //2. create the prompt
        const generatePrompt = `Create a detailed trip plan for a ${duration}-day trip to ${country} visiting these cities: ${citiesString}. The trip should be suitable for a ${budget} budget. The traveler is primarily interested in exploring ${interString}.`;

        //3. Create a combined prompt
        const citiesArray = citiesString.split(',').map(city => city.trim());
        const needMoreCities = (citiesArray.length <= 2 && duration > 3);

        const combinedPrompt = `You are an expert travel agent creating a personalized itinerary for Sri Lanka. 
Your response MUST be ONLY valid JSON with no additional text or markdown. 
Return a JSON object with a single key named 'tripPlan' containing an array of day objects.

Each day object MUST include:
- 'day': number (1, 2, 3...)
- 'location': string (specific area/city from Sri Lanka)
- 'description': string (100-150 words about the day)
- 'activities': array of 3-5 activity strings
- 'meals': object with 'breakfast', 'lunch', and 'dinner' recommendations
- 'accommodation': string (hotel/lodging suggestion with approximate ${budget} price)
- 'transportationTips': string (how to get around)
${userInput.includeHiddenPlace ? 
  "- 'hiddenPlaces': array of 2-3 strings (names of lesser-known local spots with brief 10-15 word descriptions)" : 
  ""}

${needMoreCities ? 
  `The user has only specified ${citiesString} but the trip is ${duration} days long. Please suggest and include 2-3 additional nearby cities or attractions that match their interests in ${interString}.` : 
  `Create a realistic ${duration}-day trip to Sri Lanka visiting these cities: ${citiesString}.`}

For a ${budget} budget focusing on ${interString}.
Distribute the days across the cities in a logical order to minimize travel time.
Include both popular highlights and hidden gems in each location.
Balance the itinerary to avoid exhaustion (don't pack too many activities per day).
Suggest specific restaurants, venues, and attractions with brief descriptions.

IMPORTANT: Plan the itinerary so that the final day is spent in or near Colombo, as the international airport is in Katunayake (close to Colombo). This will make departure more convenient for the traveler.

${needMoreCities ? 
  `Since this is a ${duration}-day trip, please add appropriate additional destinations beyond ${citiesString} that would complement their interests in ${interString}, but ensure the trip ends near Colombo for airport access.` : 
  `Stay within the specified cities as requested by the user, but arrange the itinerary so the last day is in the location closest to Colombo/Katunayake for easy airport access.`}

${userInput.includeHiddenPlace ? 
  "IMPORTANT: For each destination, include 2-3 hidden places as an array in 'hiddenPlaces' that most tourists don't know about - these could be secret viewpoints, local-only restaurants, unmarked trails, or off-the-beaten-path attractions. Keep each hidden place description very brief (10-15 words maximum)." : 
  ""}`;

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

        // Improved JSON extraction and parsing
        try {
          // First try direct parsing
          const tripPlanJson = JSON.parse(aiResponseText);
          console.log("Direct parsing successful");

          // Validate the response structure
          if (!tripPlanJson.tripPlan || !Array.isArray(tripPlanJson.tripPlan) || tripPlanJson.tripPlan.length === 0) {
            console.error("Invalid response structure");
            throw new Error("The AI returned an invalid trip plan structure");
          }

          // Check if we have the right number of days
          if (tripPlanJson.tripPlan.length < duration) {
            console.log("Warning: AI returned fewer days than requested, adding placeholder days");
            
            // Fill in missing days with generic content
            for (let i = tripPlanJson.tripPlan.length + 1; i <= duration; i++) {
              tripPlanJson.tripPlan.push({
                day: i,
                location: `${citiesString.split(',')[0]} - Day ${i}`, // Use first city from list
                description: "Details for this day will be provided soon.",
                activities: ["Exploring local attractions", "Free time for personal interests"],
                meals: {
                  breakfast: "Local breakfast options",
                  lunch: "Local lunch options",
                  dinner: "Local dinner options"
                },
                accommodation: "Continued stay at previous accommodation",
                transportationTips: "Local transportation options"
              });
            }
          }

          // Add this validation in your parsing section
          if (tripPlanJson.tripPlan.some(day => userInput.includeHiddenPlace && !day.hiddenPlaces)) {
            console.log("Converting hiddenPlace to hiddenPlaces array if needed");
            
            // Convert any single hiddenPlace strings to arrays
            tripPlanJson.tripPlan.forEach(day => {
              if (userInput.includeHiddenPlace) {
                if (day.hiddenPlace && !day.hiddenPlaces) {
                  // If there's only hiddenPlace but not hiddenPlaces, convert it
                  day.hiddenPlaces = [day.hiddenPlace];
                  delete day.hiddenPlace; // Remove the old property
                } else if (!day.hiddenPlaces) {
                  // If neither exists, add empty array
                  day.hiddenPlaces = ["Hidden gem information not available"];
                }
              }
            });
          }
          
          return tripPlanJson;
        } catch (parseError) {
          console.log("Direct parsing failed, attempting to extract JSON");
          try {
            // Find JSON using regex pattern matching
            const jsonRegex = /{[\s\S]*}/g;
            const jsonMatch = aiResponseText.match(jsonRegex);
            
            if (jsonMatch && jsonMatch[0]) {
              const extractedJson = JSON.parse(jsonMatch[0]);
              console.log("JSON extraction successful");
              return extractedJson;
            } else {
              throw new Error("Could not extract valid JSON from response");
            }
          } catch (extractError) {
            console.error("JSON extraction failed:", extractError);
            throw new Error("Failed to parse AI response into valid JSON format");
          }
        }
        
     }catch (error){
        console.error("Error calling Gemini API:", error.response ? error.response.data : error.message);
        
        // Create fallback response with error info
        return {
          tripPlan: [
            {
              day: 1,
              location: "Trip Planning Error",
              description: "We encountered an issue while creating your trip plan. Please try again or modify your search criteria.",
              activities: ["Please try again with different parameters"],
              meals: {
                breakfast: "N/A",
                lunch: "N/A",
                dinner: "N/A"
              },
              accommodation: "N/A",
              transportationTips: "N/A",
              error: error.message
            }
          ],
          status: "error",
          message: error.message
        };
   } 

}

module.exports = { getTripPlan };