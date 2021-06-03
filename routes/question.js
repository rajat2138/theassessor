const mongoose = require("../config/dbconfig.js")

const User = require("../models/userModel")
const Test = require("../models/testModel")
const Question = require("../models/questionModel")

const ensureAdmin = require("../functions/ensureAdmin")
const isValidObjectId = require("../functions/validateObjectId")

module.exports = (app) => {

    // Send questions to the admin
    app.get("/test/:testId/questions",ensureAdmin, function (req, res) {
        if (isValidObjectId(req.params.testId)) {
            Question.find({test:mongoose.Types.ObjectId(req.params.testId)}, function (err, questions) {
                if (err) {
                    res.status(200).json({"msg":"Error Accessing Database"})
                }
                else{
                    if(questions.length==0){
                        res.status(200).json({"msg":"No Questions Yet"})
                    }
                    else{
                        res.status(200).json({"msg":"","questions":questions})
                    }
                }
            })
        }
        else{
            res.status(200).json({"msg":"Not A Valid Test"})
        }
    })

    // Add MCQ-4 Type Questions
    app.post("/test/:testId/question/mcq4/add", ensureAdmin, function (req, res) {
        if (isValidObjectId(req.params.testId)) {
            const newQues = new Question({
                test: mongoose.Types.ObjectId(req.params.testId),
                questionType:"mcq4",
                statement: req.body.statement,
                image : req.body.image,
                option1 : req.body.option1,
                option2: req.body.option2,
                option3: req.body.option3,
                option4: req.body.option4,
                correct: req.body.correct,
            })
            newQues.save(function(err) {
                if(err){
                    res.render("custom",{user:req.user[0],msg:"Some Error Occured"})
                }
                else{
                    res.redirect("/test/"+req.params.testId)
                }
            })
        }   
        else{
            res.render("custom",{user:req.user[0],msg:"Not a valid test id"})
        }
    })

    // Update MCQ-4 Type Question
    app.post("/test/:testId/question/mcq4/update/:quesId", ensureAdmin, function (req, res) {
        if (isValidObjectId(req.params.quesId)) {
            const update = {
                statement: req.body.statement,
                image : req.body.image,
                option1 : req.body.option1,
                option2 : req.body.option2,
                option3: req.body.option3,
                option4: req.body.option4,
                correct : req.body.correct
            };
            const id = {_id : req.params.quesId};
            Question.updateOne(id,{"$set": update},function(err,question){
                if(err){
                    res.render("custom",{user:req.user[0],msg:"Some Error Occured"})
                }
                else{
                    res.redirect("/test/"+req.params.testId)
                } 
            })
        }   
        else{
            res.render("custom",{user:req.user[0],msg:"Not a valid question id"})
        }
    })

    // Add MCQ-2 Type Questions
    app.post("/test/:testId/question/mcq2/add", ensureAdmin, function (req, res) {
        if (isValidObjectId(req.params.testId)) {
            const newQues = new Question({
                test: mongoose.Types.ObjectId(req.params.testId),
                questionType:"mcq2",
                statement: req.body.statement,
                image : req.body.image,
                option1 : req.body.option1,
                option2: req.body.option2,
                correct: req.body.correct,
            })
            newQues.save(function(err) {
                if(err){
                    res.render("custom",{user:req.user[0],msg:"Some Error Occured"})
                }
                else{
                    res.redirect("/test/"+req.params.testId)
                }
            })
        }   
        else{
            res.render("custom",{user:req.user[0],msg:"Not a valid test id"})
        }
    })

    // Update MCQ-2 Type Question
    app.post("/test/:testId/question/mcq2/update/:quesId", ensureAdmin, function (req, res) {
        if (isValidObjectId(req.params.quesId)) {
            const update = {
                statement: req.body.statement,
                image : req.body.image,
                option1 : req.body.option1,
                option2 : req.body.option2,
                correct : req.body.correct
            };
            const id = {_id : req.params.quesId};
            Question.updateOne(id,{"$set": update},function(err,question){
                if(err){
                    res.render("custom",{user:req.user[0],msg:"Some Error Occured"})
                }
                else{
                    res.redirect("/test/"+req.params.testId)
                } 
            })
        }   
        else{
            res.render("custom",{user:req.user[0],msg:"Not a valid question id"})
        }
    })

    // Add One-Word Type Questions
    app.post("/test/:testId/question/oneword/add", ensureAdmin, function (req, res) {
        if (isValidObjectId(req.params.testId)) {
            const newQues = new Question({
                test: mongoose.Types.ObjectId(req.params.testId),
                questionType:"oneword",
                statement: req.body.statement,
                image : req.body.image,
                correct: req.body.correct,
            })
            newQues.save(function(err) {
                if(err){
                    res.render("custom",{user:req.user[0],msg:"Some Error Occured"})
                }
                else{
                    res.redirect("/test/"+req.params.testId)
                }
            })
        }   
        else{
            res.render("custom",{user:req.user[0],msg:"Not a valid test id"})
        }
    })

    // Update One-Word Type Question
    app.post("/test/:testId/question/oneword/update/:quesId", ensureAdmin, function (req, res) {
        if (isValidObjectId(req.params.quesId)) {
            const update = {
                statement: req.body.statement,
                image : req.body.image,
                correct : req.body.correct
            };
            const id = {_id : req.params.quesId};
            Question.updateOne(id,{"$set": update},function(err,question){
                if(err){
                    res.render("custom",{user:req.user[0],msg:"Some Error Occured"})
                }
                else{
                    res.redirect("/test/"+req.params.testId)
                } 
            })
        }   
        else{
            res.render("custom",{user:req.user[0],msg:"Not a valid question id"})
        }
    })


    // Add Subjective Type Questions
    app.post("/test/:testId/question/subjective/add", ensureAdmin, function (req, res) {
        if (isValidObjectId(req.params.testId)) {
            const newQues = new Question({
                test: mongoose.Types.ObjectId(req.params.testId),
                questionType:"subjective",
                statement: req.body.statement,
                image : req.body.image,
            })
            newQues.save(function(err) {
                if(err){
                    res.render("custom",{user:req.user[0],msg:"Some Error Occured"})
                }
                else{
                    res.redirect("/test/"+req.params.testId)
                }
            })
        }   
        else{
            res.render("custom",{user:req.user[0],msg:"Not a valid test id"})
        }
    })

    // Update Subjective Type Question
    app.post("/test/:testId/question/subjective/update/:quesId", ensureAdmin, function (req, res) {
        if (isValidObjectId(req.params.quesId)) {
            const update = {
                statement: req.body.statement,
                image : req.body.image,
            };
            const id = {_id : req.params.quesId};
            Question.updateOne(id,{"$set": update},function(err,question){
                if(err){
                    res.render("custom",{user:req.user[0],msg:"Some Error Occured"})
                }
                else{
                    res.redirect("/test/"+req.params.testId)
                } 
            })
        }   
        else{
            res.render("custom",{user:req.user[0],msg:"Not a valid question id"})
        }
    })

    // Delete a question
    app.post("/test/:testId/question/delete/:quesId", ensureAdmin, function (req, res) {
        if (isValidObjectId(req.params.quesId)) {
            const id = req.params.quesId;
            Question.findByIdAndRemove(id,function(err){
                if(err){
                    res.render("custom",{user:req.user[0],msg:"Some Error Occured"})
                }
                else{
                    res.redirect("/test/"+req.params.testId)
                } 
            })
        }   
        else{
            res.render("custom",{user:req.user[0],msg:"Not a valid question id"})
        }
    })
    

    

    

}