const { createClient } = require('redis');

let redisClient = null;
let isConnected = false;

const redisUrl = process.env.REDIS_URL;

if (redisUrl) {
    redisClient = createClient({
        url: redisUrl,
        socket: {
            reconnectStrategy: (retries) => {
                if (retries > 10) {
                    console.error('❌ Redis: Reconnection retries exhausted');
                    return new Error('Redis retry exhausted');
                }
                return Math.min(retries * 100, 3000);
            }
        }
    });

    redisClient.on('error', (err) => {
        console.error('❌ Redis Client Error:', err.message);
        isConnected = false;
    });

    redisClient.on('connect', () => {
        console.log('⚡ Redis Client Connecting...');
    });

    redisClient.on('ready', () => {
        console.log('✅ Redis Client Ready and Connected');
        isConnected = true;
    });

    redisClient.on('end', () => {
        isConnected = false;
    });

    // Auto-connect if not already open
    (async () => {
        try {
            if (!redisClient.isOpen) {
                await redisClient.connect();
            }
        } catch (err) {
            console.error('⚠️ Could not establish initial Redis connection:', err.message);
        }
    })();
}

// Safe helpers that don't crash if Redis is unavailable or disconnected
const safeGet = async (key) => {
    if (!redisClient || !redisClient.isReady) return null;
    try {
        return await redisClient.get(key);
    } catch (err) {
        console.error(`Redis safeGet error on "${key}":`, err.message);
        return null;
    }
};

const safeSet = async (key, value, options = {}) => {
    if (!redisClient || !redisClient.isReady) return false;
    try {
        await redisClient.set(key, value, options);
        return true;
    } catch (err) {
        console.error(`Redis safeSet error on "${key}":`, err.message);
        return false;
    }
};

const isRedisAvailable = () => {
    return Boolean(redisClient && redisClient.isReady);
};

module.exports = {
    redisClient,
    safeGet,
    safeSet,
    isRedisAvailable
};
