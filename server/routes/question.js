const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

// 🔥 DELETE ALL QUESTIONS (PLACE AFTER router INIT)
router.get("/delete-all", async (req, res) => {
  try {
    await Question.deleteMany({});
    res.json({ message: "All questions deleted" });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// 🔹 Add question
router.post("/add", async (req, res) => {
  try {
    const { title, description, difficulty, correctAnswer } = req.body;

    const question = new Question({
      title,
      description,
      difficulty,
      correctAnswer,
    });

    await question.save();

    res.json({ message: "Question added successfully" });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// 🔹 Get all questions
router.get("/", async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;