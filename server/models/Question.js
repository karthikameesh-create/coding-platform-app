const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "easy",
  },
  correctAnswer: {
    type: String,
    required: true, // 🔥 needed for scoring
  },
});

module.exports = mongoose.model("Question", questionSchema);