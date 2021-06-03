module.exports =(req, res, next)=>{
    if (req.user){
      if(req.user[0].role==="undefined") {
        return next();
      }
      else{
        res.render("custom",{user:req.user[0],"msg":"Request Unauthorized"})
      }
    }
    res.redirect("/")
}