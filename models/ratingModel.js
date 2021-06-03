const mongoose = require("../config/dbconfig.js")

const ratingSchema = new mongoose.Schema({
    student : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ap : Number
});

const Rating = mongoose.model("Rating", ratingSchema);
module.exports = Rating;
  