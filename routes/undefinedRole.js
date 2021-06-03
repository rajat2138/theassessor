const User = require("../models/userModel")
const Request = require("../models/requestModel")

const ensuredLoginAndRoleUndefined = require("../functions/ensuredLoginAndRoleUndefined")

module.exports = (app) => {

    app.get("/defineRole", ensuredLoginAndRoleUndefined, function (req, res) {
        res.render("defineRole", { user: req.user[0] })
    })
    app.post("/defineRole/institute", ensuredLoginAndRoleUndefined, function (req, res) {
        if (req.body.code === process.env.CLIENT_CODE) {
            const id = { _id: req.user[0]._id }
            const update = {
                role: "admin",
                instituteName: req.body.instituteName,
                instituteLogo: req.user[0].picture,
                icode: new Date().valueOf()
            }
            User.updateOne(id, { "$set": update }, function (err, user) {
                if (err) {
                    const msg = "Some Error Occured. Please try again."
                    res.render("custom", { user: null, msg: msg })
                }
                else {
                    req.logout()
                    res.render("custom", { user: null, msg: "Success.\nPlease login again in 2 mins for the effect to take place" })
                }
            })
        }
        else {
            const msg = "Uh-oh! Invitation Code is not valid. Please try again."
            res.render("custom", { user: req.user[0], msg: msg })
        }
    })
    
    app.post("/defineRole/student", ensuredLoginAndRoleUndefined, function (req, res) {
        const icode = req.body.code;
        User.findOne({ icode: icode }, function(err, institute){
            if (err) {
                res.render("custom", { "msg": "Some error occurred. Please try again", user: req.user[0] })
            }
            else {
                if (!institute) {
                    res.render("custom", { "msg": "Invitation code is not valid", user: req.user[0] })
                }
                else {
                    const newRequest = new Request({
                        institute: institute._id,
                        student : req.user[0]._id,
                        class: req.body.studentClass,
                        section: req.body.studentSection,
                        roll: req.body.studentRoll
                    })
                    newRequest.save(function (err) {
                        if (err) {
                            res.render("custom", { "msg": "Some error occurred. Please try again", user: req.user[0] })
                        }
                        else {
                            User.updateOne({ _id: req.user[0]._id }, { "$set": { role: "requested" } }, function (err, data) {
                                if (err) {
                                    res.render("custom", { "msg": "Some error occurred. Please try again", user: req.user[0] })
                                }
                                else {
                                    const msg = "Success\nPlease login again in 2 mins for the effect to take place";
                                    req.logout();
                                    res.render("custom", { user: null, msg: msg });
                                }
                            })
                        }
                    })
                }
            }
        })
    })
}