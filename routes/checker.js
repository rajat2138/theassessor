const User = require("../models/userModel")
const mongoose = require("../config/dbconfig.js")
const Test = require("../models/testModel")
const Participation = require("../models/ParticipationModel")

module.exports = (app) => {

    app.get("/student-participation/:testId", (req, res) => {
        console.log(req.params.testId);
        const testId = mongoose.Types.ObjectId(req.params.testId)
        Participation.find({ test: testId }).populate("student").exec(function (err, data) {
            if (err) {
                res.send(err)
            }
            else {
                // res.send("Success")
                // console.log(data)
                var count = 0, length = data.length, sendingData = [];
                data.forEach(d => {
                    sendingData.push(d.student.roll)
                    count++;
                    if (length === count) {
                        res.send(sendingData)
                    }
                })
            }
        })
    })
    app.get("/students-roll",(req,res)=>{
        User.find({"instituteName":"Mohini Devi Memorial School","class":"12","role":"student"},(err,data)=>{
            if(err){
                res.send(err)
            }
            else{
                var count = 0, length = data.length, sendingData = [];
                data.forEach(d => {
                    sendingData.push(d.roll)
                    count++;
                    if (length === count) {
                        res.send(sendingData)
                    }
                })
            }
        })
    })
}