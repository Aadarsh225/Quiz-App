const startBtn = document.getElementById("start-btn");
const quizContainer = document.getElementById("quiz");
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("next-btn");
const setupScreen = document.getElementById("setup");
const loader = document.getElementById("loader");
const timeEl = document.getElementById("time");

let questions = [];
let currentIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;
let selectedAnswers = [];

startBtn.addEventListener("click", async () => {
  setupScreen.style.display = "none";
  loader.style.display = "block";
  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const difficulty = document.getElementById("difficulty").value;

  let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
  if (category) url += `&category=${category}`;
  if (difficulty) url += `&difficulty=${difficulty}`;

  const res = await fetch(url);
  const data = await res.json();
  questions = data.results;
  currentIndex = 0;
  score = 0;
  selectedAnswers = [];
  loader.style.display = "none";
  quizContainer.style.display = "flex";
  showQuestion();
});

function showQuestion() {
  clearInterval(timer);
  timeLeft = 15;
  timeEl.textContent = timeLeft;
  startTimer();

  resetState();
  const q = questions[currentIndex];
  questionEl.innerHTML = decode(q.question);

  const options = [...q.incorrect_answers, q.correct_answer];
  shuffle(options);

  options.forEach(opt => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.innerText = decode(opt);
    btn.onclick = () => {
      const all = answersEl.querySelectorAll("button");
      all.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedAnswers[currentIndex] = btn.innerText;
      nextBtn.disabled = false;
    };
    li.appendChild(btn);
    answersEl.appendChild(li);
  });

  nextBtn.disabled = true;
  nextBtn.style.display = "block";
}

nextBtn.addEventListener("click", () => {
  currentIndex++;
  if (currentIndex < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
});

function resetState() {
  answersEl.innerHTML = "";
}

function showScore() {
  clearInterval(timer);
  quizContainer.innerHTML = "<h2>Quiz Summary</h2>";
  questions.forEach((q, idx) => {
    const userAnswer = selectedAnswers[idx];
    const correctAnswer = decode(q.correct_answer);
    const qElem = document.createElement("div");
    qElem.style.marginBottom = "20px";
    qElem.innerHTML = `
      <strong>Q${idx + 1}: ${decode(q.question)}</strong><br>
      Your Answer: <span style="color:${userAnswer === correctAnswer ? 'green' : 'red'}">${userAnswer || 'None'}</span><br>
      Correct Answer: <span style="color:green">${correctAnswer}</span>
    `;
    if (userAnswer === correctAnswer) score++;
    quizContainer.appendChild(qElem);
  });

  const highScore = Math.max(score, localStorage.getItem("highScore") || 0);
  localStorage.setItem("highScore", highScore);

  const summary = document.createElement("div");
  summary.innerHTML = `
    <h2>Your Score: ${score}/${questions.length}</h2>
    <p>High Score: ${highScore}</p>
    <button onclick="location.reload()">Restart</button>
  `;
  quizContainer.appendChild(summary);
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft === 0) {
      clearInterval(timer);
      nextBtn.disabled = false;
    }
  }, 1000);
}

function decode(str) {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
