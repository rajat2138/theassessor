const mongoose = require("../config/dbconfig.js")

const questionSchema = new mongoose.Schema({
    test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
    questionType: {
        type: String,
        enum: {
        values: ['mcq4', 'mcq2', 'oneword', 'subjective','multiple'],
        message: '{VALUE} is not supported'
        }
    },
    statement : String,
    image : String,
    option1 : String,
    option2 : String,
    option3 : String,
    option4 : String,
    correct : String,
    toatalAttempts : Number,
    correctAttempts: Number
});

const Question = mongoose.model("Question", questionSchema);
module.exports = Question;
  