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
app.use(cors({
  origin: "*"
}));
app.use(express.json());

// 🔥 DEBUG (optional)
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

// 🔥 CONNECT DATABASE
connectDB();

// 🔥 HEALTH CHECK (VERY IMPORTANT for Render)
app.all("/health", (req, res) => {
  res.status(200).send("OK");
});

// 🔥 ROOT ROUTE (handle ALL methods including HEAD)
app.all("/", (req, res) => {
  res.status(200).send("API is running 🚀");
});

// 🔥 ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/submit", submissionRoutes);
app.use("/api", protectedRoutes);

// 🔥 ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: err.message });
});

// 🔥 START SERVER (FINAL FIX)
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server started on port:", PORT);
});