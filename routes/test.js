const User = require("../models/userModel")
const Test = require("../models/testModel")
const ensureAdmin = require("../functions/ensureAdmin")
const mongoose = require("../config/dbconfig.js")
const isValidObjectId = require("../functions/validateObjectId")


module.exports = (app)=>{

    // Add a new test
    app.post("/test/add", ensureAdmin, function(req,res){
        const body = req.body
        const newTest = new Test({
            institute: req.user[0]._id,
            class : body.class,
            subject : body.subject,
            description : body.description,
            section : body.section,
            startTime : body.startTime,
            windowTime : body.windowTime,
            duration : body.duration,
            results : "not-calculated"
        })
        newTest.save(function(err){
            if(err){
                res.render("custom",{user:user[0],msg:"Some Error Occured"})
            }
            else{
                res.redirect("/test/"+newTest._id)
            }
        })
    })

    // Get All tests
    app.get("/tests",ensureAdmin, function(req,res){
        const institute = mongoose.Types.ObjectId(req.user[0]._id)
        Test.find({institute:institute},function(err,tests){
            if(err){
                res.status(200).json({"msg":"Some Error Occured, Please refresh this page"})
            }
            else{
                if(tests.length==0){
                    res.status(200).json({"msg":"No tests yet"})
                }
                else{
                    res.status(200).json({"msg":"Found",tests:tests})
                }
            } 
        })
    })

    app.get("/test-archives",ensureAdmin,function(req,res){
        res.render("./admin/testArchives",{user:req.user[0]})
    })

    // Get a particular test info
    app.get("/test/:testId", ensureAdmin,function(req,res){
        if (isValidObjectId(req.params.testId)) {
            const institute = mongoose.Types.ObjectId(req.user[0]._id)
            const testId = mongoose.Types.ObjectId(req.params.testId)
            Test.findOne({_id:testId,institute:institute}, function(err,test){
                if(err){
                    res.render("custom",{user:req.user[0],msg:"Some Error Occured"})
                }
                else{
                    if(!test){
                        res.render("custom",{user:req.user[0],msg:"Test not found"})
                    }
                    else {
                        res.render("./admin/testDetails",{user:req.user[0],test:test})
                    }
                } 
            }) 
        }
        else{
            res.render("custom",{user:req.user[0],msg:"Not a valid test id"})
        }
    })

    app.get("/test/get/upcoming",ensureAdmin, function(req,res){
        const filter = {
            institute : mongoose.Types.ObjectId(req.user[0]._id),
            startTime : {
                    $gte : new Date()
                }
            }
        Test.find(filter,function(err,tests){
            if(err){
                res.status(200).json({ icode: "Error" })
            }
            else{
                if(tests.length==0){
                    res.status(200).json({"msg":"No Upcoming Test"})
                }
                else{
                    res.status(200).json({"msg":"No Upcoming Test",tests:tests})
                }
            } 
        })
    })


    // // Update a particular test
    // app.post("/test/:testId/update", ensureAdmin,function(req,res){
    //     // const testId= mongoose.Types.ObjectId(req.params.testId)
    //     if (isValidObjectId(req.params.testId)) {
    //         const institute = mongoose.Types.ObjectId(req.user[0]._id)
    //         const body = req.body
    //         const newTest = new Test({
    //             institute: req.user[0]._id,
    //             class : body.class,
    //             subject : body.subject,
    //             description : body.description,
    //             section : body.section,
    //             startTime : body.startTime,
    //             windowTime : body.windowTime,
    //             duration : body.duration
    //         })
    //     }
    //     else{
    //         res.render("custom",{user:req.user[0],msg:"Not a valid test id"})
    //     }
    // })
}