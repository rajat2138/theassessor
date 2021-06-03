module.exports =(req, res, next)=>{
    if (req.user) {
      if (req.user[0]) {
        return next();
      }
      else{
        req.logout()
        res.render("custom",{user:null,msg:"Please login again in 2 mins for the effect to take place"})
      }
    }
    else{
      res.redirect("/")
    }
}

