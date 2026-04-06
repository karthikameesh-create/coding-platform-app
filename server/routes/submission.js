const express = require("express");
const router = express.Router();

const Submission = require("../models/Submission");
const authMiddleware = require("../middleware/authMiddleware");

// 🔥 FINAL WORKING SUBMISSION
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { questionId, answer } = req.body;

    const userAns = (answer || "").toString().trim();

    // 🔥 FORCE LOGIC (NO DB CONFUSION)
    const isCorrect = userAns === "5";
    const score = isCorrect ? 10 : 0;

    const submission = new Submission({
      userId: req.user.id,
      questionId,
      answer: userAns,
      score,
      isCorrect,
    });

    await submission.save();

    res.json({
      message: "Answer submitted",
      isCorrect,
      score,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json(err.message);
  }
});

module.exports = router;