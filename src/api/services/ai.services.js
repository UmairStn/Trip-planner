//This function will eventually hold your AI prompt generation and axios call.
// This function will handle the core logic of creating a trip plan.

const axios = require('axios');

// Test mode flag - set to true when testing UI
const TEST_MODE = false; // Toggle this to true when you want to skip API calls

// API Providers configuration
const AI_PROVIDERS = [
    {
        name: 'Gemini',
        enabled: !!process.env.GEMINI_API_KEY,
        apiKey: process.env.GEMINI_API_KEY
    },
    {
        name: 'OpenRouter',
        enabled: !!process.env.OPEN_ROUTER_API_KEY,
        apiKey: process.env.OPEN_ROUTER_API_KEY
    }
];

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
   if (TEST_MODE) {
     console.log("TEST MODE: Returning sample trip plan instead of calling API");
     return sampleTripPlan;
   }
   
   try {
        // extract values from user input
        const duration = userInput.duration;
        const interString = userInput.interests.join(", ");
        const budget = userInput.budget;
        const country = "Sri Lanka";
        const citiesString = userInput.cities ? userInput.cities.split(',').map(city => city.trim()).join(', ') : "major cities";
        const citiesArray = citiesString.split(',').map(city => city.trim());
        const needMoreCities = userInput.allowAiSuggestions && (citiesArray.length <= 2 && duration > 3);

        // ============================================
        // BUILD THE PROMPT - YOUR COMPLETE PROMPT HERE
        // ============================================
        const combinedPrompt = `You are an expert travel agent creating a personalized itinerary for Sri Lanka. 
                        Your response MUST be ONLY valid JSON with no additional text or markdown. 
                        Return a JSON object with a single key named 'tripPlan' containing an array of day objects.

                        Each day object MUST include:
                        - 'day': number (1, 2, 3...)
                        - 'location': string (specific area/city from Sri Lanka)
                        - 'description': string (100-150 words about the day)
                        - 'activities': array of 3-5 activity strings DIRECTLY RELATED TO: ${interString}
                        - 'meals': object with 'breakfast', 'lunch', and 'dinner' recommendations
                        - 'accommodation': string (hotel/lodging suggestion with approximate ${budget} price)
                        - 'transportationTips': string (how to get around)
                        ${userInput.includeHiddenPlace ? 
                          "- 'hiddenPlaces': array of 2-3 strings describing lesser-known local spots (each description should be concise)" : 
                          ""}

                        ${needMoreCities ? 
                          `The user has only specified ${citiesString} but the trip is ${duration} days long. Please suggest and include 2-3 additional nearby cities or attractions that match their interests in ${interString}.` : 
                          `Create a realistic ${duration}-day trip to Sri Lanka visiting these cities: ${citiesString}.`}

                        Budget: ${budget}
                        PRIMARY INTERESTS: ${interString}
                        
                        🔥 CRITICAL: EVERY DAY MUST FOCUS ON THESE INTERESTS: ${interString} 🔥
                        
                        IMPORTANT INTEREST-BASED RECOMMENDATIONS:
                        ${interString.toLowerCase().includes('partie') || interString.toLowerCase().includes('pub') || interString.toLowerCase().includes('nightlife') || interString.toLowerCase().includes('bar') || interString.toLowerCase().includes('club') ? 
                          `🎉 NIGHTLIFE & PARTIES - MANDATORY:
                          - Include specific nightlife activities: bars, clubs, beach parties, rooftop lounges
                          - Recommend areas: Colombo Fort, Galle Road, Mirissa, Hikkaduwa, Unawatuna
                          - Suggest specific venues: Ministry of Crab Bar, Barefoot Garden Cafe, The Empire nightclub
                          - Include late-night dining, DJ nights, live music venues
                          - Add beach parties and sunset bars` : 
                          ''}
                        ${interString.toLowerCase().includes('beach') || interString.toLowerCase().includes('ocean') || interString.toLowerCase().includes('sea') ? 
                          `🏖️ BEACHES - MANDATORY:
                          - Prioritize coastal locations and beach towns
                          - Include water activities: surfing, snorkeling, diving, whale watching
                          - Recommend beach clubs and seaside restaurants` : 
                          ''}
                        ${interString.toLowerCase().includes('culture') || interString.toLowerCase().includes('temple') || interString.toLowerCase().includes('heritage') || interString.toLowerCase().includes('history') ? 
                          `🏛️ CULTURE & HERITAGE - MANDATORY:
                          - Focus on UNESCO sites, ancient temples, cultural shows
                          - Include local craft workshops and traditional performances
                          - Visit museums and historical landmarks` : 
                          ''}
                        ${interString.toLowerCase().includes('adventure') || interString.toLowerCase().includes('hiking') || interString.toLowerCase().includes('trekking') ? 
                          `⛰️ ADVENTURE - MANDATORY:
                          - Include trekking, hiking trails, rock climbing
                          - Add adventure sports: zip-lining, white water rafting
                          - Recommend mountain peaks and jungle treks` : 
                          ''}
                        ${interString.toLowerCase().includes('wildlife') || interString.toLowerCase().includes('safari') || interString.toLowerCase().includes('nature') ? 
                          `🐘 WILDLIFE & NATURE - MANDATORY:
                          - Include national parks and safari experiences
                          - Add wildlife watching opportunities
                          - Recommend nature reserves and eco-lodges` : 
                          ''}
                        ${interString.toLowerCase().includes('food') || interString.toLowerCase().includes('cuisine') || interString.toLowerCase().includes('culinary') ? 
                          `🍛 FOOD & CUISINE - MANDATORY:
                          - Focus on cooking classes and food tours
                          - Recommend street food markets and local eateries
                          - Include tea plantation visits` : 
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
        // TRY EACH API WITH AUTOMATIC FALLBACK
        // ============================================
        const enabledProviders = AI_PROVIDERS.filter(p => p.enabled);
        
        if (enabledProviders.length === 0) {
            throw new Error('No AI providers configured. Add API keys to .env file');
        }

        let lastError = null;

        // Try each provider
        for (const provider of enabledProviders) {
            try {
                console.log(`🤖 Trying ${provider.name} API...`);
                
                let apiUrl, payload, headers;

                if (provider.name === 'Gemini') {
                    apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${provider.apiKey}`;
                    payload = {
                        contents: [{
                            parts: [{
                                text: combinedPrompt
                            }]
                        }]
                    };
                } else if (provider.name === 'OpenRouter') {
                    apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
                    headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${provider.apiKey}`
                    };
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
                }

                // Make the API request with timeout
                const response = await axios.post(apiUrl, payload, { 
                    headers,
                    timeout: 45000 // 45 second timeout
                });
                
                // Parse response based on provider
                let aiResponseText;
                
                if (provider.name === 'Gemini') {
                    if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
                        throw new Error("Invalid Gemini API response structure");
                    }
                    aiResponseText = response.data.candidates[0].content.parts[0].text;
                    console.log("✅ Gemini API responded successfully");
                } else if (provider.name === 'OpenRouter') {
                    if (!response.data || !response.data.choices || !response.data.choices[0]) {
                        throw new Error("Invalid OpenRouter API response structure");
                    }
                    aiResponseText = response.data.choices[0].message.content;
                    console.log("✅ OpenRouter API responded successfully");
                }

                // ============================================
                // JSON PARSING (SAME FOR BOTH APIs)
                // ============================================
                try {
                  // Remove markdown code blocks if present
                  let cleanJson = aiResponseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                  
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
                    
                    tripPlanJson.tripPlan.forEach(day => {
                      if (userInput.includeHiddenPlace) {
                        if (day.hiddenPlace && !day.hiddenPlaces) {
                          day.hiddenPlaces = [day.hiddenPlace];
                          delete day.hiddenPlace;
                        } else if (!day.hiddenPlaces) {
                          day.hiddenPlaces = ["Hidden gem information not available"];
                        }
                      }
                    });
                  }
                  
                  console.log(`✅ Trip plan validated: ${tripPlanJson.tripPlan.length} days`);
                  return tripPlanJson; // ← SUCCESS! Return result
                  
                } catch (parseError) {
                  console.log("⚠️  Direct parsing failed, attempting to extract JSON");
                  const jsonRegex = /{[\s\S]*}/g;
                  const jsonMatch = aiResponseText.match(jsonRegex);
                  
                  if (jsonMatch && jsonMatch[0]) {
                    const extractedJson = JSON.parse(jsonMatch[0]);
                    console.log("✅ JSON extraction successful");
                    return extractedJson; // ← SUCCESS! Return result
                  } else {
                    throw new Error("Could not extract valid JSON from response");
                  }
                }

            } catch (providerError) {
                console.error(`❌ ${provider.name} failed:`, providerError.response?.data || providerError.message);
                lastError = providerError;
                // Continue to next provider
                console.log(`⚠️  Trying next provider...`);
            }
        }

        // All providers failed
        throw lastError || new Error('All AI providers failed');
        
     } catch (error) {
        console.error("❌ Error calling AI API:", error.response ? error.response.data : error.message);
        
        let statusCode = 500;
        
        if (error.response) {
            statusCode = error.response.status;
        } else if (error.response?.data?.error?.code) {
            statusCode = error.response.data.error.code;
        }
        
        const err = new Error(
            statusCode === 503 
                ? 'All AI services are temporarily overloaded. Please try again in a few moments.'
                : 'Failed to generate trip plan. Please try again.'
        );
        err.status = statusCode;
        
        throw err;
   } 
}

module.exports = { getTripPlan };