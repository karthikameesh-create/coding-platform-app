const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

// Dashboard
router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({
    message: "Welcome to dashboard 🔐",
    userId: req.user.id,
  });
});

// Profile (IMPORTANT)
router.get("/profile", authMiddleware, async (req, res) => {
  console.log("Profile route hit ✅");

  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json("User not found");
    }

    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json("Error fetching user");
  }
});

module.exports = router;