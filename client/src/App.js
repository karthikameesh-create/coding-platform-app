import React, { useState, useEffect } from "react";

const BASE_URL = "https://coding-platform-backend-95zi.onrender.com";

function App() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [results, setResults] = useState({});

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchSubmissions();
    }
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    const res = await fetch(`${BASE_URL}/api/questions`);
    const data = await res.json();
    setQuestions(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const fetchSubmissions = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/submit/my`, {
      headers: { Authorization: token },
    });

    const data = await res.json();
    setSubmissions(Array.isArray(data) ? data : []);
  };

  const handleRegister = async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    alert(data.message);

    if (data.message === "User registered successfully") {
      handleLogin();
    }
  };

  const handleLogin = async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setIsLoggedIn(true);
      fetchSubmissions();
    } else {
      alert(data.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    setSubmissions([]);
  };

  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (questionId) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        questionId,
        answer: answers[questionId],
      }),
    });

    const data = await res.json();

    setResults((prev) => ({ ...prev, [questionId]: data }));
    fetchSubmissions();
  };

  // 📊 STATS
  const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
  const totalAttempts = submissions.length;
  const correctCount = submissions.filter((s) => s.isCorrect).length;

  const accuracy =
    totalAttempts > 0
      ? ((correctCount / totalAttempts) * 100).toFixed(1)
      : 0;

  // 🧠 IQ SCORE
  const getIQScore = (accuracy) => {
    if (accuracy < 30) return 80;
    if (accuracy < 50) return 95;
    if (accuracy < 70) return 105;
    if (accuracy < 85) return 115;
    return 125;
  };

  const iqScore = getIQScore(Number(accuracy));

  // 🎓 CERTIFICATE
  const generateCertificate = () => {
    alert(`🎓 Certificate Awarded!

Name: ${user?.name || "User"}
Cognitive Score: ${iqScore}
Accuracy: ${accuracy}%

Great job! 🚀`);
  };

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
        <div style={styles.authBox}>
          <h2>Register</h2>
          <input style={styles.input} placeholder="Name" onChange={(e) => setName(e.target.value)} />
          <input style={styles.input} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input style={styles.input} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <button style={styles.button} onClick={handleRegister}>Register</button>

          <hr />

          <h2>Login</h2>
          <input style={styles.input} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input style={styles.input} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <button style={styles.button} onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <>
          <div style={styles.header}>
            <h2>Welcome, {user?.name || "User"} 👋</h2>
            <button style={styles.logout} onClick={handleLogout}>Logout</button>
          </div>

          {/* DASHBOARD */}
          <div style={styles.dashboard}>
            <div>🏆 Score: {totalScore}</div>
            <div>📊 Attempts: {totalAttempts}</div>
            <div>🎯 Accuracy: {accuracy}%</div>
            <div>🧠 Cognitive Score: {iqScore}</div>
          </div>

          {/* CERTIFICATE BUTTON */}
          {accuracy >= 60 && (
            <button style={styles.certBtn} onClick={generateCertificate}>
              🎓 Generate Certificate
            </button>
          )}

          <input style={styles.input} placeholder="Search..." onChange={(e) => setSearch(e.target.value)} />

          {loading && <p>Loading questions...</p>}

          <div style={styles.grid}>
            <div style={styles.section}>
              <h2>Questions</h2>

              {filtered.map((q) => (
                <div key={q._id} style={styles.card}>
                  <h3>{q.title}</h3>
                  <p>{q.description}</p>

                  <span style={styles.badge(q.difficulty)}>
                    {q.difficulty}
                  </span>

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
                      {results[q._id].isCorrect ? "✅ Correct" : "❌ Wrong"} | {results[q._id].score}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div style={styles.section}>
              <h2>History</h2>

              {submissions.map((s) => (
                <div key={s._id} style={styles.history}>
                  <strong>{s.answer}</strong> → {s.isCorrect ? "✅" : "❌"} ({s.score})
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "20px", background: "#121212", color: "#fff", minHeight: "100vh" },
  title: { textAlign: "center" },
  authBox: { maxWidth: "350px", margin: "auto", background: "#1e1e1e", padding: "20px", borderRadius: "10px" },
  header: { display: "flex", justifyContent: "space-between" },
  dashboard: { display: "flex", gap: "20px", margin: "10px 0" },
  grid: { display: "flex", gap: "20px" },
  section: { flex: 1 },
  card: { background: "#1e1e1e", padding: "15px", marginBottom: "10px", borderRadius: "10px" },
  history: { background: "#2c2c2c", padding: "8px", marginBottom: "5px", borderRadius: "5px" },
  input: { width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "5px" },
  button: { padding: "8px", background: "#4cafef", border: "none", color: "#fff", borderRadius: "5px", cursor: "pointer" },
  logout: { background: "red", padding: "8px", color: "#fff", border: "none", borderRadius: "5px" },
  certBtn: { background: "gold", color: "#000", padding: "10px", borderRadius: "5px", marginBottom: "10px" },
  badge: (d) => ({
    background: d === "easy" ? "green" : d === "medium" ? "orange" : "red",
    padding: "3px 6px",
    borderRadius: "5px",
    display: "inline-block"
  }),
};

export default App;