const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

//import routes
const authRoutes = require("./routes/auth");
const forgetRoutes = require('./routes/forget')


// Set EJS as the template engine
app.set("view engine", "ejs");

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the router
app.use( authRoutes);
app.use(forgetRoutes);

app.get("/", (req, res) => {
  res.render("home", { title: "Welcome to EJS Project!" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})