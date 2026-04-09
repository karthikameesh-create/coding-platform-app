const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  code: String,
  users: [
    {
      name: String,
      score: Number,
    }
  ],
  isStarted: { type: Boolean, default: false },
  startTime: Date,
});

module.exports = mongoose.model("Room", roomSchema);