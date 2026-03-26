const passport = require('passport');
const AsgardeoStrategy = require('@asgardeo/passport-asgardeo');

const BASE_URL = 'https://api.asgardeo.io/t/roamly';

passport.use(
    new AsgardeoStrategy(
        {
            issuer: BASE_URL + '/oauth2/token',
            authorizationURL: BASE_URL + '/oauth2/authorize',
            tokenURL: BASE_URL + '/oauth2/token',
            userInfoURL: BASE_URL + '/oauth2/userinfo',
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: '/oauth2/redirect',
            scope: ["profile internal_login"]
        },
        function verify(
            issuer,
            uiProfile,
            idProfile,
            context,
            idToken,
            accessToken,
            refreshToken,
            params,
            verified
        ) {
            return verified(null, { uiProfile, accessToken: accessToken, });
        }
    )
);

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
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
