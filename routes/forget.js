const express = require("express");
const router = express.Router();
const db = require("../db/db");
const bcrypt = require("bcryptjs");
const generateCode = require("../utils/generateCode");

const nodemailer = require("nodemailer");
require("dotenv").config();

router.get("/forgetPassword", (req, res) => {
  res.render("forgetPassword", { errors: null });
});

//forget password router
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
  } else if (email.length < 4) {
    isValid = false;
    errors.email.push("email must be at least 4 characters long.");
  }

  // If validation fails, re-render the form with errors
  if (!isValid) {
    return res.render("forgetPassword", { errors });
  }

  //checks if the email exists in the database.
  db.query("SELECT * FROM users WHERE email = ?", [email], (error, result) => {
    if (error) {
      console.error("Database error:", err);
      return res.render("error", {
        error: error.message || "An unexpected error occurred.",
      });
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
        if (err) return res.render("error", { error: insertErr.message });
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
        return res.render("forgetPassword", { errors });
      }
      console.log("Email sent:", info.response);
    });

    res.render("confirmOTP", { userId, error: null });
  });
});

//verify the code route
router.post("/verify-code", (req, res) => {
  const { userId, code } = req.body;

  console.log(userId);
  if (!userId || !code) {
    return res.render("confirmOTP", {
      error: "userId and code are required",
      userId,
    });
  }

  // Query the database to fetch the code for the user
  db.query(
    "SELECT * FROM user_codes WHERE user_id = ? AND code = ? AND expires_at > NOW()",
    [userId, code],
    (error, results) => {
      if (error) {
        console.error("Database error:", error);
        return res.render("error", {
          error: error.message || "An unexpected error occurred.",
        });
      }

      if (results.length === 0) {
        // Code not found or expired

        return res.render("confirmOTP", {
          error: "Invalid or expired code",
          userId,
        });
      }

      // Code matches and is valid
      // return res.json({ message: "Code verified successfully" });

      res.render("resetPassword", { code, errors: {} });
    }
  );
});

// route to reset password
router.post("/reset-password", (req, res) => {
  const { password, confirm, code } = req.body;
  console.log(password, confirm, code); // Log values for debugging

  if (!code) {
    return res.status(400).json({ message: "code are required" });
  }

  // Validation errors object
  const errors = {
    password: [],
    confirm: [],
    code: [],
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

  // Validate password
  if (!password) {
    isValid = false;
    errors.password.push("Please enter the password!");
  } else if (password.length < 8) {
    isValid = false;
    errors.password.push("password must be at least 8 characters long.");
  }

  // Check if password and confirm are equal
  if (password && confirm && password !== confirm) {
    isValid = false;
    errors.confirm.push("Confirm password did not match the password!");
    console.log("Passwords do not match");
  }

  // If validation fails, re-render the form with errors
  if (!isValid) {
    return res.render("resetPassword", { errors, code });
  }

  console.log("confirmed password");

  // Hash the password synchronously using bcrypt
  const saltRounds = 10; // Define salt rounds
  const hashedPassword = bcrypt.hashSync(password, saltRounds);
h;
  console.log("Hashed Password:", hashedPassword);

  // Update password and invalidate the code in the database
  const updatePasswordSql = `
    UPDATE users 
    SET password = ? 
    WHERE id = (
      SELECT user_id FROM user_codes WHERE code = ?
    );
  `;

  const updateCodeSql = `
  UPDATE user_codes 
  SET code = NULL 
  WHERE code = ?;
`;

  db.query(updatePasswordSql, [hashedPassword, code], (err, result) => {
    if (err) {
      console.error("Error updating password:", err);
      return res.render("error", {
        error: err.message || "An unexpected error occurred.",
      });
    }

    if (result.affectedRows === 0) {
      isValid = false;
      errors.code.push("Invalid verification code! Resend OTP");
      return res.render("resetPassword", { errors, code });
    }

    db.query(updateCodeSql, [code], (err) => {
      if (err) {
        console.error("Error invalidating token:", err);
        return res.render("error", {
          error: err.message || "An unexpected error occurred.",
        });
      }

      res.redirect("login");
    });
  });
});

module.exports = router;
