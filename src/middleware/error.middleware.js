// src/middleware/error.middleware.js
/**
 * Centralized Error Handling Middleware
 * Handles all application errors and renders appropriate error pages
 */

// General error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });
    
    // Determine status code
    const statusCode = err.status || err.statusCode || 500;
    
    // Create user-friendly error messages
    let message = 'Something went wrong on our end. Please try again.';
    
    switch (statusCode) {
        case 400:
            message = 'Bad request. Please check your input and try again.';
            break;
        case 401:
            message = 'You are not authorized to access this resource.';
            break;
        case 403:
            message = 'Access to this resource is forbidden.';
            break;
        case 404:
            message = 'The page you are looking for could not be found.';
            break;
        case 429:
            message = 'Too many requests. Please slow down and try again later.';
            break;
        case 500:
            message = 'Internal server error. We are working to fix this issue.';
            break;
        case 502:
            message = 'Bad gateway. Please try again later.';
            break;
        case 503:
            message = 'Service temporarily unavailable. Please try again later.';
            break;
        default:
            message = 'An unexpected error occurred. Please try again.';
    }
    
    // Log critical errors for monitoring
    if (statusCode >= 500) {
        console.error('CRITICAL ERROR:', {
            statusCode,
            message: err.message,
            stack: err.stack,
            url: req.url,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        });
    }
    
    // Render error page
    res.status(statusCode).render('error', { 
        statusCode,
        message,
        error: process.env.NODE_ENV === 'production' ? {} : err,
        requestId: req.id || 'unknown',
        timestamp: new Date().toISOString()
    });
};

// 404 Not Found handler
const notFoundHandler = (req, res) => {
    // console.log('404 - Page not found:', {
    //     url: req.url,
    //     method: req.method,
    //     ip: req.ip,
    //     userAgent: req.get('User-Agent'),
    //     timestamp: new Date().toISOString()
    // });
    
    res.status(404).render('error', { 
        statusCode: 404,
        message: 'The page you are looking for does not exist. It may have been moved or deleted.',
        error: {},
        requestId: req.id || 'unknown',
        timestamp: new Date().toISOString()
    });
};

// Async error wrapper - catches errors in async route handlers
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Rate limit error handler
const rateLimitHandler = (statusCode, message) => {
    return (req, res) => {
        // console.log('Rate limit exceeded:', {
        //     statusCode,
        //     ip: req.ip,
        //     url: req.url,
        //     userAgent: req.get('User-Agent'),
        //     timestamp: new Date().toISOString()
        // });
        
        res.status(statusCode).render('error', {
            statusCode,
            message,
            error: {},
            requestId: req.id || 'unknown',
            timestamp: new Date().toISOString()
        });
    };
};

// Validation error handler
const validationErrorHandler = (errors, req, res, next) => {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    
    console.log('Validation error:', {
        errors: errors.array(),
        url: req.url,
        method: req.method,
        body: req.body,
        timestamp: new Date().toISOString()
    });
    
    const err = new Error(`Validation failed: ${errorMessages}`);
    err.status = 400;
    next(err);
};

// Database error handler
const dbErrorHandler = (err, req, res, next) => {
    if (err.name === 'MongoError' || err.name === 'MongooseError') {
        console.error('Database error:', {
            name: err.name,
            message: err.message,
            code: err.code,
            timestamp: new Date().toISOString()
        });
        
        const dbErr = new Error('Database connection issue. Please try again later.');
        dbErr.status = 503;
        return next(dbErr);
    }
    next(err);
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
    rateLimitHandler,
    validationErrorHandler,
    dbErrorHandler
};