const mongoose = require("../config/dbconfig.js")
const User = require("../models/userModel")
const Test = require("../models/testModel")
const Question = require("../models/questionModel")
const Participation = require("../models/ParticipationModel")
const Answer = require("../models/answerModel")
const Rating = require("../models/ratingModel")


module.exports = (testId) => {
    Test.findById(testId, function (err, test) {
        if (!err) {
            const currTime = new Date().valueOf()
            const endTime = test.startTime.valueOf() + (parseInt(test.duration) + parseInt(test.windowTime) + 1) * 60000
            if (currTime > endTime) {
                Question.find({ test: test._id }, function (err, questions) {
                    if (!err) {
                        Answer.find({ test: test._id }, function (err, answers) {
                            if (!err) {
                                Participation.find({test : test._id}, function(err, participations){
                                    if (!err) {
                                        getResults(questions, answers, participations, test.duration)
                                    }
                                })
                            }
                        })
                    }
                })
            }
        }
    })
}



function updateQuestionAccuracy(updates){
    updates.forEach(update =>{
        const qid = {
            _id: update._id
        };
        const updateData={
            correctAttempts : update.correctAttempts,
            toatalAttempts : update.toatalAttempts 
        }
        Question.updateOne(qid, {"$set" : updateData}, function(err,data){})
    })
}

function updateParticipation(updates,testId){
    const length = updates.length
    var i = 0
    updates.forEach(update =>{
        const filter = {
            _id : update._id,
        };
        const updateData={
            score : update.score,
            ap : update.ap
        }
        Participation.updateOne(filter, {"$set" : updateData}, function(err,data){
            if(!err){
                i++;
                if(length>=i){
                    Test.updateOne({_id:testId},{"$set" : { results : "calculated"}},function(err,data){
                    })
                }
            }
        })
    })
}

function updateRating(updates){
    updates.forEach(update =>{
        const sid = {
            student : mongoose.Types.ObjectId(update.student)
        };
        Rating.findOne(sid,function(err,data){
            if(!err){
                if(!data){
                    const newRating = new Rating({
                        student : mongoose.Types.ObjectId(update.student),
                        ap : update.ap
                    })
                    newRating.save()
                }
                else{
                    console.log(data);
                    Rating.updateOne({_id : data._id},{"$inc" : { ap : update.ap}},function(err,data){})
                }
            }
        })
    })
}


function getResults(questions, answers, participations, testDuration) {
    
    qnaMap = {};  // Question to correct answer map

    qcMap = {}; // Question to number of correct answer map
    qwMap = {}; // Question to number of wrong answer map

    questions.forEach(ques => {
        qnaMap[ques._id] = ques.correct.toLowerCase();
        qcMap[ques._id] = 0;
        qwMap[ques._id] = 0;
    })

    scoreMap = {}; // Students to number of correct answer map
    spMap = {}; // Students to positive point map
    snMap = {}; // Students to negative point map
    stMap = {}; // Students to test time map
    
    participations.forEach(p =>{
        var timeTaken =p.timeTaken
        if (timeTaken==undefined || timeTaken=="" || timeTaken==null) {
            timeTaken=p.duration*60*1000;
        }
        scoreMap[p.student]=0;
        spMap[p.student]=0;
        snMap[p.student]=0;
        stMap[p.student]=p.timeTaken
    })
    
    // Create question to accuracy map
    answers.forEach(answer => {
        var claim = answer.answer.toLowerCase();
        var correct = qnaMap[answer.question];
        if(claim===correct){
            qcMap[answer.question]+=1;
        }
        else{
            qwMap[answer.question]+=1;
        }
    })

    totalQuestion=questions.length
    // update Question's Correct and Total Attemmpts
    quesUpdates=[]
    questions.forEach(ques => {
        var correctAttempts = qcMap[ques._id]
        var toatalAttempts = parseInt(qcMap[ques._id])+parseInt(qwMap[ques._id])
        quesUpdates.push({
            _id : ques._id,
            correctAttempts : correctAttempts,
            toatalAttempts : toatalAttempts
        })
    })

    // Calculate score, positive and negative points
    answers.forEach(answer => {
        var claim = answer.answer.toLowerCase();
        var correct = qnaMap[answer.question];
        if(claim===correct){
            scoreMap[answer.student]+=1;
            spMap[answer.student] += 10 // Correct answer = 10 points
        }
        else{
            // Wrong answer =  ratio of correct attempts to total attempts normalized to scale 0-10
            var point= Math.round((parseInt(qcMap[answer.question])/(parseInt(qwMap[answer.question])+parseInt(qcMap[answer.question])))*10)
            if (point<1){
                point=1
            }
            snMap[answer.student] += point
        }
    })

    // Update student's scores and points
    studentUpdates=[]
    participations.forEach(p =>{
        // ap = (positive*duration - negative*timeTaken)/(noq*10) normalize to 100
        var ap = Math.round(((parseInt(spMap[p.student],10)*parseInt(testDuration*60000,10) - parseInt(snMap[p.student],10)*parseInt(stMap[p.student],10))/(questions.length*10*parseInt(testDuration*60000,10)))*100)
        if(ap<0){ ap=0;}
        if(ap==undefined || isNaN(ap) || ap==null ){ ap=scoreMap[p.student]*(100/totalQuestion);}
        studentUpdates.push({
            _id : p._id,
            student : p.student,
            score : scoreMap[p.student],
            ap : ap
        })
    })

    var testId="";
    if(participations.length>0){
        testId = participations[0].test
    }
    // Update question accuracy for all the questions

    updateQuestionAccuracy(quesUpdates)
    // Update scores and accessor points for all the students
    updateParticipation(studentUpdates, testId)
    // Update student's rating point in rating profile
    updateRating(studentUpdates)

    
    console.log(quesUpdates);
    console.log(studentUpdates);
    console.log(spMap,snMap);

}


// db.participations.findOne({_id: "60acc344d62dd9e9ca13bc8a",test: "60adfc7145a881481b929f94"})