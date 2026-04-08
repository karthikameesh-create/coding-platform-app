import React, { useState, useEffect } from "react";

const BASE_URL = "https://coding-platform-app.onrender.com";

function App() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [time, setTime] = useState(0);
  const [isTestFinished, setIsTestFinished] = useState(false);

  // ⏱ TIMER
  useEffect(() => {
    let timer;
    if (isLoggedIn && !isTestFinished) {
      timer = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isLoggedIn, isTestFinished]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const res = await fetch(`${BASE_URL}/api/questions`);
    const data = await res.json();
    setQuestions(data);
  };

  // 🔐 REGISTER
  const handleRegister = async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    alert(data.message);
  };

  // 🔐 LOGIN
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
    } else {
      alert(data.message);
    }
  };

  // 🚪 LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
  };

  // ✍️ INPUT
  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  // 🎯 DIFFICULTY SCORING
  const getScoreByDifficulty = (difficulty) => {
    if (difficulty === "easy") return 5;
    if (difficulty === "medium") return 10;
    if (difficulty === "hard") return 15;
    return 0;
  };

  // 🤖 AI Explanation
  const getAIExplanation = (question) => {
    const desc = question.description.toLowerCase();

    if (desc.includes("2, 6, 12")) {
      return "Pattern increases by +4, +6, +8, +10 → next is 42.";
    }
    if (desc.includes("1, 4, 9")) {
      return "Perfect squares → 1²,2²,3²,4² → next is 25.";
    }
    if (desc.includes("3, 9, 27")) {
      return "Multiply by 3 → next is 81.";
    }
    if (desc.includes("mirror")) {
      return "Mirror time = 11:60 - time → 8:45.";
    }

    return "Analyze step by step carefully.";
  };

  // 🚀 SUBMIT
  const handleSubmit = async (question) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/api/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        questionId: question._id,
        answer: answers[question._id],
      }),
    });

    const data = await res.json();

    const score = data.isCorrect
      ? getScoreByDifficulty(question.difficulty)
      : 0;

    setResults((prev) => ({
      ...prev,
      [question._id]: {
        ...data,
        score,
      },
    }));
  };

  // 👉 NAVIGATION
  const nextQuestion = () => {
    if (!results[questions[currentIndex]._id]) {
      alert("Submit answer first!");
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsTestFinished(true);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  // 📊 RESULTS
  const allResults = Object.values(results);
  const totalAttempts = allResults.length;
  const correctCount = allResults.filter(r => r.isCorrect).length;
  const wrongCount = totalAttempts - correctCount;

  const totalScore = allResults.reduce((sum, r) => sum + r.score, 0);

  const accuracy =
    totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0;

  const timeScore = Math.max(0, 100 - Math.floor(time / 2));

  const finalScore = Math.round((accuracy * 0.5) + (timeScore * 0.2) + totalScore);

  // 🏆 RANKING
  const getRank = (score) => {
    if (score >= 90) return 1;
    if (score >= 75) return 2;
    if (score >= 60) return 3;
    if (score >= 40) return 4;
    return 5;
  };

  return (
    <div style={styles.container}>
      <h1>🧠 BrainScore AI</h1>

      {!isLoggedIn ? (
        <div style={styles.authBox}>
          <h2>Login / Register</h2>

          <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
          <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

          <button onClick={handleRegister}>Register</button>
          <button onClick={handleLogin} style={{ marginLeft: "10px" }}>
            Login
          </button>
        </div>
      ) : isTestFinished ? (
        <div style={styles.resultBox}>
          <h2>📊 Final Report</h2>

          <h3>👤 {user?.name}</h3>

          <p>✅ Correct: {correctCount}</p>
          <p>❌ Wrong: {wrongCount}</p>
          <p>🎯 Accuracy: {accuracy.toFixed(1)}%</p>

          <p>🏆 Score: {totalScore}</p>

          <p>⏱ Time: {time}s</p>

          <h2>🧠 Final Score: {finalScore}</h2>
          <h2>🏆 Rank: #{getRank(finalScore)}</h2>

          <button onClick={() => window.location.reload()}>
            🔄 Retake
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p>⏱ Time: {time}s</p>
            <button onClick={handleLogout}>Logout</button>
          </div>

          {questions.length > 0 && (
            <div style={styles.card}>
              <h3>Question {currentIndex + 1}/{questions.length}</h3>

              <h2>{questions[currentIndex].title}</h2>
              <p>{questions[currentIndex].description}</p>

              <input
                value={answers[questions[currentIndex]._id] || ""}
                onChange={(e) =>
                  handleChange(questions[currentIndex]._id, e.target.value)
                }
              />

              <button onClick={() => handleSubmit(questions[currentIndex])}>
                Submit
              </button>

              {results[questions[currentIndex]._id] && (
                <div style={{ marginTop: "10px" }}>
                  <p>
                    {results[questions[currentIndex]._id].isCorrect
                      ? "✅ Correct"
                      : "❌ Wrong"}{" "}
                    | +{results[questions[currentIndex]._id].score}
                  </p>

                  {!results[questions[currentIndex]._id].isCorrect && (
                    <div style={{ color: "#ffcc00" }}>
                      <p>✅ Answer: {questions[currentIndex].correctAnswer}</p>
                      <p>🤖 {getAIExplanation(questions[currentIndex])}</p>
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: "10px" }}>
                <button onClick={prevQuestion}>⬅ Prev</button>
                <button onClick={nextQuestion} style={{ marginLeft: "10px" }}>
                  {currentIndex === questions.length - 1 ? "Finish" : "Next ➡"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "20px", background: "#121212", color: "#fff", minHeight: "100vh" },
  authBox: { maxWidth: "300px", margin: "auto" },
  card: { background: "#1e1e1e", padding: "15px", marginTop: "20px" },
  resultBox: { textAlign: "center", marginTop: "50px" }
};

export default App;