// isAuthenticated.js

// Middleware to check if a user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated() || req.user) {
    // Proceed to the next middleware or route handler
    return next();
  }
  // Redirect to login if not authenticated
  res.render("login", { error:"session timeout"});
}

module.exports = isAuthenticated;
