const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    console.log("BODY:", req.body); // 🔥 debug

    const { name, email, password } = req.body;

    // check required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.json({ message: "User already exists" });
    }

    // ✅ include name here
    user = new User({ name, email, password });
    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message);
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    console.log("LOGIN BODY:", req.body); // debug

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json(err.message);
  }
});

module.exports = router;