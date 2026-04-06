const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json("No token, access denied");
    }

    const verified = jwt.verify(token, "secretkey");

    req.user = verified;

    next();
  } catch (err) {
    res.status(400).json("Invalid token");
  }
};