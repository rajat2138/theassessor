const mongoose = require("../config/dbconfig.js")

const TestSchema = new mongoose.Schema({
    institute: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    class : String,
    subject : String,
    description : String,
    section : String,
    startTime : Date,
    windowTime : String,
    duration : String,
    results: String
});

const Test = mongoose.model("Test", TestSchema);
module.exports = Test;
  