//These functions are responsible for handling the logic of a request.
// They receive input from the request, process it (often by calling services),
// and return a response.
const crypto = require('crypto');
const axios = require('axios');
const AiPlan = require('../services/ai.services.js');
const UserInputs = require('../models/UserInputs.js');
const { asyncHandler } = require('../../middleware/error.middleware.js');
const { safeGet, safeSet } = require('../../config/redis.js');
const BASE_URL = 'https://api.asgardeo.io/t/roamly';
const qs = require("querystring");
const passport = require('passport');

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

        // Track user's trip generation count in cookie (safe small integer)
        req.session.tripCount = (req.session.tripCount || 0) + 1;

        // Call AI service using the processed data (REAL AI GENERATION)
        const tripPlan = await AiPlan.getTripPlan(processedData);

        // Render results directly to avoid Vercel redirect state loss
        return res.render('results', {
            tripPlan: tripPlan.tripPlan || [],
            status: tripPlan.status || "success",
            message: tripPlan.message || "",
            citiesString: processedData.cities || "",
            unsplashApiKey: process.env.UNSPLASH_API_KEY || "",
            tripData: processedData,
            sessionInfo: {
                tripCount: req.session.tripCount || 1
            }
        });

    } catch (error) {
        console.error("Error generating trip:", error);
        return res.render('results', {
            tripPlan: [],
            status: "error",
            message: error.message,
            citiesString: req.body?.userInputs?.cities || "",
            unsplashApiKey: process.env.UNSPLASH_API_KEY || "",
            tripData: req.body?.userInputs || {},
            sessionInfo: {
                tripCount: req.session?.tripCount || 0
            }
        });
    }
};

// Show trip results (if visited directly without post, redirect to planner)
module.exports.showTripResults = (req, res) => {
    return res.redirect('/generate-trip');
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

module.exports.loginPage = (req, res) => {
    if (req.isAuthenticated()) {
        res.render("index", { title: "Express", user: req.user });
    } else {
        res.render("login", { title: "Express" });
    }
}

module.exports.authenticate = passport.authenticate("asgardeo", {
    successRedirect: "/",
    failureRedirect: "/login",
});

module.exports.authLogout = (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);

        // Determine the base URL dynamically based on the environment
        const host = req.get('host');
        const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
        const baseUrl = process.env.ASGARDEO_REDIRECT_URL 
            ? process.env.ASGARDEO_REDIRECT_URL.replace('/oauth2/redirect', '') 
            : `${protocol}://${host}`;

        const params = {
            post_logout_redirect_uri: baseUrl,
            client_id: process.env.CLIENT_ID
        };

        res.redirect(`${BASE_URL}/oidc/logout?${qs.stringify(params)}`);
    });
};

// ============ REDIS OPTIMIZATIONS ============

// 1. Cached Unsplash Location Images (Prevents 50 req/hr rate limit)
module.exports.getLocationImage = async (req, res) => {
    try {
        const location = req.query.location;
        if (!location) {
            return res.status(400).json({ error: 'Location query parameter is required' });
        }

        const cacheKey = `img:${location.toLowerCase().trim()}`;
        const cachedUrl = await safeGet(cacheKey);

        if (cachedUrl) {
            return res.json({ imageUrl: cachedUrl, cached: true });
        }

        const accessKey = process.env.UNSPLASH_API_KEY;
        if (!accessKey) {
            return res.json({ imageUrl: null, message: 'No Unsplash key configured' });
        }

        const query = encodeURIComponent(`${location} Sri Lanka`);
        const url = `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape&client_id=${accessKey}`;
        const response = await axios.get(url, { timeout: 4000 });

        if (response.data && response.data.results && response.data.results.length > 0) {
            const imageUrl = response.data.results[0].urls.small;
            // Cache in Redis for 30 days (2592000s)
            await safeSet(cacheKey, imageUrl, { EX: 2592000 });
            return res.json({ imageUrl, cached: false });
        }

        return res.json({ imageUrl: null });
    } catch (err) {
        console.error('Error fetching/caching location image:', err.message);
        return res.json({ imageUrl: null, error: err.message });
    }
};

// 2. Create Shareable Trip Link (Stores in Redis for 30 days)
module.exports.createSharedTrip = async (req, res) => {
    try {
        const rawPlan = req.body.tripPlan || req.session?.tripPlan;
        const tripPlanList = Array.isArray(rawPlan) ? rawPlan : (rawPlan?.tripPlan || []);
        const formData = req.body.formData || req.session?.formData || {};

        if (!tripPlanList || tripPlanList.length === 0) {
            return res.status(400).json({ error: 'No active trip plan found to share.' });
        }

        const shareId = crypto.randomBytes(6).toString('hex');
        const payload = JSON.stringify({
            tripPlan: tripPlanList,
            formData: formData,
            sharedAt: new Date().toISOString()
        });

        // Store in Redis for 30 days (2592000s)
        const saved = await safeSet(`share:${shareId}`, payload, { EX: 2592000 });
        if (!saved) {
            return res.status(503).json({ error: 'Sharing requires a database/Redis connection to store the public link.' });
        }

        const host = req.get('host');
        const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
        const shareUrl = `${protocol}://${host}/trip/shared/${shareId}`;

        return res.json({ success: true, shareId, shareUrl });
    } catch (err) {
        console.error('Error creating shareable trip link:', err);
        return res.status(500).json({ error: 'Failed to generate share link' });
    }
};

// 3. View Shared Trip by ID (Read-only itinerary from Redis)
module.exports.showSharedTrip = async (req, res) => {
    try {
        const shareId = req.params.id;
        const dataStr = await safeGet(`share:${shareId}`);

        if (!dataStr) {
            return res.status(404).render('error', {
                statusCode: 404,
                message: 'This shared trip link has expired or does not exist.',
                error: {},
                requestId: req.id || 'unknown',
                timestamp: new Date().toISOString()
            });
        }

        const data = JSON.parse(dataStr);
        return res.render('results', {
            tripPlan: data.tripPlan || [],
            status: "success",
            message: "",
            citiesString: data.formData?.cities || "",
            unsplashApiKey: process.env.UNSPLASH_API_KEY || "",
            tripData: data.formData || {},
            isSharedView: true,
            sessionInfo: {
                tripCount: 0
            }
        });
    } catch (err) {
        console.error('Error rendering shared trip:', err);
        return res.status(500).render('error', {
            statusCode: 500,
            message: 'Error loading shared trip plan.',
            error: {},
            requestId: req.id || 'unknown',
            timestamp: new Date().toISOString()
        });
    }
};