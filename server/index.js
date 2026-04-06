require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const questionRoutes = require("./routes/question");
const submissionRoutes = require("./routes/submission");
const protectedRoutes = require("./routes/protected");

const app = express();

// 🔥 MIDDLEWARE
app.use(cors()); // allow frontend (3000) to access backend (5000)
app.use(express.json());

// 🔥 CONNECT DATABASE
connectDB();

// 🔥 ROUTES (ORDER IMPORTANT)
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/submit", submissionRoutes);
app.use("/api", protectedRoutes);

// 🔥 TEST ROUTE
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// 🔥 START SERVER
app.listen(5000, () => {
  console.log("Server running on port 5000");
});