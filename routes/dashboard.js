const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const db = require("../db/db");

const categories = [
  "Food",
  "Subscription",
  "Medical & HealthCare",
  "Recreation & Entertainment",
  "Utilities",
  "Investment & Dept Payments ",
  "insurance",
  "Transportation",
  "Housing",
];

router.get("/dashboard", isAuthenticated, (req, res) => {
  console.log("we are in the dashboard");

  const username = req.user.name.toUpperCase();
  const userId = req.user.id;

    const query = `
    SELECT 
      COUNT(*) AS expenseCount, 
      SUM(amount) AS totalAmount 
    FROM expenses 
    WHERE user_id = ?
  `;
  db.query(query, [userId], (error, result) => {
    if (error) {
      console.error("Error fetching total expenses:", error);
      if (error) return res.render("error", { error });
    }

    const { expenseCount = 0, totalAmount = 0 } = result[0]; // Default to 0 if no rows found
    return res.render("dashboard", { username, totalAmount, expenseCount });
  });
});

router.get("/addExpense", isAuthenticated, (req, res) => {
  return res.render("addExpense", { errors: {}, categories });
});

router.post("/addExpense", isAuthenticated, (req, res) => {
  const { description, category, amount, date } = req.body;

  const userId = req.user.id;
  const errors = {
    description: [],
    category: [],
    amount: [],
    date: [],
  };

  let isValid = true;

  // Validation for title
  if (!amount) {
    isValid = false;
    errors.amount.push("please enter an amount!");
  }

  // Validation for description
  if (!description) {
    isValid = false;
    errors.description.push("please enter the description!");
  } else if (description.length < 3) {
    isValid = false;
    errors.description.push(
      "expense description must be at least 3 characters long."
    );
  }

  // Validation for due_date
  if (!date) {
    isValid = false;
    errors.date.push("Please enter the due date!");
  }

  // Validation for category
  if (!req.body.category) {
    isValid = false;
    errors.category.push("category not found");
  }

  if (!isValid) {
    return res.render("addExpense", { categories, errors });
  }

  const query =
    "INSERT INTO expenses (user_id, expense_date, category, description, amount) VALUES (?, ?, ?, ?, ?)";

  db.query(
    query,
    [userId, date, category, description, amount],
    (error, result) => {
      if (error) return res.render("error", { error });
      console.log("expense save", result);

      return res.render("addExpense", { errors: {}, categories });
    }
  );
});
module.exports = router;
