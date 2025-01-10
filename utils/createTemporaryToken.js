function createTemporaryToken(jwt_token) {
  const secret = process.env.JWT_SECRET || "TDKhAbjKMr5bd2aUp7Y";
  return jwt.sign({ jwt_token }, secret, { expiresIn: "15m" }); //15-minute validity
}

module.exports = createTemporaryToken;
