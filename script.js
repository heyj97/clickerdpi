const gameArea = document.getElementById("game-area");
const scoreDisplay = document.getElementById("score");
const timerProgress = document.getElementById("timer-progress");
const endScreen = document.getElementById("end-screen");
const finalScore = document.getElementById("final-score");
const restartButton = document.getElementById("restart-button");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");

const explodeSound = document.getElementById("explode-sound");

const sfxVolumeSlider = document.getElementById("sfx-volume");
const sfxMuteBtn = document.getElementById("sfx-mute");

let score = 0;
let gameDuration = 30; // seconds
let circleCount = 5;
let timerInterval;

let sfxEnabled = true;
let prevSfxVolume = 1;

// 초기 볼륨 설정
explodeSound.volume = 1;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isOverlapping(x1, y1, r1, x2, y2, r2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < r1 + r2;
}

function createCircle() {
  const size = getRandomInt(30, 60);
  const radius = size / 2;
  let x,
    y,
    tries = 0;

  do {
    x = getRandomInt(0, gameArea.clientWidth - size);
    y = getRandomInt(0, gameArea.clientHeight - size);
    tries++;

    const cx = x + radius;
    const cy = y + radius;

    const overlaps = [...gameArea.getElementsByClassName("circle")].some(
      (existing) => {
        const ex =
          parseFloat(existing.style.left) +
          parseFloat(existing.style.width) / 2;
        const ey =
          parseFloat(existing.style.top) +
          parseFloat(existing.style.height) / 2;
        const er = parseFloat(existing.style.width) / 2;
        return isOverlapping(cx, cy, radius, ex, ey, er);
      }
    );

    if (!overlaps) break;
  } while (tries < 100);

  const circle = document.createElement("div");
  circle.classList.add("circle");
  circle.style.width = `${size}px`;
  circle.style.height = `${size}px`;
  circle.style.left = `${x}px`;
  circle.style.top = `${y}px`;
  circle.style.backgroundColor = `hsl(${getRandomInt(0, 360)}, 70%, 60%)`;

  circle.addEventListener("click", (e) => {
    e.stopPropagation();

    // ✅ 중복 클릭 방지
    if (circle.classList.contains("clicked")) return;
    circle.classList.add("clicked");

    score++;
    updateScore();

    // +1 텍스트
    const floating = document.createElement("div");
    floating.classList.add("floating-text");
    floating.textContent = "+1";
    floating.style.left = `${
      e.clientX - gameArea.getBoundingClientRect().left
    }px`;
    floating.style.top = `${
      e.clientY - gameArea.getBoundingClientRect().top
    }px`;
    gameArea.appendChild(floating);
    setTimeout(() => floating.remove(), 600);

    if (explodeSound.volume > 0) {
      explodeSound.currentTime = 0;
      explodeSound.play();
    }

    circle.classList.add("explode");
    circle.addEventListener(
      "animationend",
      () => {
        circle.remove();
        gameArea.appendChild(createCircle());
      },
      { once: true }
    );
  });

  return circle;
}

function updateScore() {
  scoreDisplay.textContent = `점수: ${score}`;
}

function startGame() {
  score = 0;
  updateScore();
  gameArea.innerHTML = "";
  startScreen.style.display = "none";
  endScreen.style.display = "none";
  timerProgress.classList.remove("low-time");

  for (let i = 0; i < circleCount; i++) {
    gameArea.appendChild(createCircle());
  }

  let timeLeft = gameDuration;
  timerProgress.style.height = "100%";

  timerInterval = setInterval(() => {
    timeLeft--;

    // ⏳ 빨간색으로 바꾸기
    if (timeLeft <= 5) {
      timerProgress.classList.add("low-time");
    }

    timerProgress.style.height = `${(timeLeft / gameDuration) * 100}%`;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  clearInterval(timerInterval);
  gameArea.innerHTML = "";
  endScreen.style.display = "flex";
  finalScore.textContent = `최종 점수: ${score}`;
}

// 🎮 시작/재시작
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

// 🔊 사운드 슬라이더 조절
sfxVolumeSlider.addEventListener("input", () => {
  const volume = parseFloat(sfxVolumeSlider.value);
  explodeSound.volume = volume;
  prevSfxVolume = volume;
  sfxMuteBtn.textContent = volume === 0 ? "🔈" : "🔇";
});

// 🔇 음소거 버튼
sfxMuteBtn.addEventListener("click", () => {
  if (explodeSound.volume > 0) {
    prevSfxVolume = explodeSound.volume;
    explodeSound.volume = 0;
    sfxVolumeSlider.value = 0;
    sfxMuteBtn.textContent = "🔈";
  } else {
    explodeSound.volume = prevSfxVolume;
    sfxVolumeSlider.value = prevSfxVolume;
    sfxMuteBtn.textContent = "🔇";
  }
});

// 🖱 우클릭 방지
window.addEventListener("contextmenu", (e) => e.preventDefault());
