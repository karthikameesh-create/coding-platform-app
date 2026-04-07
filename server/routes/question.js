const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

// ✅ DELETE ALL QUESTIONS (for testing)
router.get("/delete-all", async (req, res) => {
  try {
    await Question.deleteMany({});
    res.json({ message: "All questions deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// ✅ ADD QUESTION (FIXED ROUTE)
router.post("/", async (req, res) => {
  try {
    const { title, description, difficulty, correctAnswer } = req.body;

    if (!title || !description || !difficulty || !correctAnswer) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const question = new Question({
      title,
      description,
      difficulty,
      correctAnswer,
    });

    await question.save();

    res.json({
      message: "Question added successfully",
      question,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json(err.message);
  }
});

// ✅ GET ALL QUESTIONS
router.get("/", async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;