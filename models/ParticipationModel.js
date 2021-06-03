const mongoose = require("../config/dbconfig.js")

const participationSchema = new mongoose.Schema({
    test : { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
    student : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startedAt : Date,
    endTime : Date,
    timeTaken : String,
    duration : String,
    testStatus : String,
    score : String,
    ap : String,
    rank : String,
});

const Participation = mongoose.model("Participation", participationSchema);
module.exports = Participation;
  