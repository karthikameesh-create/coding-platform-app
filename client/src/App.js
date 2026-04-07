import React, { useState, useEffect } from "react";

const BASE_URL = "https://coding-platform-backend-95zi.onrender.com";
function App() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [results, setResults] = useState({});

  const [name, setName] = useState(""); // ✅ NEW
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  // 🔁 INIT
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchSubmissions();
    }
    fetchQuestions();
  }, []);

  // 📚 FETCH QUESTIONS
  const fetchQuestions = async () => {
    const res = await fetch(`${BASE_URL}/api/questions`);
    const data = await res.json();
    setQuestions(Array.isArray(data) ? data.filter((q) => q.correctAnswer) : []);
  };

  // 📊 FETCH SUBMISSIONS
  const fetchSubmissions = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/submit/my`, {
      headers: {
        Authorization: token,
      },
    });

    const data = await res.json();

    if (Array.isArray(data)) {
      setSubmissions(data);
    } else {
      setSubmissions([]);
    }
  };

  // 🔐 REGISTER
  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert("Fill all fields");
      return;
    }

    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    alert(data.message);

    // ✅ AUTO LOGIN
    if (data.message === "User registered successfully") {
      handleLogin();
    }
  };

  // 🔐 LOGIN
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Enter email & password");
      return;
    }

    const res = await fetch(`${BASE_URL}/api/auth/login`, {
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
      alert("Login successful ✅");
    } else {
      alert(data.message || "Login failed ❌");
    }
  };

  // 🚪 LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setSubmissions([]);
  };

  // ✍️ INPUT
  const handleChange = (id, value) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // 🚀 SUBMIT
  const handleSubmit = async (questionId) => {
    const token = localStorage.getItem("token");
    const userAns = (answers[questionId] || "").trim();

    if (!userAns) {
      alert("Enter answer");
      return;
    }

    const res = await fetch(`${BASE_URL}/api/submit`, {
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

  // 📊 STATS
  const totalScore = Array.isArray(submissions)
    ? submissions.reduce((sum, s) => sum + s.score, 0)
    : 0;

  const totalAttempts = Array.isArray(submissions)
    ? submissions.length
    : 0;

  const correctCount = Array.isArray(submissions)
    ? submissions.filter((s) => s.isCorrect).length
    : 0;

  const accuracy =
    totalAttempts > 0
      ? ((correctCount / totalAttempts) * 100).toFixed(1)
      : 0;

  // 🔍 FILTER
  const filtered = questions
    .filter((q) =>
      q.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter((q) =>
      difficultyFilter === "all" ? true : q.difficulty === difficultyFilter
    );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🚀 Coding Platform</h1>

      {!isLoggedIn ? (
        <div style={styles.loginBox}>
          {/* REGISTER */}
          <h2>Register</h2>

          <input
            style={styles.input}
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.button} onClick={handleRegister}>
            Register
          </button>

          <hr />

          {/* LOGIN */}
          <h2>Login</h2>

          <input
            style={styles.input}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.button} onClick={handleLogin}>
            Login
          </button>
        </div>
      ) : (
        <>
          <button style={styles.logout} onClick={handleLogout}>
            Logout
          </button>

          {/* DASHBOARD */}
          <div style={styles.dashboard}>
            <div>Score: {totalScore}</div>
            <div>Attempts: {totalAttempts}</div>
            <div>Accuracy: {accuracy}%</div>
          </div>

          {/* FILTER */}
          <input
            style={styles.input}
            placeholder="Search..."
            onChange={(e) => setSearch(e.target.value)}
          />

          <select onChange={(e) => setDifficultyFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <div style={styles.grid}>
            {/* QUESTIONS */}
            <div style={styles.section}>
              <h2>Questions</h2>

              {filtered.map((q) => (
                <div key={q._id} style={styles.card}>
                  <h3>{q.title}</h3>
                  <p>{q.description}</p>

                  <span style={styles.badge}>{q.difficulty}</span>

                  <input
                    style={styles.input}
                    placeholder="Your answer"
                    onChange={(e) =>
                      handleChange(q._id, e.target.value)
                    }
                  />

                  <button
                    style={styles.button}
                    onClick={() => handleSubmit(q._id)}
                  >
                    Submit
                  </button>

                  {results[q._id] && (
                    <p>
                      {results[q._id].isCorrect
                        ? "✅ Correct"
                        : "❌ Wrong"}{" "}
                      | Score: {results[q._id].score}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* HISTORY */}
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

// 🎨 STYLES
const styles = {
  container: { padding: "20px", background: "#f4f6f8" },
  title: { textAlign: "center" },
  loginBox: {
    maxWidth: "350px",
    margin: "auto",
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
  },
  grid: { display: "flex", gap: "20px" },
  section: { flex: 1 },
  card: {
    background: "#fff",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "8px",
  },
  history: {
    background: "#ddd",
    padding: "8px",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
  },
  button: {
    padding: "8px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  logout: {
    marginBottom: "10px",
    background: "red",
    color: "#fff",
    padding: "8px",
  },
  dashboard: {
    display: "flex",
    gap: "20px",
    marginBottom: "10px",
  },
  badge: {
    background: "#28a745",
    color: "#fff",
    padding: "3px 6px",
    borderRadius: "5px",
  },
};

export default App;