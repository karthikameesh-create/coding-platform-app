import React, { useState } from "react";

const BASE_URL = "http://localhost:5000";

export default function App() {
  // AUTH
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // QUIZ
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [numQuestions, setNumQuestions] = useState(20);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const [time, setTime] = useState(0);
  const [timerRef, setTimerRef] = useState(null);

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  // ROOM
  const [roomCode, setRoomCode] = useState("");
  const [joinedRoom, setJoinedRoom] = useState("");

  // LEADERBOARD
  const [leaderboard, setLeaderboard] = useState([]);

  // AUTH
  const handleAuth = async () => {
    const url = isLogin
      ? `${BASE_URL}/api/auth/login`
      : `${BASE_URL}/api/auth/register`;

    const body = isLogin
      ? { email, password }
      : { name, email, password };

    const res = await fetch(url, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (data.token || data.message) {
      setIsLoggedIn(true);
    } else {
      alert("Auth failed");
    }
  };

  // ROOM
  const createRoom = async () => {
    const res = await fetch(`${BASE_URL}/api/room/create`, {
      method: "POST"
    });

    const data = await res.json();

    alert("Room Code: " + data.code);
    setJoinedRoom(data.code);
  };

  const joinRoom = async () => {
    await fetch(`${BASE_URL}/api/room/join`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ code: roomCode })
    });

    setJoinedRoom(roomCode);
  };

  // AI QUESTIONS
  const generateQuestions = async () => {
    const res = await fetch(`${BASE_URL}/api/ai/generate`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ topic, difficulty })
    });

    const data = await res.json();

    const expanded = [];
    for (let i = 0; i < 10; i++) expanded.push(...data);

    const withIds = expanded.slice(0, numQuestions).map((q, i) => ({
      ...q,
      _id: "q" + i
    }));

    setQuestions(withIds);
    setStarted(true);
    startTimer();
  };

  // TIMER
  const startTimer = () => {
    let t = 0;

    const interval = setInterval(() => {
      t++;
      setTime(t);
    }, 1000);

    setTimerRef(interval);
  };

  // ANSWER
  const handleAnswer = (val) => {
    setAnswers({
      ...answers,
      [questions[currentIndex]._id]: val
    });
  };

  // NEXT
  const next = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      clearInterval(timerRef);
      finishQuiz();
    }
  };

  // SCORE
  const calculateScore = () => {
    let correct = 0;

    questions.forEach(q => {
      if (answers[q._id] === q.correctAnswer) correct++;
    });

    const accuracy = correct / questions.length;
    const speed = Math.max(0, 120 - time) / 120;

    const finalScore = Math.round((accuracy * 70 + speed * 30) * 100);

    return { correct, accuracy, finalScore };
  };

  const finishQuiz = () => {
    const result = calculateScore();

    const newEntry = {
      name: username || "Player",
      score: result.finalScore
    };

    setLeaderboard(prev =>
      [...prev, newEntry].sort((a, b) => b.score - a.score)
    );

    setFinished(true);
  };

  const result = calculateScore();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>🧠 BrainScore AI</h1>

        {/* AUTH */}
        {!isLoggedIn ? (
          <>
            <h2>{isLogin ? "Login" : "Register"}</h2>

            {!isLogin && (
              <input placeholder="Name" onChange={e => setName(e.target.value)} style={styles.input}/>
            )}

            <input placeholder="Username" onChange={e => setUsername(e.target.value)} style={styles.input}/>
            <input placeholder="Email" onChange={e => setEmail(e.target.value)} style={styles.input}/>
            <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} style={styles.input}/>

            <button style={styles.button} onClick={handleAuth}>
              {isLogin ? "Login" : "Register"}
            </button>

            <p style={styles.switch} onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Create account" : "Already have account"}
            </p>
          </>
        ) : !joinedRoom ? (
          <>
            <h2>🎮 Multiplayer</h2>

            <button style={styles.button} onClick={createRoom}>
              Create Room
            </button>

            <input placeholder="Room Code" onChange={e => setRoomCode(e.target.value)} style={styles.input}/>
            <button style={styles.button} onClick={joinRoom}>
              Join Room
            </button>
          </>
        ) : !started ? (
          <>
            <h2>Generate Quiz</h2>

            <input placeholder="Topic" onChange={e => setTopic(e.target.value)} style={styles.input}/>
            <select onChange={e => setDifficulty(e.target.value)} style={styles.input}>
              <option>easy</option>
              <option>medium</option>
              <option>hard</option>
            </select>

            <input
              type="number"
              value={numQuestions}
              onChange={e => setNumQuestions(e.target.value)}
              style={styles.input}
            />

            <button style={styles.button} onClick={generateQuestions}>
              Start Quiz
            </button>
          </>
        ) : finished ? (
          <>
            <h2>🏁 Final Analysis</h2>

            <p>Correct: {result.correct}/{questions.length}</p>
            <p>Accuracy: {(result.accuracy * 100).toFixed(1)}%</p>
            <p>Time: {time}s</p>

            <h2>🔥 Score: {result.finalScore}</h2>

            <h3>🏆 Leaderboard</h3>
            {leaderboard.map((p, i) => (
              <p key={i}>{i + 1}. {p.name} - {p.score}</p>
            ))}
          </>
        ) : (
          <>
            <p>⏱ {time}s</p>
            <h3>Q {currentIndex + 1}/{questions.length}</h3>

            <h2>{questions[currentIndex].title}</h2>
            <p>{questions[currentIndex].description}</p>

            {questions[currentIndex].options.map((opt, i) => (
              <button
                key={i}
                style={{
                  ...styles.option,
                  background:
                    answers[questions[currentIndex]._id] === opt
                      ? "#22c55e"
                      : "#334155"
                }}
                onClick={() => handleAnswer(opt)}
              >
                {opt}
              </button>
            ))}

            <button style={styles.button} onClick={next}>
              Next
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#0f172a",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white"
  },
  card: {
    background: "#1e293b",
    padding: "30px",
    borderRadius: "12px",
    width: "360px",
    textAlign: "center"
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "none"
  },
  button: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#22c55e",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  },
  option: {
    width: "100%",
    padding: "10px",
    margin: "8px 0",
    borderRadius: "8px",
    border: "none",
    color: "white",
    cursor: "pointer"
  },
  switch: {
    marginTop: "10px",
    color: "#60a5fa",
    cursor: "pointer"
  }
};