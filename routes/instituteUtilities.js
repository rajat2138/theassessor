const User = require("../models/userModel")
const Request = require("../models/requestModel")
const ensureAdmin = require("../functions/ensureAdmin")
const mongoose = require("../config/dbconfig.js")
const isValidObjectId = require("../functions/validateObjectId")
const Test = require("../models/testModel")
const calculateResult = require("../functions/calculateResults")
const Participation = require("../models/ParticipationModel")

module.exports = (app) => {

    app.get("/institute", ensureAdmin, function (req, res) {
        res.render("./admin/home", { user: req.user[0] })
    })
    app.post("/refresh-student-invitation-code", ensureAdmin, function (req, res) {
        const icode = new Date().valueOf();
        User.findOneAndUpdate({ _id: req.user[0]._id }, { $set: { icode: icode } }, function (err, update) {
            if (err) {
                const msg = "Some Error Occured. Please try again."
                res.render("custom", { user: req.user[0], msg: msg })
            }
            else {
                res.redirect("/institute")
            }
        })
    })
    app.get("/get-student-invitation-code", ensureAdmin, function (req, res) {
        const icode = new Date().valueOf();
        User.findById(req.user[0]._id, function (err, user) {
            if (err) {
                res.status(200).json({ icode: "Error" })
            }
            else {
                res.status(200).json({ icode: user.icode })
            }
        })
    })
    app.get("/count-student-requests", ensureAdmin, function (req, res) {
        const institute = mongoose.Types.ObjectId(req.user[0]._id)
        Request.find({ institute: institute }, function (err, requests) {
            if (err) {
                res.status(200).json({ icode: "Error" })
            }
            else {
                const count = requests.length;
                res.status(200).json({ count: count })
            }
        })
    })

    app.get("/view-student-requests", ensureAdmin, function (req, res) {
        res.render("./admin/studentRequests", { user: req.user[0] })
    })

    app.get("/get-student-requests", ensureAdmin, function (req, res) {
        const institute = mongoose.Types.ObjectId(req.user[0]._id)
        Request.find({ institute: institute }).populate("student").exec(function (err, requests) {
            if (err) {
                const msg = "Some Error Occured. Please try again."
                res.render("custom", { user: req.user[0], msg: msg })
            }
            else {
                res.status(200).json({ requests: requests })
            }
        })
    })

    app.post("/request/accept", ensureAdmin, function (req, res) {
        Request.findOne({ student: req.body.student }, function (err, request) {
            if (err) {
                const msg = "Some Error Occured. Please try again."
                res.render("custom", { user: req.user[0], msg: msg })
            }
            else {
                if (!request) {
                    const msg = "No such user exist."
                    res.render("custom", { user: req.user[0], msg: msg })
                }
                else {
                    if (request.institute == req.user[0]._id) {
                        const update = {
                            role: "student",
                            class: request.class,
                            section: request.section,
                            roll: request.roll,
                            institute: req.user[0]._id,
                            instituteName: req.user[0].instituteName,
                            instituteLogo: req.user[0].instituteLogo
                        }
                        User.updateOne({ _id: request.student }, { "$set": update }, function (err, status) {
                            if (err) {
                                const msg = "Some Error Occured. Please try again."
                                res.render("custom", { user: req.user[0], msg: msg })
                            }
                            else {
                                Request.deleteOne({ _id: request._id }, function (err) {
                                    if (err) {
                                        const msg = "Some Error Occured. Please try again."
                                        res.render("custom", { user: req.user[0], msg: msg })
                                    }
                                    else {
                                        res.redirect("/view-student-requests")
                                    }
                                })
                            }
                        })
                    }
                    else {
                        const msg = "You're not authorized for this operation"
                        res.render("custom", { user: req.user[0], msg: msg })
                    }
                }
            }
        })
    })

    app.post("/request/reject", ensureAdmin, function (req, res) {
        Request.findOne({ student: req.body.student }, function (err, request) {
            if (err) {
                const msg = "Some Error Occured. Please try again."
                res.render("custom", { user: req.user[0], msg: msg })
            }
            else {
                if (!request) {
                    const msg = "No such user exist."
                    res.render("custom", { user: req.user[0], msg: msg })
                }
                else {
                    if (request.institute == req.user[0]._id) {
                        User.updateOne({ _id: request.student }, { "$set": { role: "undefined" } }, function (err, status) {
                            if (err) {
                                const msg = "Some Error Occured. Please try again."
                                res.render("custom", { user: req.user[0], msg: msg })
                            }
                            else {
                                Request.deleteOne({ _id: request._id }, function (err) {
                                    if (err) {
                                        const msg = "Some Error Occured. Please try again."
                                        res.render("custom", { user: req.user[0], msg: msg })
                                    }
                                    else {
                                        res.redirect("/view-student-requests")
                                    }
                                })
                            }
                        })
                    }
                    else {
                        const msg = "You're not authorized for this operation"
                        res.render("custom", { user: req.user[0], msg: msg })
                    }
                }
            }
        })
    })

    app.post("/find-students", ensureAdmin, function (req, res) {
        if (req.body.class === "" || req.body.section === "") {
            const msg = "Please select class and section"
            res.render("custom", { user: req.user[0], msg: msg })
        }
        else {
            res.render("./admin/studentList", { user: req.user[0], filter: { class: req.body.class, section: req.body.section } })
        }
    })

    app.post("/get-students-list", ensureAdmin, function (req, res) {
        if (req.body.class === "" || req.body.section === "") {
            const msg = "Please select class and section"
            res.render("custom", { user: req.user[0], msg: msg })
        }
        else {
            const institute = mongoose.Types.ObjectId(req.user[0]._id)
            const filter = {
                institute: institute,
                class: req.body.class,
                section: req.body.section
            };
            User.find(filter, function (err, students) {
                if (err) {
                    res.status(200).json({})
                }
                else {
                    res.status(200).json(students)
                }
            })
        }
    })


    app.get("/test/results/:testId", ensureAdmin, function (req, res) {
        if (isValidObjectId(req.params.testId)) {
            const institute = mongoose.Types.ObjectId(req.user[0]._id)
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
                        if (test.results === "calculated") {
                            // Send the results
                            res.render("./admin/results", {user:req.user[0], testId:test._id})

                        }
                        else if (test.results === "not-calculated") {
                            const currTime = new Date().valueOf()
                            const endTime = test.startTime.valueOf() + (parseInt(test.duration) + parseInt(test.windowTime) + 1) * 60000
                            if (currTime > endTime) {
                                Test.updateOne({ _id: test._id }, { "$set": { results: "in-progress" } }, function (err, data) {
                                    if (err) {
                                        res.render("custom", { user: req.user[0], msg: "Some Error Occured" })
                                    }
                                    else {
                                        // calculate the results
                                        calculateResult(testId)
                                        res.render("custom", { user: req.user[0], msg: "Please wait while we prepare results for you." })
                                    }
                                })
                            }
                            else {
                                res.render("custom", { user: req.user[0], msg: "Please wait for the test to end." })
                            }

                        }
                        else {
                            res.render("custom", { user: req.user[0], msg: "Results in-progress." })
                        }
                    }
                }
            })
        }
        else {
            res.render("custom", { user: req.user[0], msg: "Not a valid test id" })
        }
    })

    app.get("/institute/api/test/results/:testId", ensureAdmin, function(req,res){
        if(isValidObjectId(req.params.testId)){
            const testId = mongoose.Types.ObjectId(req.params.testId)
            Participation.find({test : testId}).populate("student").exec(function(err,data){
                if(err){
                    res.status(200).json({"msg":"Error Occurred"})
                }
                else{
                    if(data.length===0){
                        res.status(200).json({"msg":"No Participants"})
                    }
                    else{
                        res.status(200).json({"msg":"success", "resultData" : data})
                    }
                }
            })
        }
    })

    app.get("/test/attendees/:testId", ensureAdmin, function (req, res) {
        if (isValidObjectId(req.params.testId)) {
            const institute = mongoose.Types.ObjectId(req.user[0]._id)
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
                        res.render("./admin/attendees", {user:req.user[0], testId:test._id})
                    }
                }
            })
        }
        else {
            res.render("custom", { user: req.user[0], msg: "Not a valid test id" })
        }
    })

    app.get("/institute/api/test/attendees/:testId", ensureAdmin, function(req,res){
        if(isValidObjectId(req.params.testId)){
        const testId = mongoose.Types.ObjectId(req.params.testId)
        Participation.find({ test: testId }).populate("student").exec(function (err, data) {
            if (err) {
                res.send(err)
            }
            else {
                var count = 0, length = data.length, sendingData = [];
                data.forEach(d => {
                    sendingData.push(d.student)
                    count++;
                    if (length === count) {
                        res.send({"msg":"success","sendingData":sendingData})
                    }
                })
            }
        })
        }
    })

}