const mongoose = require("../config/dbconfig.js")

const User = require("../models/userModel")
const Test = require("../models/testModel")
const Question = require("../models/questionModel")
const Participation = require("../models/ParticipationModel")
const Answer = require("../models/answerModel")
const Rating = require("../models/ratingModel")

const ensureStudent = require("../functions/ensureStudent")
const isValidObjectId = require("../functions/validateObjectId")
const validateObjectId = require("../functions/validateObjectId")


module.exports = (app) => {

    app.get("/student", ensureStudent, function (req, res) {
        res.render("./student/home", { user: req.user[0] })
    })
    app.get("/student/get-upcoming-tests", ensureStudent, function (req, res) {
        const datetime = new Date(new Date().valueOf() - 2 * 60 * 60 * 1000)
        const filter = {
            institute: mongoose.Types.ObjectId(req.user[0].institute),
            class: req.user[0].class,
            section: { $in: ["all", req.user[0].section] },
            startTime: {
                $gte: datetime
            }
        }
        Test.find(filter, function (err, tests) {
            if (err) {
                res.status(200).json({ msg: "Error" })
            }
            else {
                if (tests.length == 0) {
                    res.status(200).json({ "msg": "No Upcoming Test" })
                }
                else {
                    res.status(200).json({ tests: tests })
                }
            }
        })
    })
    app.get("/student/test-archives", ensureStudent, function (req, res) {
        res.render("./student/testArchives", { user: req.user[0] })
    })
    app.get("/student/get-tests", ensureStudent, function (req, res) {
        const filter = {
            institute: mongoose.Types.ObjectId(req.user[0].institute),
            class: req.user[0].class,
            section: { $in: ["all", req.user[0].section] },
        }
        Test.find(filter, function (err, tests) {
            if (err) {
                res.status(200).json({ msg: "Error" })
            }
            else {
                if (tests.length == 0) {
                    res.status(200).json({ "msg": "No Upcoming Test" })
                }
                else {
                    res.status(200).json({ tests: tests })
                }
            }
        })
    })
    app.get("/student/test/:testId", ensureStudent, function (req, res) {
        if (isValidObjectId(req.params.testId)) {
            const institute = mongoose.Types.ObjectId(req.user[0].institute)
            const testId = mongoose.Types.ObjectId(req.params.testId)
            Test.findOne({ _id: testId, institute: institute }, function (err, test) {
                if (err) {
                    res.render("custom", { user: req.user[0], msg: "Some Error Occured" })
                }
                else {
                    if (!test) {
                        res.render("custom", { user: req.user[0], msg: "Test not found" })
                    }
                    else {
                        res.render("./student/testDetails", { user: req.user[0], test: test })
                    }
                }
            })
        }
        else {
            res.render("custom", { user: req.user[0], msg: "Not a valid test id" })
        }
    })
    app.get("/student/test/:testId/questions", ensureStudent, function (req, res) {
        if (isValidObjectId(req.params.testId)) {
            const institute = mongoose.Types.ObjectId(req.user[0].institute)
            const testId = mongoose.Types.ObjectId(req.params.testId)
            Test.findOne({ _id: testId, institute: institute }, function (err, test) {
                if (err) {
                    res.render("custom", { user: req.user[0], msg: "Some Error Occured" })
                }
                else {
                    if (!test) {
                        res.render("custom", { user: req.user[0], msg: "Test not found" })
                    }
                    else {
                        const currTime = new Date().valueOf();
                        const testExpiry = new Date(test.startTime.valueOf() + (parseInt(test.duration) + parseInt(test.windowTime) + 5) * 60 * 1000).valueOf()
                        if (test.results === "calculated") {
                            Question.find({ test: mongoose.Types.ObjectId(req.params.testId) }, function (err, questions) {
                                if (err) {
                                    res.status(200).json({ "msg": "Error Accessing Database" })
                                }
                                else {
                                    if (questions.length == 0) {
                                        res.status(200).json({ "msg": "No Questions Yet" })
                                    }
                                    res.status(200).json({ "msg": "", "questions": questions })
                                }
                            })
                        }
                        else {
                            res.status(200).json({ "msg": "Questions inaccessible" })
                        }
                    }
                }
            })
        }
        else {
            res.render("custom", { user: req.user[0], msg: "Not a valid test id" })
        }
    })

    app.get("/student/test-instructions/:testId", ensureStudent, function (req, res) {
        const testId = mongoose.Types.ObjectId(req.params.testId);
        Test.findOne({ _id: testId }, function (err, test) {
            if (err) {
                res.send(err)
            }
            else {
                if (!test) {
                    res.send("Invalid code")
                }
                else {
                    res.render("./student/testInstruction", { user: req.user[0], test: test })
                }
            }
        })
    })

    app.post("/student/test/initiate/:testId", ensureStudent, function (req, res) {
        if (isValidObjectId(req.params.testId)) {
            const testId = mongoose.Types.ObjectId(req.params.testId)
            Test.findOne({ _id: testId }, function (err, test) {
                if (err) {
                    res.status(200).send({ "msg": "Error" })
                }
                else {
                    if (!test) {
                        const currTime = new Date().valueOf()
                    }
                    else {
                        const currTime = new Date().valueOf()
                        const user = req.user[0]
                        if (test.class === user.class && (test.section === user.section || test.section === "all") && currTime > test.startTime.valueOf()) {
                            Participation.findOne({ test: testId, student: user._id }, function (err, participation) {
                                if (err) {
                                    res.status(200).send({ "msg": "Error" })
                                }
                                else {
                                    if (!participation) {
                                        const timeRemaining = test.startTime.valueOf() + parseInt(test.windowTime) * 60 * 1000 - currTime;
                                        if (timeRemaining > 10000) {
                                            const endTime = new Date(currTime + parseInt(test.duration) * 60 * 1000)
                                            console.log(endTime);
                                            const newParticipation = new Participation({
                                                test: testId,
                                                student: user._id,
                                                startedAt: currTime,
                                                duration: test.duration,
                                                testStatus: "continue",
                                                endTime: endTime
                                            })
                                            newParticipation.save(function (err) {
                                                if (err) {
                                                    res.status(200).send({ "msg": "Error" })
                                                }
                                                else {
                                                    res.status(200).send({ "msg": "success", "pid": newParticipation._id })
                                                }
                                            })
                                        }
                                        else {
                                            res.status(200).send({ "msg": "Time's Up" })
                                        }
                                    }
                                    else {
                                        const endTime = participation.startedAt.valueOf() + parseInt(participation.duration) * 60 * 1000
                                        if (endTime - currTime > 5000 && participation.testStatus === "continue") {
                                            res.status(200).send({ "msg": "success", "pid": participation._id })
                                        }
                                        else {
                                            res.status(200).send({ "msg": "Time's Up" })
                                        }
                                    }
                                }
                            })
                        }
                        else {
                            res.status(200).send({ "msg": "Not a valid time" })
                        }
                    }
                }
            })
        }
        else {
            res.status(200).send({ "msg": "Invalid Test" })
        }
    })

    app.get("/student/test-page/:participationId", ensureStudent, function (req, res) {
        res.render("./student/testMode", { user: req.user[0], participationId: req.params.participationId })
    })

    app.get("/student/test/continue/:participationId", ensureStudent, function (req, res) {
        if (isValidObjectId(req.params.participationId)) {
            const participationId = mongoose.Types.ObjectId(req.params.participationId)
            Participation.findById(participationId, function (err, participation) {
                if (err) {
                    res.status(200).send({ "msg": "Error" })
                }
                else {
                    if (!participation) {
                        res.status(200).send({ "msg": "No Participation Found" })
                    }
                    else {
                        const currTime = new Date().valueOf();
                        const endTime = participation.endTime.valueOf()
                        if (endTime - currTime > 5000 && participation.testStatus === "continue") {
                            Question.find({ test: participation.test }, function (err, questions) {
                                if (err) {
                                    res.status(200).send({ "msg": "Error" })
                                }
                                else {
                                    var count = 0, length = questions.length, sendingData = [];
                                    questions.forEach(ques => {
                                        sendingData.push(
                                            {
                                                statement: ques.statement,
                                                image: ques.image,
                                                option1: ques.option1,
                                                option2: ques.option2,
                                                option3: ques.option3,
                                                option4: ques.option4,
                                            }
                                        )
                                        count++;
                                        if (length === count) {
                                            res.status(200).send({ questions: questions, endTime : participation.endTime})
                                        }
                                    })
                                }
                            })
                        }
                        else {
                            res.status(200).send({ "msg": "Time's Up" })
                        }
                    }
                }
            })
        }
        else {
            res.status(200).send({ "msg": "Invalid Test" })
        }
    })

    app.post("/student/test/end/:participationId", ensureStudent, function (req, res) {
        const currTime = new Date();
        if (isValidObjectId(req.params.participationId)) {
            const participationId = mongoose.Types.ObjectId(req.params.participationId)
            Participation.findById(participationId, function (err, participation) {
                if (err) {
                    res.status(200).send({ "msg": "Error" })
                }
                else {
                    if (!participation) {
                        res.status(200).send({ "msg": "No Participation Found" })
                    }
                    else {
                        const update = {
                            timeTaken: currTime.valueOf() - participation.startedAt.valueOf(),
                            testStatus: "end"
                        }
                        Participation.updateOne({ _id: participationId }, { "$set": update }, function (err, data) {
                            if (err) {
                                res.status(200).send({ user: req.user[0], "msg": "Some Error Occured" })
                            }
                            else {
                                res.status(200).send({ user: req.user[0], "msg": "success" })
                            }
                        })
                    }
                }
            })
        }
        else {
            res.status(200).send({ "msg": "Invalid Test" })
        }
    })

    app.post("/student/test/save-answer/:participationId", ensureStudent, function (req, res) {
        const currTime = new Date().valueOf();
        if (isValidObjectId(req.params.participationId)) {
            const participationId = mongoose.Types.ObjectId(req.params.participationId)
            Participation.findById(participationId, function (err, participation) {
                if (err) {
                    res.status(200).send({ "msg": "Error" })
                }
                else {
                    if (!participation) {
                        res.status(200).send({ "msg": "Invalid" })
                    }
                    else {
                        const endTime = participation.endTime.valueOf()
                        if (endTime > currTime) {
                            const filter = {
                                test: req.body.test,
                                student: req.user[0]._id,
                                question: req.body.question,
                            }
                            Answer.findOne(filter, function (err, savedAnswer) {
                                if (err) {
                                    res.status(200).send({ "msg": "Error" })
                                }
                                else {
                                    if (!savedAnswer) {
                                        const newAnswer = new Answer({
                                            test: req.body.test,
                                            student: req.user[0]._id,
                                            question: req.body.question,
                                            answer: req.body.answer
                                        })
                                        newAnswer.save(function (err) {
                                            if (err) {
                                                res.status(200).send({ "msg": "Error" })
                                            }
                                            else {
                                                res.status(200).send({ "msg": "success" })
                                            }
                                        })
                                    }
                                    else {
                                        Answer.updateOne(filter, { "$set": { answer: req.body.answer } }, function (err, savedAnswer) {
                                            if (err) {
                                                res.status(200).send({ "msg": "Error" })
                                            }
                                            else {
                                                res.status(200).send({ "msg": "success" })
                                            }
                                        })
                                    }
                                }
                            })
                        }
                        else {
                            res.status(200).send({ "msg": "Time's Up" })
                        }
                    }
                }
            })
        }
        else {
            res.status(200).send({ "msg": "Invalid Test" })
        }
    })

    app.get("/students/answer/:testId", ensureStudent, function (req, res) {
        if (validateObjectId(req.params.testId)) {
            const filter = {
                student: mongoose.Types.ObjectId(req.user[0]._id),
                test: mongoose.Types.ObjectId(req.params.testId)
            }
            Answer.find(filter, function (err, answers) {
                if (err) {
                    res.status(200).send({ "msg": "Error" })
                }
                else {
                    var count = 0, length = answers.length, savedAnswers = {};
                    if (length === 0) {
                        res.status(200).send({ "msg": "success", answers: savedAnswers })
                    }
                    answers.forEach(answer => {
                        savedAnswers[answer.question] = answer.answer
                        count++;
                        if (length === count || length === 0) {
                            res.status(200).send({ "msg": "success", answers: savedAnswers })
                        }
                    })
                }
            })
        }
        else {
            res.status(200).send("Invalid test")
        }
    })

    app.get("/student/api/test/results/:testId", ensureStudent, function (req, res) {
        if (isValidObjectId(req.params.testId)) {
            const filter = {
                student: mongoose.Types.ObjectId(req.user[0]._id),
                test: mongoose.Types.ObjectId(req.params.testId)
            }
            Participation.findOne(filter).exec(function (err, data) {
                if (err) {
                    res.status(200).json({ "msg": "Error Occurred" })
                }
                else {
                    if (data) {
                        res.status(200).json({ "msg": "success", "resultData": data })
                    }
                    else {
                        res.status(200).json({ "msg": "Yet to participate" })
                    }
                }
            })
        }
        else {
            res.status(200).json({ "msg": "Invalid test" })
        }
    })

    app.get("/student/api/ratings", ensureStudent, function (req, res) {
        const student = mongoose.Types.ObjectId(req.user[0]._id)
        Rating.findOne({ student: student },function (err, data) {
            if (err) {
                res.status(200).json({ "msg": "Error Occurred" })
            }
            else {
                if (data) {
                    var stars=0;
                    var level="Newbie"
                    var ap=data.ap;
                    if (ap==0) {
                        stars=0
                        level="Beginner"
                    }
                    else if(ap<50){
                        stars=1
                        level="Pupil"
                    }
                    else if(ap<100) {
                        stars=2 
                        level="Intermediate"
                    }
                    else if(ap<175) {
                        stars=3
                        level="Specialist"
                    }
                    else if(ap<275) {
                        stars=4 
                        level="Expert"
                    }
                    else if(ap<400) {
                        stars=5
                        level="Master"
                    }
                    else if(ap<550) {
                        stars=6
                        level="Grandmaster"
                    }
                    else{
                        stars=7 
                        level="Legendary"
                    }
                    res.status(200).json({ "msg": "success", "rating": ap, "stars" : stars, "level" : level })
                }
                else {
                    res.status(200).json({ "msg": "No points yet" })
                }
            }
        })
    })
}