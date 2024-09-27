const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 공 관련 변수
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;
const ballRadius = 10;

// 패들 관련 변수
const paddleHeight = 10;
let paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

// 키 입력 관련 변수
let rightPressed = false;
let leftPressed = false;

// 벽돌 관련 변수
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// 벽돌 색상 배열 추가
const brickColors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"];

// bricks 배열 초기화 수정
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = {
      x: 0,
      y: 0,
      status: 1,
      color: brickColors[Math.floor(Math.random() * brickColors.length)],
    };
  }
}

// 점수
let score = 0;

// 레벨 관련 변수 추가
let level = 1;
let bricksLeft = brickRowCount * brickColumnCount;

// 파워업 관련 변수 추가
let powerups = [];
const powerupTypes = ["enlarge", "shrink", "speedup", "slowdown"];
const powerupColors = {
  enlarge: "#FFA500",
  shrink: "#800080",
  speedup: "#FF1493",
  slowdown: "#00FFFF",
};

// 고득점 관련 변수 추가
let highScore = localStorage.getItem("highScore") || 0;

// 오디오 요소 가져오기
const backgroundMusic = document.getElementById("backgroundMusic");
const hitSound = document.getElementById("hitSound");
const powerupSound = document.getElementById("powerupSound");

// 오디오 컨트롤 요소
const bgmVolumeSlider = document.getElementById("bgmVolume");
const bgmMuteButton = document.getElementById("bgmMute");
const sfxVolumeSlider = document.getElementById("sfxVolume");
const sfxMuteButton = document.getElementById("sfxMute");

// 오디오 설정
let bgmVolume = 0.5;
let sfxVolume = 0.5;
let bgmMuted = false;
let sfxMuted = false;

// 배경음악 볼륨 조절
bgmVolumeSlider.addEventListener("input", function () {
  bgmVolume = this.value;
  if (!bgmMuted) {
    backgroundMusic.volume = bgmVolume;
  }
});

// 배경음악 음소거 토글
bgmMuteButton.addEventListener("click", function () {
  bgmMuted = !bgmMuted;
  backgroundMusic.volume = bgmMuted ? 0 : bgmVolume;
  this.textContent = bgmMuted ? "음소거 해제" : "음소거";
});

// 효과음 볼륨 조절
sfxVolumeSlider.addEventListener("input", function () {
  sfxVolume = this.value;
  if (!sfxMuted) {
    hitSound.volume = sfxVolume;
    powerupSound.volume = sfxVolume;
  }
});

// 효과음 음소거 토글
sfxMuteButton.addEventListener("click", function () {
  sfxMuted = !sfxMuted;
  hitSound.volume = sfxMuted ? 0 : sfxVolume;
  powerupSound.volume = sfxMuted ? 0 : sfxVolume;
  this.textContent = sfxMuted ? "음소거 해제" : "음소거";
});

// 게임 상태 변수 추가
let gameRunning = false;

// 오디오 재생 함수 수정
function playAudio(audio) {
  if (gameRunning) {
    if (audio === backgroundMusic && !bgmMuted) {
      audio.volume = bgmVolume;
      audio.play().catch((error) => {
        console.log("배경음악 재생 실패:", error);
      });
    } else if (audio !== backgroundMusic && !sfxMuted) {
      audio.volume = sfxVolume;
      audio.play().catch((error) => {
        console.log("효과음 재생 실패:", error);
      });
    }
  }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

// collisionDetection 함수 수정
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score++;
          bricksLeft--;
          playAudio(hitSound); // 효과음 재생
          createPowerup(b.x + brickWidth / 2, b.y + brickHeight);
          if (bricksLeft === 0) {
            level++;
            if (level > 3) {
              alert("축하합니다! 모든 레벨을 클리어하셨습니다!");
              document.location.reload();
            } else {
              alert(`레벨 ${level} 시작!`);
              resetLevel();
            }
          }
        }
      }
    }
  }
}

// 레벨 리셋 함수 추가
function resetLevel() {
  bricksLeft = brickRowCount * brickColumnCount;
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r].status = 1;
    }
  }
  paddleX = (canvas.width - paddleWidth) / 2;
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = 2 + level * 0.5;
  dy = -2 - level * 0.5;
}

// drawScore 함수 수정
function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText(
    `점수: ${score} | 최고 점수: ${highScore} | 레벨: ${level}`,
    8,
    20
  );
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

// drawBricks 함수 수정
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = bricks[c][r].color;
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

// 파워업 생성 함수
function createPowerup(x, y) {
  if (Math.random() < 0.1) {
    // 10% 확률로 파워업 생성
    const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
    powerups.push({ x, y, type, width: 20, height: 20 });
  }
}

// 파워업 그리기 함수
function drawPowerups() {
  for (let i = 0; i < powerups.length; i++) {
    ctx.beginPath();
    ctx.rect(
      powerups[i].x,
      powerups[i].y,
      powerups[i].width,
      powerups[i].height
    );
    ctx.fillStyle = powerupColors[powerups[i].type];
    ctx.fill();
    ctx.closePath();
  }
}

// 파워업 효과 적용 함수 수정
function applyPowerup(type) {
  playAudio(powerupSound); // 효과음 재생
  switch (type) {
    case "enlarge":
      paddleWidth = Math.min(paddleWidth * 1.5, canvas.width);
      setTimeout(() => (paddleWidth /= 1.5), 10000);
      break;
    case "shrink":
      paddleWidth = Math.max(paddleWidth * 0.5, 30);
      setTimeout(() => (paddleWidth *= 2), 10000);
      break;
    case "speedup":
      dx *= 1.5;
      dy *= 1.5;
      setTimeout(() => {
        dx /= 1.5;
        dy /= 1.5;
      }, 10000);
      break;
    case "slowdown":
      dx *= 0.5;
      dy *= 0.5;
      setTimeout(() => {
        dx *= 2;
        dy *= 2;
      }, 10000);
      break;
  }
}

// 파워업 충돌 감지 및 적용
function powerupCollision() {
  for (let i = powerups.length - 1; i >= 0; i--) {
    if (
      powerups[i].y + powerups[i].height > canvas.height - paddleHeight &&
      powerups[i].x > paddleX &&
      powerups[i].x < paddleX + paddleWidth
    ) {
      applyPowerup(powerups[i].type);
      powerups.splice(i, 1);
    } else if (powerups[i].y + powerups[i].height > canvas.height) {
      powerups.splice(i, 1);
    } else {
      powerups[i].y += 2;
    }
  }
}

// 게임 오버 메시지 표시 함수 추가
function drawGameOverMessage() {
  ctx.font = "20px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.textAlign = "center";
  ctx.fillText("게임 오버", canvas.width / 2, canvas.height / 2 - 30);
  ctx.fillText(
    "Enter 키를 눌러 새 게임 시작",
    canvas.width / 2,
    canvas.height / 2 + 10
  );
}

// 게임 오버 함수 수정
function gameOver() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    alert(`새로운 최고 점수: ${highScore}`);
  }
  gameRunning = false;
  drawGameOverMessage();
}

// 게임 초기화 함수
function resetGame() {
  // 점수 초기화
  score = 0;

  // 레벨 초기화
  level = 1;

  // 공 위치 및 속도 초기화
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = 2;
  dy = -2;

  // 패들 위치 초기화
  paddleX = (canvas.width - paddleWidth) / 2;

  // 벽돌 초기화
  bricksLeft = brickRowCount * brickColumnCount;
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r].status = 1;
      bricks[c][r].color =
        brickColors[Math.floor(Math.random() * brickColors.length)];
    }
  }

  // 파워업 초기화
  powerups = [];

  // 패들 크기 초기화
  paddleWidth = 75;

  // 게임 상태 초기화
  gameRunning = true;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!gameRunning) {
    drawGameOverMessage();
    return;
  }

  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawPowerups();
  collisionDetection();
  powerupCollision();

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
    } else {
      gameOver();
      return; // 게임 오버 시 함수 종료
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  x += dx;
  y += dy;

  requestAnimationFrame(draw);
}

// 새로운 게임 시작 함수 수정
function startNewGame() {
  resetGame();
  gameRunning = true;
  draw();
  playAudio(backgroundMusic);
}

// 초기 게임 시작 함수 수정
function initialGameSetup() {
  resetGame();
  gameRunning = false; // 게임 상태를 명시적으로 false로 설정
  drawGameOverMessage();
}

// 키 이벤트 리스너 수정
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    if (!gameRunning) {
      startNewGame();
    }
  } else {
    keyDownHandler(e);
  }
});

// 초기 게임 설정 호출
initialGameSetup();
