// Utility function to generate a random 6-digit code
function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit code
}

module.exports = generateCode;
