const mongoose = require("../config/dbconfig.js")
// const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    googleid : String,
    name: String,
    picture: String,
    email : String,
    icode : String,
    role: {
        type: String,
        enum: {
        values: ['undefined', 'admin', 'student', 'requested'],
        message: '{VALUE} is not supported'
        }
    },
    institute : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    instituteName : String,
    instituteLogo : String,
    class : String,
    section : String,
    roll : String
});

const User = mongoose.model("User", userSchema);
module.exports = User;
  