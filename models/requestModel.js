const mongoose = require("../config/dbconfig.js")
// const passportLocalMongoose = require('passport-local-mongoose');

const requestSchema = new mongoose.Schema({
    student:{type: mongoose.Schema.Types.ObjectId, ref :'User'},
    institute: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    class : String,
    section : String,
    roll : String
});

const Request = mongoose.model("Request", requestSchema);
module.exports = Request;
  