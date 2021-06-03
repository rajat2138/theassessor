const User = require("../models/userModel")
const ensuredLogin = require("../functions/ensuredLogin")
const ensureAdmin = require("../functions/ensureAdmin")

module.exports = (app)=>{
    app.get("/loginControl", ensuredLogin, function(req,res){
        User.findOne({googleid: req.user[0].googleid},function(err,user){
            if(err){
                const msg="Some Error Occured. Please try again."
                res.render("custom",{user:null,msg:msg})
            }
            else{
                if(!user){
                    res.render("custom",{msg:"User Not Found",user :null})
                }
                else{
                    if(user.role==="undefined"){
                        res.redirect("/defineRole")
                    }
                    else if(user.role==="admin"){
                        res.redirect("/institute")
                    }
                    else if(user.role==="requested"){
                        res.render("custom",{"msg":"Your institute admin is yet to approve you",user:req.user[0]})
                    }
                    else if(user.role==="student"){
                        res.redirect("/student")
                    }
                    else{
                        const msg="Some Error Occured"
                        req.logout()
                        res.render("custom",{user:null,msg:msg})
                    }
                }
            }
        })
    })
}