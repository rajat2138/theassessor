require("dotenv").config()
const express = require('express');
const bodyParser = require('body-parser');
const app=express()

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/views/static'));

require("./routes/oauth.js")(app);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 5000;
}

app.listen(port,function() {
  console.log("Server initiated at port "+port);
});

app.get("/",(req,res)=>{
  res.render("home",{user:null})
})

// Below Function to test if there exist user login

const ensuredLogin = require("./functions/ensuredLogin")
app.get("/user",ensuredLogin,function(req,res){
  res.send(req.user)
})


require("./routes/loginControl.js")(app);
require("./routes/undefinedRole.js")(app);
require("./routes/instituteUtilities.js")(app);
require("./routes/test.js")(app);
require("./routes/question.js")(app);
require("./routes/studentControl.js")(app);
