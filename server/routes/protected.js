const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

// ✅ DASHBOARD (Protected)
router.get("/dashboard", authMiddleware, (req, res) => {
  console.log("Dashboard accessed by:", req.user);

  res.json({
    message: "Welcome to dashboard 🔐",
    userId: req.user.id,
  });
});

// ✅ PROFILE (Protected)
router.get("/profile", authMiddleware, async (req, res) => {
  console.log("Profile route hit ✅", req.user);

  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile fetched successfully",
      user,
    });

  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Error fetching user" });
  }
});

module.exports = router;