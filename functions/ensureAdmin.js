module.exports = (req, res, next) => {
  if (req.user) {
    const role = req.user[0].role;
    if (role == "admin") {
      return next();
    }
    else {
      res.render("custom",{user:req.user[0],"msg":"Request Unauthorized"})
    }
  }
  else {
    res.redirect("/")
  }
}