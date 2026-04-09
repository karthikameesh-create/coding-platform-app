const express = require("express");
const router = express.Router();
const Room = require("../models/Room");


// 🔹 CREATE ROOM
router.post("/create", async (req, res) => {
  try {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const room = new Room({
      code,
      users: [],
      isStarted: false,
      startTime: null,
    });

    await room.save();

    res.json({ code });
  } catch (err) {
    res.status(500).json(err.message);
  }
});


// 🔹 JOIN ROOM
router.post("/join", async (req, res) => {
  try {
    const { code, name } = req.body;

    const room = await Room.findOne({ code });

    if (!room) return res.json({ message: "Room not found" });

    // Avoid duplicate users
    const exists = room.users.find(u => u.name === name);
    if (!exists) {
      room.users.push({ name, score: 0 });
      await room.save();
    }

    res.json({ message: "Joined room", room });
  } catch (err) {
    res.status(500).json(err.message);
  }
});


// 🔹 START TEST (HOST)
router.post("/start", async (req, res) => {
  try {
    const { code } = req.body;

    const room = await Room.findOne({ code });

    if (!room) return res.json({ message: "Room not found" });

    room.isStarted = true;
    room.startTime = new Date();

    await room.save();

    res.json({ message: "Test started" });
  } catch (err) {
    res.status(500).json(err.message);
  }
});


// 🔹 UPDATE SCORE
router.post("/update-score", async (req, res) => {
  try {
    const { code, name, score } = req.body;

    const room = await Room.findOne({ code });

    if (!room) return res.json({ message: "Room not found" });

    const user = room.users.find(u => u.name === name);

    if (user) {
      user.score = score;
    }

    await room.save();

    res.json({ message: "Score updated", room });
  } catch (err) {
    res.status(500).json(err.message);
  }
});


// 🔹 ROOM STATUS (VERY IMPORTANT FOR SYNC)
router.get("/status/:code", async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code });

    if (!room) return res.json({ message: "Room not found" });

    res.json({
      isStarted: room.isStarted,
      startTime: room.startTime,
    });
  } catch (err) {
    res.status(500).json(err.message);
  }
});


// 🔹 LIVE LEADERBOARD (KEEP THIS LAST ⚠️)
router.get("/:code", async (req, res) => {
  try {
    const room = await Room.findOne({ code: req.params.code });

    if (!room) return res.json({ message: "Room not found" });

    const sorted = room.users.sort((a, b) => b.score - a.score);

    res.json(sorted);
  } catch (err) {
    res.status(500).json(err.message);
  }
});


module.exports = router;