const passport = require('passport');
const AsgardeoStrategy = require('@asgardeo/passport-asgardeo');

const BASE_URL = 'https://api.asgardeo.io/t/roamly';

// Use your Environment Variable for the redirect
// Fallback to localhost if the variable is missing (helps prevent crashes)
const redirectUri = process.env.ASGARDEO_REDIRECT_URL || 'http://localhost:5000/oauth2/redirect';

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

if (!clientId || !clientSecret) {
    console.error("CRITICAL ERROR: CLIENT_ID or CLIENT_SECRET is undefined.");
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
                // CHANGE THIS LINE:
                callbackURL: redirectUri, 
                scope: ["profile internal_login"]
            },
            function verify(issuer, uiProfile, idProfile, context, idToken, accessToken, refreshToken, params, verified) {
                return verified(null, { uiProfile, accessToken });
            }
        )
    );
}
// ... rest of your serialization code

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
