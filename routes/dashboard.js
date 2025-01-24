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

  // Query for the most recent overall budget
  const overallBudgetQuery = `
    SELECT amount AS totalOverallBudget, description, created_at
    FROM overall_budgets
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `;

  // Query for the most recent budget for each category
  const recentCategoryBudgetQuery = `
      SELECT c1.category, c1.amount
    FROM category_specific_budgets c1
    JOIN (
        SELECT category, MAX(created_at) AS latest_date
        FROM category_specific_budgets
        WHERE user_id = ?
        GROUP BY category
    ) c2 ON c1.category = c2.category AND c1.created_at = c2.latest_date
    WHERE c1.user_id = ?
    `;

  const expenseQuery = `
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

  // Query for total expenses grouped by category
  const totalExpensesByCategoryQuery = `
    SELECT category, SUM(amount) AS totalExpense
    FROM expenses
    WHERE user_id = ?
    GROUP BY category
  `;

  // Get the overall budget
  db.query(overallBudgetQuery, [userId], (error, overallResult) => {
    if (error) {
      console.error("Error fetching overall budget:", error);
      return res.render("error", { error });
    }

    const recentOverallBudget = overallResult[0];
    const totalOverallBudget = parseInt(recentOverallBudget.totalOverallBudget);

    console.log(totalOverallBudget, recentOverallBudget);

    // Get the category-specific budgets
    db.query(
      recentCategoryBudgetQuery,
      [userId, userId],
      (error, categoryResult) => {
        if (error) {
          console.error("Error fetching category-specific budgets:", error);
          return res.render("error", { error });
        }

        // Sum the amounts from the most recent category-specific budgets
        const totalCategoryBudget = categoryResult.reduce(
          (sum, row) => sum + parseFloat(row.amount),
          0
        );

        // Assuming categoryResult contains the category names and their allocated amounts
        const allocatedBudgets = categories.map((category) => {
          // Find the corresponding category in the database result
          const categoryData = categoryResult.find(
            (row) => row.category === category
          );
          // Return the allocated budget for this category, or 0 if no data exists
          return categoryData ? categoryData.amount : 0;
        });

        console.log(
          categoryResult,
          totalCategoryBudget,
          allocatedBudgets,
          "edsfgqewg"
        );

        db.query(summaryQuery, [userId], (error, summaryResult) => {
          if (error) {
            console.error("Error fetching total expenses:", error);
            if (error) return res.render("error", { error });
          }

          const expenseCount = summaryResult[0]?.expenseCount || 0;
          const totalAmount = summaryResult[0]?.totalAmount || 0;

          db.query(expenseQuery, [userId], (error, expensesResult) => {
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

            db.query(
              totalExpensesByCategoryQuery,
              [userId],
              (error, categoryExpensesResult) => {
                if (error) {
                  console.error("Error fetching expenses by category:", error);
                  return res.render("error", { error });
                }

                // Map the categories and category-specific expenses
                const categories = categoryExpensesResult.map(
                  (row) => row.category
                );
                const categoryExpenseAmount = categoryExpensesResult.map(
                  (row) => parseFloat(row.totalExpense)
                );

                console.log(
                  expenses,
                  categories,
                  categoryExpenseAmount,
                  categoryResult
                );

                // Summing both category-specific and overall budgets
                const totalBudget =
                  totalCategoryBudget +
                  (totalOverallBudget ? totalOverallBudget : 0);

                //get total balance
                const totalBalance = totalBudget - totalAmount;

                return res.render("dashboard", {
                  username,
                  totalAmount,
                  expenseCount,
                  expenses,
                  totalBudget,
                  totalBalance,
                  categories,
                  categoryExpenseAmount,
                  allocatedBudgets,
                });
              }
            );
          });
        });
      }
    );
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
    const userId = req.user.id;
    const sql = "SELECT * FROM expenses WHERE user_id = ? ORDER BY id DESC";

    db.query(sql, [userId], (error, results) => {
      if (error) {
        console.error(error);
        return res.render("error", { error });
      }

      // Render the page with errors and existing transactions
      return res.render("addExpense", {
        categories,
        errors,
        username,
        transactions: results, // Include transactions in the response
      });
    });
    return;
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

router.post("/editExpense", isAuthenticated, (req, res) => {
  const { id, field, value } = req.body;

  // Validate `id` (must be a number and greater than 0)
  if (!id || isNaN(id) || id <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid transaction ID!" });
  }
  // Validate `field` (must be 'description', 'amount', or 'expense_date')
  if (!["description", "amount", "expense_date"].includes(field)) {
    return res.status(400).json({ success: false, message: "Invalid field!" });
  }

  // Validate `value` based on the field
  if (field === "description") {
    if (!value || value.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Description cannot be empty!" });
    }
  } else if (field === "amount") {
    const amountValue = parseFloat(value);
    if (isNaN(amountValue) || amountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid positive number!",
      });
    }
  } else if (field === "expense_date") {
    const dateValue = new Date(value);
    // Check if date is valid
    if (isNaN(dateValue.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date format!" });
    }

    // Ensure the date is not in the future
    const currentDate = new Date();
    if (dateValue > currentDate) {
      return res
        .status(400)
        .json({ success: false, message: "Date cannot be in the future!" });
    }
  }

  // Here, you would save the content to your database or perform any other actions
  console.log("Received edited content:", id, field, value);

  let updateQuery = "";
  let queryParams = [value, id];

  // Dynamically build the query based on the field
  switch (field) {
    case "description":
      updateQuery = "UPDATE expenses SET description = ? WHERE id = ?";
      break;
    case "amount":
      updateQuery = "UPDATE expenses SET amount = ? WHERE id = ?";
      break;
    case "expense_date":
      updateQuery = "UPDATE expenses SET expense_date = ? WHERE id = ?";
      break;
    default:
      return res.status(400).json({
        success: false,
        message: "Invalid field specified.",
      });
  }

  db.query(updateQuery, queryParams, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Error updating transaction" });
    }

    // If no rows were affected, the ID might be invalid
    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    res.json({ success: true, message: "Transaction updated successfully." });
  });
});

router.delete("/deleteExpense", isAuthenticated, (req, res) => {
  const { id } = req.body;

  // Validate `id` (must be a number and greater than 0)
  if (!id || isNaN(id) || id <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid transaction ID!" });
  }

  // Query to delete the transaction from the database
  const deleteQuery = "DELETE FROM expenses WHERE id = ?";

  // Execute the delete query
  db.query(deleteQuery, [id], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Error deleting transaction!" });
    }

    // If no rows were affected, the ID might be invalid
    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    res.json({
      success: true,
      message: "Transaction deleted successfully.",
    });
  });
});

router.get("/setBudget", isAuthenticated, (req, res) => {
  const username = req.user.name;
  const userId = req.user.id;

  // Query for both overall budgets and category-specific budgets for the logged-in user
  const overallBudgetQuery = `
      SELECT * 
      FROM overall_budgets 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1;
  `;
  const categorySpecificBudgetQuery = `
        SELECT c1.*
        FROM category_specific_budgets c1
        JOIN (
            SELECT category, MAX(created_at) AS latest_date
            FROM category_specific_budgets
            WHERE user_id = ?
            GROUP BY category
        ) c2
        ON c1.category = c2.category AND c1.created_at = c2.latest_date;
    `;
  db.query(overallBudgetQuery, [userId], (error, overallBudgets) => {
    if (error) {
      console.error("Error fetching overall budgets:", error);
      return res.render("error", { error: "Failed to fetch overall budgets." });
    }
    db.query(
      categorySpecificBudgetQuery,
      [userId],
      (error, categoryBudgets) => {
        if (error) {
          console.error("Error fetching category-specific budgets:", error);
          return res.render("error", {
            error: "Failed to fetch category-specific budgets.",
          });
        }

        console.log(overallBudgets);

        return res.render("setBudget", {
          errors: {},
          categories,
          username,
          overallBudgets,
          categoryBudgets,
        });
      }
    );
  });
});

// Add an overall budget
router.post("/addOverallBudget", isAuthenticated, (req, res) => {
  const { amount, description } = req.body;
  const userId = req.user.id;
  const username = req.user.name;

  console.log(userId);

  // Query for both overall budgets and category-specific budgets for the logged-in user
  const overallBudgetQuery = `
      SELECT * 
      FROM overall_budgets 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1;
  `;

  const categorySpecificBudgetQuery = `
        SELECT c1.*
        FROM category_specific_budgets c1
        JOIN (
            SELECT category, MAX(created_at) AS latest_date
            FROM category_specific_budgets
            WHERE user_id = ?
            GROUP BY category
        ) c2
        ON c1.category = c2.category AND c1.created_at = c2.latest_date;
    `;
  const query =
    "INSERT INTO overall_budgets (user_id, amount, description) VALUES (?, ?, ?)";
  db.query(query, [userId, amount, description], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Failed to add overall budget.");
    }

    db.query(overallBudgetQuery, [userId], (error, overallBudgets) => {
      if (error) {
        console.error("Error fetching overall budgets:", error);
        return res.render("error", {
          error: "Failed to fetch overall budgets.",
        });
      }

      db.query(
        categorySpecificBudgetQuery,
        [userId],
        (error, categoryBudgets) => {
          if (error) {
            console.error("Error fetching category-specific budgets:", error);
            return res.render("error", {
              error: "Failed to fetch category-specific budgets.",
            });
          }
          res.render("setBudget", {
            errors: {},
            overallBudgets,
            categories,
            username,
            categoryBudgets,
          });
        }
      );
    });
  });
});

// Add a category-specific budget
router.post("/addCategoryBudget", isAuthenticated, (req, res) => {
  const { category, amount, description } = req.body;
  const userId = req.user.id;
  const username = req.user.name;

  // Query for both overall budgets and category-specific budgets for the logged-in user
  const overallBudgetQuery = `
      SELECT * 
      FROM overall_budgets 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1;
  `;

  const categorySpecificBudgetQuery = `
        SELECT c1.*
        FROM category_specific_budgets c1
        JOIN (
            SELECT category, MAX(created_at) AS latest_date
            FROM category_specific_budgets
            WHERE user_id = ?
            GROUP BY category
        ) c2
        ON c1.category = c2.category AND c1.created_at = c2.latest_date;
    `;

  // Insert into category_specific_budgets table
  const query =
    "INSERT INTO category_specific_budgets (user_id,category, amount, description) VALUES (?,?, ?, ?)";
  db.query(query, [userId, category, amount, description], (err, results) => {
    if (err) {
      console.error(err);
      if (err) return res.render("error", { err });
    }
    db.query(overallBudgetQuery, [userId], (error, overallBudgets) => {
      if (error) {
        console.error("Error fetching overall budgets:", error);
        return res.render("error", {
          error: "Failed to fetch overall budgets.",
        });
      }

      db.query(
        categorySpecificBudgetQuery,
        [userId],
        (error, categoryBudgets) => {
          if (error) {
            console.error("Error fetching category-specific budgets:", error);
            return res.render("error", {
              error: "Failed to fetch category-specific budgets.",
            });
          }
          console.log(results);
          return res.render("setBudget", {
            errors: {},
            categories,
            username,
            overallBudgets,
            categoryBudgets,
          });
        }
      );
    });
  });
});

module.exports = router;
