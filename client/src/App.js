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

  // 🧠 ROOM
  const [roomCode, setRoomCode] = useState("");
  const [joinedRoom, setJoinedRoom] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [isStarted, setIsStarted] = useState(false);

  // ⏱ TIMER
  useEffect(() => {
    if (!isStarted) return;

    const timer = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const res = await fetch(`${BASE_URL}/api/questions`);
    const data = await res.json();
    setQuestions(data);
  };

  // 🔐 AUTH
  const handleRegister = async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    alert(data.message);
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
    } else {
      alert("Login failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
  };

  // 🏠 ROOM
  const createRoom = async () => {
    const res = await fetch(`${BASE_URL}/api/room/create`, { method: "POST" });
    const data = await res.json();
    setRoomCode(data.code);
    setJoinedRoom(data.code);
  };

  const joinRoom = async () => {
    const res = await fetch(`${BASE_URL}/api/room/join`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ code: roomCode, name: user.name }),
    });

    const data = await res.json();
    if (data.room) setJoinedRoom(roomCode);
    else alert("Room not found");
  };

  const startTest = async () => {
    await fetch(`${BASE_URL}/api/room/start`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ code: joinedRoom }),
    });
  };

  // 🔄 ROOM STATUS
  useEffect(() => {
    if (!joinedRoom) return;

    const interval = setInterval(async () => {
      const res = await fetch(`${BASE_URL}/api/room/status/${joinedRoom}`);
      const data = await res.json();

      if (data.isStarted) setIsStarted(true);
    }, 2000);

    return () => clearInterval(interval);
  }, [joinedRoom]);

  // 🏆 LEADERBOARD
  useEffect(() => {
    if (!joinedRoom) return;

    const interval = setInterval(async () => {
      const res = await fetch(`${BASE_URL}/api/room/${joinedRoom}`);
      const data = await res.json();
      setLeaderboard(data);
    }, 2000);

    return () => clearInterval(interval);
  }, [joinedRoom]);

  // ✍️ INPUT
  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const getScoreByDifficulty = (difficulty) => {
    if (difficulty === "easy") return 5;
    if (difficulty === "medium") return 10;
    if (difficulty === "hard") return 15;
    return 0;
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
      [question._id]: { ...data, score },
    }));
  };

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

  // 📊 RESULTS
  const allResults = Object.values(results);
  const correctCount = allResults.filter(r => r.isCorrect).length;
  const wrongCount = allResults.length - correctCount;
  const totalScore = allResults.reduce((sum, r) => sum + r.score, 0);

  // 📤 SEND SCORE
  useEffect(() => {
    if (isTestFinished && joinedRoom) {
      fetch(`${BASE_URL}/api/room/update-score`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          code: joinedRoom,
          name: user.name,
          score: totalScore,
        }),
      });
    }
  }, [isTestFinished]);

  return (
    <div style={styles.container}>
      <h1>🧠 BrainScore AI</h1>

      {!isLoggedIn ? (
        <div style={styles.authBox}>
          <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
          <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleRegister}>Register</button>
          <button onClick={handleLogin}>Login</button>
        </div>

      ) : !joinedRoom ? (
        <div style={styles.card}>
          <h2>🎮 Multiplayer</h2>
          <button onClick={createRoom}>Create Room</button>

          <input
            placeholder="Enter Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          />
          <button onClick={joinRoom}>Join</button>

          <button onClick={handleLogout}>Logout</button>
        </div>

      ) : !isStarted ? (
        <div style={styles.card}>
          <h2>Room Code: {joinedRoom}</h2>
          <button onClick={startTest}>Start Test</button>
        </div>

      ) : isTestFinished ? (
        <div style={styles.resultBox}>
          <h2>Final Score: {totalScore}</h2>
          <p>✅ {correctCount} | ❌ {wrongCount}</p>

          <h3>🏆 Leaderboard</h3>
          {leaderboard.map((u, i) => (
            <p key={i}>
              #{i + 1} {u.name} — {u.score}
            </p>
          ))}

          <button onClick={() => window.location.reload()}>Play Again</button>
        </div>

      ) : (
        <div>
          <div style={styles.topBar}>
            <p>⏱ {time}s</p>
            <button onClick={handleLogout}>Logout</button>
          </div>

          <div style={styles.card}>
            <h3>Question {currentIndex + 1}/{questions.length}</h3>
            <h2>{questions[currentIndex]?.title}</h2>
            <p>{questions[currentIndex]?.description}</p>

            <input
              onChange={(e) =>
                handleChange(questions[currentIndex]._id, e.target.value)
              }
            />

            <button onClick={() => handleSubmit(questions[currentIndex])}>
              Submit
            </button>

            <button onClick={nextQuestion}>Next</button>
          </div>

          <div style={styles.card}>
            <h3>🏆 Live Leaderboard</h3>
            {leaderboard.map((u, i) => (
              <p key={i}>
                #{i + 1} {u.name} — {u.score}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "20px", background: "#0f172a", color: "#fff", minHeight: "100vh" },
  authBox: { maxWidth: "300px", margin: "auto", display: "flex", flexDirection: "column", gap: "10px" },
  card: { background: "#1e293b", padding: "20px", marginTop: "20px", borderRadius: "10px" },
  resultBox: { textAlign: "center", marginTop: "50px" },
  topBar: { display: "flex", justifyContent: "space-between" }
};

export default App;