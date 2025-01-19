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

  const username = req.user.name;
  const userId = req.user.id;

  const query = `
    SELECT 
      expense_date, 
      SUM(amount) AS total_expense 
    FROM expenses 
    WHERE user_id = ? 
    GROUP BY expense_date
    ORDER BY expense_date ASC
  `;

  const summaryQuery = `
    SELECT 
      COUNT(*) AS expenseCount, 
      SUM(amount) AS totalAmount 
    FROM expenses 
    WHERE user_id = ?
  `;

  db.query(summaryQuery, [userId], (error, summaryResult) => {
    if (error) {
      console.error("Error fetching total expenses:", error);
      if (error) return res.render("error", { error });
    }

    const expenseCount = summaryResult[0]?.expenseCount || 0;
    const totalAmount = summaryResult[0]?.totalAmount || 0;

    db.query(query, [userId], (error, expensesResult) => {
      if (error) {
        console.error("Error fetching detailed expenses:", error);
        return res.render("error", { error });
      }

      const expenses = expensesResult.map(
        ({ expense_date, total_expense }) => ({
          date: new Date(expense_date).toISOString().split("T")[0],
          expense: parseFloat(total_expense),
        })
      );

      console.log(expenses);

      return res.render("dashboard", {
        username,
        totalAmount,
        expenseCount,
        expenses,
      });
    });
  });
});

router.get("/addExpense", isAuthenticated, (req, res) => {
  const username = req.user.name;
  const userId = req.user.id;

  const sql = "SELECT * FROM expenses WHERE user_id = ? ORDER BY id DESC";
  db.query(sql, [userId], (error, results) => {
    if (error) {
      console.error(error);
      if (error) return res.render("error", { error });
    }
    return res.render("addExpense", {
      errors: {},
      categories,
      username,
      transactions: results,
    });
  });
});

router.post("/addExpense", isAuthenticated, (req, res) => {
  const username = req.user.name;
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

      const sql = "SELECT * FROM expenses WHERE user_id = ? ORDER BY id DESC";
      db.query(sql, [userId], (error, results) => {
        if (error) {
          console.error(error);
          if (error) return res.render("error", { error });
        }
        console.log(results);
        return res.render("addExpense", {
          errors: {},
          categories,
          username,
          transactions: results,
        });
      });
    }
  );
});

router.post("/save-edited-text",isAuthenticated, (req, res) => {
  const { content } = req.body;

  // Here, you would save the content to your database or perform any other actions
  console.log("Received edited content:", content);

  // For now, just send a success response back
  res.json({ success: true });
});
module.exports = router;
