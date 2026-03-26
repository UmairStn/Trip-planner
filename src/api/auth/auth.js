const passport = require('passport');
const AsgardeoStrategy = require('@asgardeo/passport-asgardeo');

const BASE_URL = 'https://api.asgardeo.io/t/roamly';

// Fail-safe: Check if variables exist before initializing
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

if (!clientId || !clientSecret) {
    console.error("CRITICAL ERROR: CLIENT_ID or CLIENT_SECRET is undefined in Vercel.");
} else {
    passport.use(
        new AsgardeoStrategy(
            {
                issuer: `${BASE_URL}/oauth2/token`,
                authorizationURL: `${BASE_URL}/oauth2/authorize`,
                tokenURL: `${BASE_URL}/oauth2/token`,
                userInfoURL: `${BASE_URL}/oauth2/userinfo`,
                clientID: clientId,
                clientSecret: clientSecret,
                callbackURL: process.env.VERCEL_URL 
                    ? `https://${process.env.VERCEL_URL}/oauth2/redirect` 
                    : 'http://localhost:3000/oauth2/redirect',
                scope: ["profile internal_login"]
            },
            function verify(issuer, uiProfile, idProfile, context, idToken, accessToken, refreshToken, params, verified) {
                return verified(null, { uiProfile, accessToken });
            }
        )
    );
}

passport.serializeUser((user, cb) => {
    process.nextTick(() => {
        cb(null, {
            id: user?.uiProfile?.id,
            username: user?.uiProfile?._json?.username,
            givenName: user?.uiProfile?.name?.givenName,
            familyName: user?.uiProfile?.name?.familyName,
        });
    });
});

passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;