require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

// 🔹 ROUTES
const authRoutes = require("./routes/auth");
const questionRoutes = require("./routes/question");
const submissionRoutes = require("./routes/submission");
const protectedRoutes = require("./routes/protected");
const roomRoutes = require("./routes/room");
const aiQuestionRoutes = require("./routes/aiQuestion");

const app = express();

// 🔥 CREATE HTTP SERVER (IMPORTANT FOR SOCKET)
const server = http.createServer(app);

// 🔥 SOCKET.IO SETUP
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 🔥 IN-MEMORY ROOMS
let rooms = {};

// 🔥 SOCKET LOGIC
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // CREATE ROOM
  socket.on("createRoom", ({ username }, callback) => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();

    rooms[code] = {
      players: [],
      questions: [],
      leaderboard: [],
    };

    socket.join(code);

    rooms[code].players.push({
      id: socket.id,
      username,
    });

    callback(code);
  });

  // JOIN ROOM
  socket.on("joinRoom", ({ code, username }, callback) => {
    if (!rooms[code]) return callback("Room not found");

    socket.join(code);

    rooms[code].players.push({
      id: socket.id,
      username,
    });

    io.to(code).emit("players", rooms[code].players);

    callback("joined");
  });

  // START QUIZ
  // START QUIZ (NO PLAYER LIMIT)
socket.on("startQuiz", ({ code, questions }) => {
  if (!rooms[code]) return;

  rooms[code].questions = questions;

  io.to(code).emit("quizStarted", questions);
});

  // SUBMIT SCORE
  socket.on("submitScore", ({ code, username, score, correct, total }) => {
    rooms[code].leaderboard.push({
  username,
  score,
  correct,
  total
});
    rooms[code].leaderboard.sort((a, b) => b.score - a.score);

    io.to(code).emit("leaderboard", rooms[code].leaderboard);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


// 🔥 MIDDLEWARE
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());


// 🔥 DEBUG
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});


// 🔥 CONNECT DATABASE
connectDB();


// 🔥 HEALTH CHECK
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});


// 🔥 ROOT
app.get("/", (req, res) => {
  res.status(200).send("API is running 🚀");
});


// 🔥 ROUTES (UNCHANGED)
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/submit", submissionRoutes);
app.use("/api", protectedRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/ai", aiQuestionRoutes);


// 🔥 ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: err.message });
});


// 🔥 START SERVER (IMPORTANT CHANGE)
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});