const express = require("express");
const router = express.Router();

const Submission = require("../models/Submission");
const Question = require("../models/Question");
const authMiddleware = require("../middleware/authMiddleware");

// 🔹 Get ALL submissions
router.get("/all", async (req, res) => {
  try {
    const data = await Submission.find();
    res.json(data);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// 🔹 Get MY submissions
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const data = await Submission.find({ userId: req.user.id });
    res.json(data);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

// 🔹 Submit answer
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { questionId, answer } = req.body;

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    let isCorrect = false;
    let score = 0;

    if (question.correctAnswer.trim() === answer.trim()) {
      isCorrect = true;
      score = 10;
    }

    const submission = new Submission({
      userId: req.user.id,
      questionId,
      answer,
      score,
      isCorrect,
    });

    await submission.save();

    res.json({
      message: "Submission done",
      isCorrect,
      score,
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;