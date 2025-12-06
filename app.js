require('dotenv').config();
const ejsMate = require('ejs-mate');
const path = require('path');
const crypto = require('crypto'); // For session security

// const mongoose = require('mongoose');
const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');

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

// RATE LIMITING CONFIGURATION
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler(429, 'Too many requests from your IP address. Please wait 15 minutes before trying again.')
});

const tripLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 2,
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

// SECURE SESSION CONFIGURATION
const sessionConfig = {
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    name: 'tripPlanner.sid', // Custom session name
    resave: false,
    saveUninitialized: false, // More secure
    rolling: true, // Extend session on activity
    cookie: {
        httpOnly: true, // Prevent XSS
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict', // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
};
app.use(session(sessionConfig));

// Static files
app.use(express.static(path.join(__dirname, 'src/public')));

// Apply trip-specific rate limiting
app.use('/generate-trip', tripLimiter);

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
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Session security enabled`);
    console.log(`⚡ Rate limiting configured`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});