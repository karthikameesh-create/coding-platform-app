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
app.use(cors());
app.use(express.json()); // VERY IMPORTANT (reads JSON body)

// 🔥 DEBUG (to check incoming data)
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  console.log("Body:", req.body);
  next();
});

// 🔥 CONNECT DATABASE
connectDB();

// 🔥 ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/submit", submissionRoutes);
app.use("/api", protectedRoutes);

// 🔥 TEST ROUTE
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// 🔥 ERROR HANDLER (optional but useful)
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: err.message });
});

// 🔥 START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});