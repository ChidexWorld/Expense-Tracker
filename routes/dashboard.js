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

  return res.render("dashboard", { username });
});

router.get("/addExpense", isAuthenticated, (req, res) => {
  return res.render("addExpense", { errors: {}, categories });
});

router.post("/addExpense", (req, res) => {
  const { description, category, amount, date } = req.body;
  const userId = req.user.id;
  console.log(userId, description, category, amount, date);

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
