const express = require("express");
const router = express.Router();

router.get("/signUp", (req, res) => {
  //   res.render("register", { errors: {} });
  res.render("register", { title: "Register Page" });
});

module.exports = router;
