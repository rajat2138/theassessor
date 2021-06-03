const mongoose = require("../config/dbconfig.js")

const answerSchema = new mongoose.Schema({
    test : { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
    student : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    question : { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    answer : String
});

const Answer = mongoose.model("Answer", answerSchema);
module.exports = Answer;
  