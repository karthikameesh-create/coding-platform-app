require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const questionRoutes = require("./routes/question");
const submissionRoutes = require("./routes/submission");
const protectedRoutes = require("./routes/protected");
const roomRoutes = require("./routes/room"); // ✅ NEW

const app = express();


// 🔥 MIDDLEWARE
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());


// 🔥 DEBUG (optional but useful)
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});


// 🔥 CONNECT DATABASE
connectDB();


// 🔥 HEALTH CHECK (Render uses this)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});


// 🔥 ROOT ROUTE
app.get("/", (req, res) => {
  res.status(200).send("API is running 🚀");
});


// 🔥 ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/submit", submissionRoutes);
app.use("/api", protectedRoutes);
app.use("/api/room", roomRoutes); // ✅ NEW (IMPORTANT)


// 🔥 ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: err.message });
});


// 🔥 START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});