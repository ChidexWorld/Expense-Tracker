const express = require("express");
const router = express.Router();

router.get("/dashboard",(req, res)=>{
console.log("we are in the dashboard");

res.render("dashboard")

});

module.exports = router;