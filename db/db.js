const mysql = require("mysql2");
require("dotenv").config();

const additionalConfig =
  process.env.NODE_ENV === "development"
    ? {}
    : {
        ssl: {
          rejectUnauthorized: false,
        },
      };

// Create a connection to the database
const db = mysql.createConnection({
  host: process.env.DB_HOST, // MySQL host from .env
  user: process.env.DB_USER, // MySQL username from .env
  password: process.env.DB_PASSWORD, // MySQL password from .env
  database: process.env.DB_NAME, // Database name from .env
  port: process.env.DB_PORT || 3306,
  ...additionalConfig,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

module.exports = db;
