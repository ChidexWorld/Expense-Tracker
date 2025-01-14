// Middleware to check if a user already authenticated
function ifAuthenticated(req, res, next) {
  if (req.isAuthenticated() || req.user) {
    // Proceed to the next middleware or route handler
    return res.redirect("dashboard");
  }
    return next();
}

module.exports = ifAuthenticated;
