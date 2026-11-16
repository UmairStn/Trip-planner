require('dotenv').config();
const ejsMate = require('ejs-mate');
const path = require('path');
const crypto = require('crypto'); // For session security

// const mongoose = require('mongoose');
const express = require('express');
const cookieSession = require('cookie-session');
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('connect-redis');
const { RedisStore: RateLimitRedisStore } = require('rate-limit-redis');
const { redisClient } = require('./src/config/redis.js');
//asgardeo
var createError = require("http-errors");
const passport = require('passport');

// Import routes and middleware
const tripRoutes = require('./src/api/routes/trip.route.js');

const {
    errorHandler,
    notFoundHandler,
    rateLimitHandler,
    dbErrorHandler
} = require('./src/middleware/error.middleware.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Vercel proxy so secure cookies are correctly generated over HTTPS
app.set('trust proxy', 1);

// Helper to initialize Redis store for rate limiters
const createRateLimitStore = (prefix) => {
    if (!redisClient) return undefined;
    return new RateLimitRedisStore({
        sendCommand: async (...args) => {
            if (!redisClient.isReady) {
                if (!redisClient.isOpen) {
                    await redisClient.connect().catch(() => {});
                }
            }
            if (redisClient.isReady) {
                return redisClient.sendCommand(args);
            }
            // Return dummy SHA during startup script load if client is still connecting
            if (args[0] === 'SCRIPT' && args[1] === 'LOAD') {
                return 'offline-script-sha';
            }
            return [0, 0];
        },
        prefix
    });
};

// RATE LIMITING CONFIGURATION
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    store: createRateLimitStore('rl:general:'),
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler(429, 'Too many requests from your IP address. Please wait 15 minutes before trying again.')
});

const tripLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3,
    store: createRateLimitStore('rl:trip:'),
    message: 'Too many trip generation requests. Please wait a minute before trying again.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler(429, 'You\'ve made too many trip planning requests. Please wait 1 minute before creating another trip plan.')
});

// Apply rate limiting (commented out for development)
// app.use(generalLimiter);

// Basic middleware setup
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// SECURE BROWSER COOKIE SESSION CONFIGURATION
// Uses signed, tamper-proof, httpOnly cookies directly in the browser
// Solves Vercel's stateless container wipes 100% without needing any Redis or external database!
const sessionSecret = process.env.SESSION_SECRET || 'trip-planner-fallback-secret-key-32chars';

app.use(cookieSession({
    name: 'tripPlanner.sig',
    keys: [sessionSecret],
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent client-side XSS access
    sameSite: 'lax' // Preserves session on Asgardeo OAuth redirect callbacks
}));

// Polyfill Passport 0.6+ session methods for cookie-session compatibility
app.use((req, res, next) => {
    if (req.session && !req.session.regenerate) {
        req.session.regenerate = (cb) => { if (cb) cb(); };
    }
    if (req.session && !req.session.save) {
        req.session.save = (cb) => { if (cb) cb(); };
    }
    next();
});

// ============ PASSPORT ASGARDEO SETUP ============
require('./src/api/auth/auth.js');

app.use(passport.initialize());
app.use(passport.session());
// ================================================

// Static files
app.use(express.static(path.join(__dirname, 'src/public')));

// Apply trip-specific rate limiting
app.use('/generate-trip', tripLimiter);

// Make auth user available in all EJS views
app.use((req, res, next) => {
    res.locals.currentUser = req.user || null;
    res.locals.isAuthenticated = req.isAuthenticated ? req.isAuthenticated() : false;
    next();
});

// Routes
app.use('/', tripRoutes);

// Test route
app.get('/test', (req, res) => {
    res.json({
        message: 'API is working',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Test error route (remove in production)
app.get('/test-error', (req, res, next) => {
    const error = new Error('This is a test error');
    error.status = 500;
    next(error);
});

// Error handling middleware (ORDER MATTERS!)
//app.use(dbErrorHandler); // Handle database errors first
app.use(errorHandler);   // General error handler
app.use(notFoundHandler); // 404 handler (must be last)

// Start server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
        console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔒 Session security enabled`);
        console.log(`⚡ Rate limiting configured`);
    });
}

// Export the app for Vercel
module.exports = app;

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Ensure this line is at the end of your app.js
module.exports = app;
