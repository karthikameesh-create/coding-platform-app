import React, { useState, useEffect } from "react";

function App() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [results, setResults] = useState({});

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(false);

  const [time, setTime] = useState(60);

  // ⏱ Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Init
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchSubmissions();
    }
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const res = await fetch("http://localhost:5000/api/questions");
    const data = await res.json();
    setQuestions(data.filter((q) => q.correctAnswer));
  };

  const fetchSubmissions = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/submit/my", {
      headers: { Authorization: token },
    });

    const data = await res.json();
    setSubmissions(data);
  };

  const handleLogin = async () => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
      fetchSubmissions();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  const handleChange = (id, value) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (questionId) => {
    const token = localStorage.getItem("token");
    const userAns = (answers[questionId] || "").trim();

    const res = await fetch("http://localhost:5000/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        questionId,
        answer: userAns,
      }),
    });

    const data = await res.json();

    setResults((prev) => ({
      ...prev,
      [questionId]: data,
    }));

    fetchSubmissions();
  };

  // 📊 Stats
  const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
  const totalAttempts = submissions.length;
  const correctCount = submissions.filter((s) => s.isCorrect).length;
  const accuracy =
    totalAttempts > 0
      ? ((correctCount / totalAttempts) * 100).toFixed(1)
      : 0;

  // 🔍 Filter
  const filtered = questions
    .filter((q) =>
      q.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter((q) =>
      difficultyFilter === "all" ? true : q.difficulty === difficultyFilter
    );

  return (
    <div style={{ ...styles.container, background: darkMode ? "#111" : "#f4f6f8", color: darkMode ? "#fff" : "#000" }}>
      <h1 style={styles.title}>🚀 Coding Platform</h1>

      {!isLoggedIn ? (
        <div style={styles.loginBox}>
          <h2>Login</h2>
          <input style={styles.input} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input style={styles.input} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <button style={styles.button} onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <>
          <div style={styles.topBar}>
            <button onClick={handleLogout}>Logout</button>
            <button onClick={() => setDarkMode(!darkMode)}>🌙 Toggle</button>
            <div>⏱ {time}s</div>
          </div>

          {/* Dashboard */}
          <div style={styles.dashboard}>
            <div>Score: {totalScore}</div>
            <div>Attempts: {totalAttempts}</div>
            <div>Accuracy: {accuracy}%</div>
          </div>

          {/* Filters */}
          <input style={styles.input} placeholder="Search..." onChange={(e) => setSearch(e.target.value)} />

          <select onChange={(e) => setDifficultyFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <div style={styles.grid}>
            {/* Questions */}
            <div style={styles.section}>
              <h2>Questions</h2>

              {filtered.map((q) => (
                <div key={q._id} style={styles.card}>
                  <h3>{q.title}</h3>
                  <p>{q.description}</p>

                  <span>{q.difficulty}</span>

                  <input
                    style={styles.input}
                    placeholder="Answer"
                    onChange={(e) =>
                      handleChange(q._id, e.target.value)
                    }
                  />

                  <button style={styles.button} onClick={() => handleSubmit(q._id)}>
                    Submit
                  </button>

                  {results[q._id] && (
                    <p>
                      {results[q._id].isCorrect ? "✅ Correct" : "❌ Wrong"} | {results[q._id].score}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* History */}
            <div style={styles.section}>
              <h2>History</h2>
              {submissions.map((s) => (
                <div key={s._id} style={styles.history}>
                  {s.answer} → {s.isCorrect ? "✅" : "❌"} ({s.score})
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Styles
const styles = {
  container: { padding: "20px", minHeight: "100vh" },
  title: { textAlign: "center" },
  loginBox: { maxWidth: "300px", margin: "auto", background: "#fff", padding: "20px" },
  grid: { display: "flex", gap: "20px" },
  section: { flex: 1 },
  card: { background: "#fff", padding: "15px", marginBottom: "10px", borderRadius: "8px" },
  history: { background: "#ddd", padding: "8px", marginBottom: "5px" },
  input: { width: "100%", padding: "8px", marginBottom: "10px" },
  button: { padding: "8px", background: "#007bff", color: "#fff", border: "none" },
  dashboard: { display: "flex", gap: "20px", marginBottom: "10px" },
  topBar: { display: "flex", justifyContent: "space-between", marginBottom: "10px" },
};

export default App;