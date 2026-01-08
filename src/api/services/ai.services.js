//This function will eventually hold your AI prompt generation and axios call.
// This function will handle the core logic of creating a trip plan.

const axios = require('axios');

// Test mode flag - set to true when testing UI
const TEST_MODE = false; // Toggle this to true when you want to skip API calls

// API Selection - Choose which API to use
const USE_OPENROUTER = false; // Set to true to use OpenRouter, false to use Gemini

// Sample trip plan for testing
// const sampleTripPlan = {
//   tripPlan: [
//     {
//       day: 1,
//       location: "Colombo",
//       description: "Your journey begins in the vibrant capital city of Colombo. After checking into your hotel, spend the day exploring the colonial architecture and bustling markets. Visit the historic Fort area with its mix of modern businesses and colonial-era buildings. Enjoy a leisurely stroll along Galle Face Green in the evening as the sun sets over the Indian Ocean, where locals gather to fly kites, play cricket, and enjoy street food.",
//       activities: [
//         "Explore Gangaramaya Temple, a unique Buddhist complex with eclectic architecture",
//         "Visit the National Museum to learn about Sri Lankan history and culture",
//         "Shop at Pettah Market, a maze of streets filled with vendors and local goods",
//         "Evening walk along Galle Face Green promenade"
//       ],
//       meals: {
//         breakfast: "Traditional Sri Lankan hoppers and egg curry at Palmyrah Restaurant",
//         lunch: "Rice and curry at Upali's by Nawaloka, known for authentic local cuisine",
//         dinner: "Seafood dinner at Ministry of Crab in the historic Dutch Hospital complex"
//       },
//       accommodation: "Cinnamon Grand Colombo - Luxury city hotel with multiple restaurants and a pool (₹12,000-15,000 per night)",
//       transportationTips: "Use metered tuk-tuks or ride-hailing apps like PickMe for getting around Colombo. For longer distances, hire a private car or use the efficient public bus system.",
//       hiddenPlaces: [
//         "Attanagalla Rajamaha Viharaya - Ancient temple with peaceful gardens away from tourist crowds",
//         "Barefoot Garden Café - Hidden courtyard café with live jazz on Sundays"
//       ]
//     },
//     {
//       day: 2,
//       location: "Kandy",
//       description: "Travel to Kandy, the last capital of the Sri Lankan kings and a UNESCO World Heritage site. Visit the Temple of the Tooth Relic, one of the most sacred Buddhist sites in the world. Explore the Royal Botanical Gardens in Peradeniya, home to a vast collection of plants and trees. In the evening, enjoy a cultural show featuring traditional Sri Lankan dance and music.",
//       activities: [
//         "Morning visit to the Temple of the Tooth Relic",
//         "Explore the Royal Botanical Gardens in Peradeniya",
//         "Visit the Kandy Lake and enjoy a boat ride",
//         "Evening cultural show at the Kandy Lake Club"
//       ],
//       meals: {
//         breakfast: "Buffet breakfast at the hotel",
//         lunch: "Traditional Sri Lankan rice and curry at a local restaurant",
//         dinner: "Kandyan Muslim Hotel for authentic biryani and other local dishes"
//       },
//       accommodation: "Earl's Regency Hotel - Luxury hotel with stunning views of the Mahaweli River (₹10,000-12,000 per night)",
//       transportationTips: "Take a scenic train ride from Colombo to Kandy. In Kandy, use tuk-tuks or walk to explore the city.",
//       hiddenPlaces: [
//         "Gadaladeniya Temple - 14th-century Buddhist temple with intricate stone carvings",
//         "Lankatilaka Temple - Stunning temple with panoramic views, located a bit off the tourist trail"
//       ]
//     },
//     {
//       day: 3,
//       location: "Sigiriya",
//       description: "Drive to Sigiriya, home to the famous Sigiriya Rock Fortress, a UNESCO World Heritage site. Climb the rock for breathtaking views and explore the ancient frescoes and ruins. In the afternoon, visit the nearby Dambulla Cave Temple, another UNESCO site, known for its impressive cave paintings and Buddha statues.",
//       activities: [
//         "Morning climb to Sigiriya Rock Fortress",
//         "Explore the ruins and frescoes at Sigiriya",
//         "Visit the Dambulla Cave Temple in the afternoon",
//         "Evening at leisure or explore the local area"
//       ],
//       meals: {
//         breakfast: "At the hotel in Kandy",
//         lunch: "Local restaurant in Sigiriya for fresh farm-to-table cuisine",
//         dinner: "The Village Hotel in Sigiriya for a cultural dance and dinner experience"
//       },
//       accommodation: "Sigiriya Jungles - Eco-friendly hotel with luxury tents and tree houses (₹8,000-10,000 per night)",
//       transportationTips: "Private car or taxi from Kandy to Sigiriya. In Sigiriya, use bicycles or tuk-tuks to get around.",
//       hiddenPlaces: [
//         "Pidurangala Rock - Less crowded than Sigiriya, offers equally stunning views",
//         "Kaludiya Pokuna - Ancient pond and meditation site, great for a quiet retreat"
//       ]
//     },
//     {
//       day: 4,
//       location: "Polonnaruwa",
//       description: "Visit the ancient city of Polonnaruwa, a UNESCO World Heritage site, known for its well-preserved ruins and impressive archaeological sites. Explore the Royal Palace, Gal Vihara with its massive Buddha statues, and the Parakrama Samudra, an ancient reservoir. In the evening, return to Sigiriya.",
//       activities: [
//         "Full-day exploration of Polonnaruwa's archaeological sites",
//         "Visit the Royal Palace and Gal Vihara",
//         "Explore the ancient irrigation system at Parakrama Samudra",
//         "Evening at leisure in Sigiriya"
//       ],
//       meals: {
//         breakfast: "At the hotel in Sigiriya",
//         lunch: "Local restaurant in Polonnaruwa for traditional Sri Lankan meals",
//         dinner: "Back in Sigiriya, dine at a local restaurant or hotel"
//       },
//       accommodation: "Sigiriya Jungles - Continued stay in your luxury tent or tree house",
//       transportationTips: "Private car or taxi for the day to explore Polonnaruwa. Bicycles are also available for rent at the site.",
//       hiddenPlaces: [
//         "Kiri Vehera - Less visited stupa with beautiful frescoes and peaceful surroundings",
//         "Nissanka Latha Mandapaya - Unique stone pavilion with intricate carvings"
//       ]
//     },
//     {
//       day: 5,
//       location: "Anuradhapura",
//       description: "Travel to Anuradhapura, one of the ancient capitals of Sri Lanka and a UNESCO World Heritage site. Explore the well-preserved ruins, including the Sri Maha Bodhi tree, Ruwanwelisaya stupa, and the ancient hospital. Learn about the rich history and archaeological significance of the site.",
//       activities: [
//         "Full-day exploration of Anuradhapura's ancient ruins",
//         "Visit the Sri Maha Bodhi tree, believed to be the oldest living tree in the world",
//         "Explore the Ruwanwelisaya stupa and other significant sites",
//         "Evening at leisure or visit a local market"
//       ],
//       meals: {
//         breakfast: "At the hotel in Sigiriya",
//         lunch: "Local restaurant in Anuradhapura for authentic Sri Lankan cuisine",
//         dinner: "Heritage Hotel's restaurant for a mix of local and international dishes"
//       },
//       accommodation: "Heritage Hotel, Anuradhapura - Comfortable hotel with modern amenities (₹6,000-8,000 per night)",
//       transportationTips: "Private car or taxi for the day. Anuradhapura is spread out, so hiring a vehicle is recommended.",
//       hiddenPlaces: [
//         "Isurumuniya Temple - Ancient rock temple with beautiful carvings and a tranquil setting",
//         "The Samadhi Buddha Statue - A serene and less crowded site to reflect and meditate"
//       ]
//     }
//   ],
//   status: "success",
//   message: ""
// };


const getTripPlan = async (userInput) => {
   // If in test mode, return the sample data immediately
   if (TEST_MODE) {
     console.log("TEST MODE: Returning sample trip plan instead of calling API");
     return sampleTripPlan;
   }
   
   try {
        // extract values from user input
        const duration = userInput.duration;
        const interString = userInput.interests.join(", ");
        const budget = userInput.budget;
        const country = "Sri Lanka"; // Fixed country
        const citiesString = userInput.cities ? userInput.cities.split(',').map(city => city.trim()).join(', ') : "major cities";

        // ============================================
        // API CONFIGURATION
        // ============================================
        let apiUrl, payload, headers;

        if (USE_OPENROUTER) {
            // OPENROUTER API (ACTIVE)
            console.log("🤖 Using OpenRouter API...");
            const openRouterApiKey = process.env.OPEN_ROUTER_API_KEY;
            apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
            headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openRouterApiKey}`
            };
        } else {
            // GEMINI API (BACKUP)
            console.log("🤖 Using Gemini API...");
            const geminiApiKey = process.env.GEMINI_API_KEY;
            apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
        }

        //2. create the prompt
        const generatePrompt = `Create a detailed trip plan for a ${duration}-day trip to ${country} visiting these cities: ${citiesString}. The trip should be suitable for a ${budget} budget. The traveler is primarily interested in exploring ${interString}.`;

        //3. Create a combined prompt
        const citiesArray = citiesString.split(',').map(city => city.trim());
        
        // MODIFIED LOGIC: Only suggest more cities if the user ALLOWS it AND the logic deems it necessary
        const needMoreCities = userInput.allowAiSuggestions && (citiesArray.length <= 2 && duration > 3);

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
                          "- 'hiddenPlaces': array of 2-3 strings describing lesser-known local spots (each description should be concise)" : 
                          ""}

                        ${needMoreCities ? 
                          `The user has only specified ${citiesString} but the trip is ${duration} days long. Please suggest and include 2-3 additional nearby cities or attractions that match their interests in ${interString}.` : 
                          `Create a realistic ${duration}-day trip to Sri Lanka visiting these cities: ${citiesString}.`}

                        For a ${budget} budget focusing on ${interString}.
                        
                        IMPORTANT INTEREST-BASED RECOMMENDATIONS:
                        ${interString.toLowerCase().includes('partie') || interString.toLowerCase().includes('pub') || interString.toLowerCase().includes('nightlife') || interString.toLowerCase().includes('bar') ? 
                          `- Include nightlife activities such as popular bars, clubs, beach parties, rooftop lounges, and evening entertainment venues
                          - Recommend areas known for nightlife (e.g., Colombo Fort, Galle Road, Mirissa, Hikkaduwa)
                          - Suggest specific venues for parties, live music, DJ nights, and social gatherings
                          - Include late-night dining options and after-hours activities` : 
                          ''}
                        ${interString.toLowerCase().includes('beach') ? 
                          '- Prioritize coastal locations and water activities' : 
                          ''}
                        ${interString.toLowerCase().includes('culture') || interString.toLowerCase().includes('temple') || interString.toLowerCase().includes('heritage') ? 
                          '- Focus on historical sites, temples, and cultural experiences' : 
                          ''}
                        ${interString.toLowerCase().includes('adventure') || interString.toLowerCase().includes('hiking') ? 
                          '- Include trekking, hiking, and adventure sports' : 
                          ''}
                        
                        Distribute the days across the cities in a logical order to minimize travel time.
                        Include both popular highlights and activities matching their specific interests (${interString}).
                        Balance the itinerary to avoid exhaustion (don't pack too many activities per day).
                        Suggest specific restaurants, venues, and attractions with brief descriptions.

                        IMPORTANT: Plan the itinerary so that the final day is spent in or near Colombo, as the international airport is in Katunayake (close to Colombo). This will make departure more convenient for the traveler.

                        ${needMoreCities ? 
                          `Since this is a ${duration}-day trip, please add appropriate additional destinations beyond ${citiesString} that would complement their interests in ${interString}, but ensure the trip ends near Colombo for airport access.` : 
                          `Stay within the specified cities as requested by the user, but arrange the itinerary so the last day is in the location closest to Colombo/Katunayake for easy airport access.`}

                        ${userInput.includeHiddenPlace ? 
                          "IMPORTANT: For each destination, include 2-3 hidden places in the 'hiddenPlaces' array that most tourists don't know about - these could be secret viewpoints, local-only restaurants, unmarked trails, off-the-beaten-path bars/clubs, or hidden beach spots. Keep descriptions concise and specific." : 
                          ""}`;

        // ============================================
        // CREATE PAYLOAD BASED ON SELECTED API
        // ============================================
        if (USE_OPENROUTER) {
            // OpenRouter payload format with reasoning enabled
            payload = {
                model: "amazon/nova-2-lite-v1:free",
                messages: [
                    {
                        role: "system",
                        content: "You are a professional travel agent specializing in Sri Lankan tourism. Always respond with valid JSON only, no markdown or additional text."
                    },
                    {
                        role: "user",
                        content: combinedPrompt
                    }
                ],
                reasoning: {
                    enabled: true
                }
            };
        } else {
            // Gemini payload format
            payload = {
                contents: [{
                    parts: [{
                        text: combinedPrompt
                    }]
                }]
            };
        }

        //5. Make the API request
        const response = await axios.post(apiUrl, payload, { headers });
        
        // ============================================
        // PARSE RESPONSE BASED ON SELECTED API
        // ============================================
        let aiResponseText;
        
        if (USE_OPENROUTER) {
            // OpenRouter response format
            if (!response.data || !response.data.choices || !response.data.choices[0]) {
                throw new Error("Invalid OpenRouter API response structure");
            }
            aiResponseText = response.data.choices[0].message.content;
            console.log("✅ OpenRouter API responded successfully");
        } else {
            // Gemini response format
            if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
                throw new Error("Invalid Gemini API response structure");
            }
            aiResponseText = response.data.candidates[0].content.parts[0].text;
            console.log("✅ Gemini API responded successfully");
        }

        // ============================================
        // JSON PARSING (SAME FOR BOTH APIs)
        // ============================================
        try {
          // Remove markdown code blocks if present
          let cleanJson = aiResponseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          
          // First try direct parsing
          const tripPlanJson = JSON.parse(cleanJson);
          console.log("✅ Direct parsing successful");

          // Validate the response structure
          if (!tripPlanJson.tripPlan || !Array.isArray(tripPlanJson.tripPlan) || tripPlanJson.tripPlan.length === 0) {
            console.error("❌ Invalid response structure");
            throw new Error("The AI returned an invalid trip plan structure");
          }

          // Check if we have the right number of days
          if (tripPlanJson.tripPlan.length < duration) {
            console.log("⚠️  AI returned fewer days than requested, adding placeholder days");
            
            // Fill in missing days with generic content
            for (let i = tripPlanJson.tripPlan.length + 1; i <= duration; i++) {
              tripPlanJson.tripPlan.push({
                day: i,
                location: `${citiesString.split(',')[0]} - Day ${i}`,
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

          // Validate hiddenPlaces if requested
          if (tripPlanJson.tripPlan.some(day => userInput.includeHiddenPlace && !day.hiddenPlaces)) {
            console.log("🔄 Converting hiddenPlace to hiddenPlaces array if needed");
            
            // Convert any single hiddenPlace strings to arrays
            tripPlanJson.tripPlan.forEach(day => {
              if (userInput.includeHiddenPlace) {
                if (day.hiddenPlace && !day.hiddenPlaces) {
                  // If there's only hiddenPlace but not hiddenPlaces, convert it
                  day.hiddenPlaces = [day.hiddenPlace];
                  delete day.hiddenPlace;
                } else if (!day.hiddenPlaces) {
                  // If neither exists, add empty array
                  day.hiddenPlaces = ["Hidden gem information not available"];
                }
              }
            });
          }
          
          console.log(`✅ Trip plan validated: ${tripPlanJson.tripPlan.length} days`);
          return tripPlanJson;
          
        } catch (parseError) {
          console.log("⚠️  Direct parsing failed, attempting to extract JSON");
          try {
            // Find JSON using regex pattern matching
            const jsonRegex = /{[\s\S]*}/g;
            const jsonMatch = aiResponseText.match(jsonRegex);
            
            if (jsonMatch && jsonMatch[0]) {
              const extractedJson = JSON.parse(jsonMatch[0]);
              console.log("✅ JSON extraction successful");
              return extractedJson;
            } else {
              throw new Error("Could not extract valid JSON from response");
            }
          } catch (extractError) {
            console.error("❌ JSON extraction failed:", extractError);
            throw new Error("Failed to parse AI response into valid JSON format");
          }
        }
        
     } catch (error) {
        console.error("❌ Error calling AI API:", error.response ? error.response.data : error.message);
        
        // Extract status code from the error
        let statusCode = 500; // default
        
        if (error.response) {
            // Axios error with response
            statusCode = error.response.status;
        } else if (error.response?.data?.error?.code) {
            // Gemini API specific error format
            statusCode = error.response.data.error.code;
        }
        
        // Create error with proper status code
        const err = new Error(
            statusCode === 503 
                ? 'The AI service is temporarily overloaded. Please try again in a few moments.'
                : 'Failed to generate trip plan. Please try again.'
        );
        err.status = statusCode;
        
        // Throw the error so it can be caught by the error middleware
        throw err;
   } 
}

module.exports = { getTripPlan };