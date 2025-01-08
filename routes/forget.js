const express = require("express");
const router = express.Router();
const db = require("../db/db");
const bcrypt = require("bcrypt");

// Utility function to generate a random 6-digit code
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit code
}

function createTemporaryToken(userId) {
  const secret = process.env.JWT_SECRET || "TDKhAbjKMr5bd2aUp7Y";
  return jwt.sign({ userId }, secret, { expiresIn: "15m" }); //15-minute validity
}

const nodemailer = require("nodemailer");
require("dotenv").config();
const jwt = require("jsonwebtoken");

router.get("/forgetPassword", (req, res) => {
  //   res.render("register", { errors: {} });
  res.render("forgetPassword", { title: "Register Page" });
});

router.get("/confirmOTP", (req, res) => {
  const { token } = req.query; // Get the token from the query

  console.log(token);

  //   res.render("register", { errors: {} });
  res.render("confirmOTP", { token });
});

router.get("/resetPassword", (req, res) => {
  const { token } = req.query; // Get the token from the query

  //   res.render("register", { errors: {} });
  res.render("resetPassword", { token });
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

    console.log("Email is available");

    console.log(generateCode());

    const code = generateCode();
    const userId = result[0].id;

    // Set expiration time (e.g., 10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Function to send email

    // Insert the code into the `user_codes` table
    const query = `INSERT INTO user_codes (user_id, code, expires_at) VALUES (?, ?, ?); `;
    db.query(query, [userId, code, expiresAt], (insertErr, result) => {
      if (insertErr) {
        console.error("Error inserting user:", insertErr); // Log the error
        if (err) return res.render("error", { error: insertErr });
        // Send error response
      }
    });

    // Configure your email transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail", // Use your email service (e.g., Gmail, Outlook)
      auth: {
        user: process.env.EMAIL, // Your email address
        pass: process.env.EMAIL_PASSWORD, // Your email password or app password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL, // Sender's email
      to: email, // Recipient's email
      subject: "Your Verification Code",
      text: `Your verification code is: ${code}`, // Plain text email
      html: `<p>Your verification code is: <strong>${code}</strong></p>`, // HTML email
    };

    // Send the email
    transporter.sendMail(mailOptions, (emailErr, info) => {
      if (emailErr) {
        console.error("Error sending email:", emailErr);
        return res
          .status(500)
          .json({ message: "Failed to send verification email." });
      }
      console.log("Email sent:", info.response);
    });

    // In /forget-password route, after sending the email
    res.redirect(`/confirmOTP?token=${createTemporaryToken(userId)}`); // Redirecting to confirmOTP with userId
  });
});

//verify the code route
router.post("/verify-code", (req, res) => {
  const { token, code } = req.body;

  console.log(token);
  if (!token || !code) {
    return res.status(400).json({ message: "Token and code are required" });
  }

  try {
    const secret = process.env.JWT_SECRET || "TDKhAbjKMr5bd2aUp7Y";
    const decoded = jwt.verify(token, secret);

    const userId = decoded.userId;

    // Query the database to fetch the code for the user
    db.query(
      "SELECT * FROM user_codes WHERE user_id = ? AND code = ? AND expires_at > NOW()",
      [userId, code],
      (error, results) => {
        if (error) {
          console.error("Database error:", error);
          return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
          // Code not found or expired
          return res.status(400).json({ message: "Invalid or expired code" });
        }

        // Code matches and is valid
        // return res.json({ message: "Code verified successfully" });

        res.redirect(`/confirmOTP?token=${token}`); // Redirecting to confirmOTP with userId
      }
    );
  } catch (err) {
    console.error("JWT verification error:", err);
    res.status(401).json({ message: "Unauthorized or invalid token" });
  }
});

// route to reset password
router.post("/reset-password", (req, res) => {
  const { password, confirm } = req.body;

  console.log(password, confirm); // Log values for debugging

  // Validation errors object
  const errors = {
    password: [],
    confirm: [],
  };

  let isValid = true;

  // Validate that both fields are provided
  if (!password || !confirm) {
    isValid = false;
    if (!password) {
      errors.password.push("Please enter the password!");
    }
    if (!confirm) {
      errors.confirm.push("Please confirm the password!");
    }
  }

  // Check if password and confirm are equal
  if (password && confirm && password !== confirm) {
    isValid = false;
    errors.confirm.push("Confirm password did not match the password!");
    console.log("Passwords do not match");
  }

  // If validation fails, re-render the form with errors
  if (!isValid) {
    return res.render("resetPassword", { errors });
  }

  console.log("confirmed password");

  // Hash the password synchronously using bcrypt
  const saltRounds = 10; // Define salt rounds
  const hashedPassword = bcrypt.hashSync(password, saltRounds);
});

module.exports = router;
