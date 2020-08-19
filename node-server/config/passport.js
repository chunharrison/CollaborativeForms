const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const User = mongoose.model("users");
const keys = require("../config/keys");
const opts = {};

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      User.findById(jwt_payload.id)
        .then(user => {
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch(err => console.log(err));
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user);
   });
   passport.deserializeUser(function(user, done) {
    done(null, user);
   });
   passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/auth/google/callback"
      },

      // TODO: HARRISON
      // add photos (profile.photos[0].value)
     function(request, accessToken, refreshToken, profile, done) {
        User.findOne({ googleId: profile.id }, function(err, user) {
          if (err) return done(err)
          if (user !== null) {
            return done(err, user);
          } else {
            newUser = new User({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              provider: profile.provider
            })
            newUser.save().then(() => {
              return done(err, user)
            })
          }
        }); // User.findOne
      }
    )
   );

  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:5000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'emails']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile)
    User.findOne({ facebookId: profile.id }, function(err, user) {
      if (err) return done(err)

      // there is no email address associated with the account
      if (profile.emails === undefined || profile.emails.length === 0) {
        console.log('facebook login error')
        return done(err, {error: "no email"})
      }

      if (user !== null) {
        return done(err, user);
      } else {
        // const userEmail = profile.email ? profile.emails[0].value : 'Facebook Account'
        newUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value ,
          facebookId: profile.id,
          provider: profile.provider
        })
        newUser.save().then(() => {
          return done(err, user)
        })
      }
    });
  }
  ));// passport.use

  passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_API_KEY,
    clientSecret: process.env.LINKEDIN_SECRET_KEY,
    callbackURL: "http://localhost:5000/auth/linkedin/callback",
    scope: ['r_emailaddress', 'r_liteprofile'],
    // state: true
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile)
    User.findOne({ linkedinId: profile.id }, function(err, user) {
      console.log('err:', err)
      if (err) return done(err)

      if (user !== null) {
        return done(err, user);
      } else {
        newUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value ,
          linkedinId: profile.id,
          provider: profile.provider
        })
        newUser.save().then(() => {
          return done(err, user)
        })
      }
    });
  }
));
};