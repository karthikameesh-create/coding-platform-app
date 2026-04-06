const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  questionId: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    default: 0, // 🔥 score system
  },
  isCorrect: {
    type: Boolean,
    default: false, // 🔥 evaluation result
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Submission", submissionSchema);