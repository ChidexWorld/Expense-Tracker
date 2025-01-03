const express = require("express");
const router = express.Router();
const db = require("../db/db");
const crypto = require("crypto");

router.get("/forgetPassword", (req, res) => {
  //   res.render("register", { errors: {} });
  res.render("forgetPassword", { title: "Register Page" });
});

router.post("/forget-password", (req, res) => {
  let { email } = req.body;

  email = email.trim();

  // Validation errors object
  const errors = {
    email: [],
  };

  let isValid = true;

  // Validate email
  if (!email) {
    isValid = false;
    errors.email.push("Please enter a email!");
  } else if (email.length < 3) {
    isValid = false;
    errors.email.push("email must be at least 3 characters long.");
  }

  // If validation fails, re-render the form with errors
  if (!isValid) {
    return res.render("forgetPassword", { errors });
  }

  //checks if the email exists in the database.
  db.query("SELECT * FROM users WHERE email = ?", [email], (error, result) => {
    if (error) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    
    if (result.length === 0) {
      isValid = false;
      errors.email.push("Email not found");
      console.log("Email not found");
      return res.render("forgetPassword", { errors });
    }

    console.log("email is available");

    //Create a random, secure code
    function generateSecureNumericCode() {
      const buffer = crypto.randomBytes(3);

      const code = parseInt(buffer.toString("hex"), 16) % 1000000;

      return code.toString().padStart(6, "0");
    }

    console.log(generateSecureNumericCode());
  });
});

module.exports = router;
