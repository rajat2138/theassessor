require("dotenv").config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const cookieSession = require('cookie-session');
const User = require("../models/userModel");


module.exports = (app)=>{
    // cookieSession config
    app.use(cookieSession({
        maxAge: 2 * 60 * 60 * 1000, // Two Hour Session Limit
        keys: [process.env.SESSION_SECRET]
    }));

    app.use(passport.initialize()); // Used to initialize passport
    app.use(passport.session()); // Used to persist login sessions

    // Strategy config
    passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5000/oauth/google/callback"
        },
        (accessToken, refreshToken, profile, cb) => {
            // passes the profile data to serializeUser
            // console.log(profile)
            User.find({googleid: profile.id},function(err,existinguser){
            if(err){
                return cb(err)
            }
            else{
                if(existinguser["length"]===0){
                    const newuser = new User({
                        googleid : profile.id,
                        name: profile.displayName,
                        picture: profile._json.picture,
                        email : profile._json.email,
                        role: "undefined",
                    })
                    newuser.save(function(err){
                        if (err){
                            return cb(err, null)
                        }
                        else{
                            return cb(null,newuser)
                        }
                    });
                }
                else{
                    if(existinguser.picture===profile._json.picture && existinguser.name===profile.displayName){
                        return cb(null,existinguser)
                    }
                    else{
                        const update = {"$set": {picture : profile._json.picture,name : profile.displayName}};
                        User.updateOne({_id:existinguser._id},update,function(err){
                            if(err){
                                return cb(err,null)
                            }
                            else{
                                return cb(null,existinguser)
                            }
                        })
                    }
                }
            }
            })        
        }
    ));

    // Used to stuff a piece of information into a cookie
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    // Used to decode the received cookie and persist session
    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    app.get('/oauth/google', passport.authenticate('google', {
        scope: ['profile','email'] // Used to specify the required data
    }));
    
    // The middleware receives the data from Google and runs the function on Strategy config
    app.get('/oauth/google/callback', passport.authenticate('google'), (req, res) => {
        res.redirect('/loginControl');
    });

    app.get("/login", function(req,res){
        if (req.user) {
            res.redirect("/loginControl")
        }
        else{
            res.redirect("/oauth/google")
        }
    })

    app.get('/logout', (req, res) => {
        req.logout(); 
        res.redirect('/');
    });    
}