import { useState } from "react";
import questions from "./data/questions.json";
import "./App.css";

function App() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (choice: string) => {
    if (choice === questions[current].answer) {
      setScore(score + 1);
    }

    const next = current + 1;
    if (next < questions.length) {
      setCurrent(next);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    return (
      <div className="card">
        <h1>Quiz terminé !</h1>
        <p>Score : {score} / {questions.length}</p>
        <button onClick={() => {
          setCurrent(0);
          setScore(0);
          setShowResult(false);
        }}>Recommencer</button>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="card">
      <img src={q.image} alt="plante" />
      <h2>{q.question}</h2>
      <div className="choices">
        {q.choices.map((c, i) => (
          <button key={i} onClick={() => handleAnswer(c)}>{c}</button>
        ))}
      </div>
      <p>{current + 1} / {questions.length}</p>
    </div>
  );
}

export default App;
