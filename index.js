const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");
const session = require("express-session");
require("dotenv").config();
const fileUpload = require("express-fileupload");



const user_route = require("./Routes/user");
const admin_route = require("./Routes/admin");



const app = express();

app.use(fileUpload());


app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    resave:true,
    saveUninitialized:true,
    secret:"a2zithub"
}))
app.use(bodyparser.urlencoded());

// Routes
app.use("/", user_route);    
app.use("/admin", admin_route); 

app.listen(process.env.PORT || 2000);