// Global variables
var gameContainer = document.querySelector("#game-container");
var grid = document.querySelector(".grid");
var gameContainerRect = gameContainer.getBoundingClientRect();
var gameStart = false;
var win = false;
var paused = false;
var timesup = false;
var lifeLost = false;
var lifeLostDirectionChange = false;
var lives = document.getElementById("lives");
var pauseMenu = document.querySelector("#pause-menu");
const startScreen = document.getElementById("start-screen");

// Preload
let img = new Image();

// Ball class
class Ball {
  constructor(left, bottom, direction, directionX, random) {
    this.left = left;
    this.bottom = bottom;
    this.direction = direction;
    this.directionX = directionX;
    this.random = random;
  }
  moveUp() { this.bottom += 3; }
  moveDown() { this.bottom -= 3; }
  moveLeft() { this.left -= 3; }
  moveRight() { this.left += 3; }
  moveRandom() {
    if (this.random == 0) this.random = -1.5;
    this.left += this.random;
  }
}

// Setup
let random = Math.floor(Math.random() * 9) - 4;
let ballClass = new Ball(0, 68, null, null, random);

var blocks = [];
function CreateGrid() {
  for (var i = 0; i < 40; i++) {
    var rectangle = document.createElement("img");
    if (i >= 10 && i <= 19) rectangle.src = "static/3.gif";
    else if (i >= 20 && i <= 29) rectangle.src = "static/5.gif";
    else if (i >= 30 && i <= 40) rectangle.src = "static/2.gif";
    else rectangle.src = "static/1.gif";

    rectangle.style.objectFit = "scale-down";
    rectangle.style.border = "solid 1px yellow";
    rectangle.style.borderRadius = "8%";
    rectangle.style.height = "40px";
    rectangle.style.width = "100%";
    rectangle.id = `block-${i + 1}`;
    rectangle.className = "block";
    grid.append(rectangle);
    blocks.push(rectangle);
  }
  preloadImage("gat5.gif");
}
CreateGrid();

function DisplayLives() {
  for (var j = 0; j < 3; j++) {
    var life = document.createElement("img");
    life.src = "static/life.png";
    life.style.height = "20px";
    life.style.width = "20px";
    life.className = "life";
    lives.append(life);
  }
}
DisplayLives();

// Create water
var water = document.createElement("div");
function CreateWater() {
  water.id = "water";
  water.style.position = "absolute";
  water.style.width = "100%";
  water.style.height = "43px";
  water.style.bottom = "0px";
  gameContainer.appendChild(water);
}
CreateWater();

// Create player
var player = document.createElement("div");
function CreatePlayer() {
  player.id = "player";
  player.style.height = "15px";
  player.style.width = "120px";
  player.style.position = "absolute";
  player.style.bottom = "50px";
  player.style.marginLeft = "1px";
  player.style.transform = `translateX(${gameContainerRect.width / 2 - 60}px)`;
  gameContainer.appendChild(player);
}
CreatePlayer();

var position = gameContainerRect.width / 2 - 60;
var sCount = 0;
var pCount = 1;

function MovePlayer(event) {
  start(event);
  if (!gameStart) return;

  switch (event.key) {
    case "ArrowLeft":
      if (position > 8) position -= 12;
      if (position == 8) position -= 4;
      break;
    case "ArrowRight":
      if (position < 425) position += 12;
      if (position == 428) position += 8;
      break;
  }
  drawPlayer();
}

function drawPlayer() {
  player.style.transform = `translateX(${position}px)`;
}

// Create ball
var ball = document.createElement("img");
var ballbox = document.createElement("div");
ball.id = "sprite";
ball.src = "./src/assets/gat5.gif";
ball.style.position = "absolute";
ballbox.className = "ballbox";
ballbox.appendChild(ball);
gameContainer.appendChild(ballbox);

ballbox.style.left = `${gameContainerRect.width / 2 - ballbox.getBoundingClientRect().width / 2}px`;

// Collision and Movement
var c = 2;
var ballRec = ballbox.getBoundingClientRect();
var gameRect = gameContainer.getBoundingClientRect();

window.addEventListener("resize", bricksDimensions);

function bricksDimensions() {
  gameRect = gameContainer.getBoundingClientRect();
  blocks.forEach((rec) => {
    var newRect = rec.getBoundingClientRect();
    rec.dataset.right = newRect.right;
    rec.dataset.left = newRect.left;
    rec.dataset.bottom = newRect.bottom;
  });
}

function CheckCollision() {
  if (c % 3 == 0) ballRec = ballbox.getBoundingClientRect();
  c++;

  var playerRect = player.getBoundingClientRect();

  if (ballRec.top <= gameRect.top) {
    ballClass.moveDown();
    ballClass.direction = "down";
  }

  blocks.forEach((brick) => {
    var l = parseFloat(brick.dataset.left);
    var r = parseFloat(brick.dataset.right);
    var b = parseFloat(brick.dataset.bottom);
    if (
      brick.className != "hidden" &&
      b >= ballRec.top &&
      ballRec.right > l &&
      ballRec.left < r
    ) {
      brick.style.opacity = "0";
      brick.className = "hidden";
      ballClass.direction = "down";
      changeSrc();
      lifeLostDirectionChange = false;
    }
  });

  var gridLength = grid.querySelectorAll(".hidden").length;
  document.querySelector("#score").textContent = gridLength;

  if (gridLength == 40) {
    win = true;
    return;
  }

  if (
    ballRec.bottom >= playerRect.top &&
    ballRec.right >= playerRect.left &&
    ballRec.left <= playerRect.right
  ) {
    ballClass.direction = "up";
    changeSrc();
  }

  if (lifeLostDirectionChange) {
    lifeLostDirectionChange = false;
    ballClass.bottom += 2;
    ballClass.direction = "up";
    changeSrc();
  }

  if (ballRec.right >= gameRect.right) {
    ballClass.directionX = "left";
  }

  if (ballRec.left <= gameRect.left) {
    ballClass.directionX = "right";
  }
}

function MoveBall() {
  CheckCollision();
  ballbox.style.transform = `translate(${ballClass.left}px,${-ballClass.bottom + 66}px)`;

  if (ballClass.direction == "up") ballClass.moveUp();
  if (ballClass.direction == "down") ballClass.moveDown();

  if (ballClass.directionX == "left") ballClass.moveLeft();
  else if (ballClass.directionX == "right") ballClass.moveRight();

  if (ballClass.directionX == null) ballClass.moveRandom();

  if (ballClass.bottom <= 30) {
    ballClass.moveUp();
    lifeLost = true;
    return;
  }
}

// Start Game
function start(event) {
  if (event.key === "Enter" && sCount === 0) {
    if (startScreen) startScreen.style.display = "none";
    ball.src = `./src/assets/gat5.gif`;
    ball.id = "";
    ball.className = "center";
    Game();
    InitTimer();
    sCount++;
    gameStart = true;
  }
  if (event.key === "p" && pCount % 2 === 1) {
    Pause();
    pCount++;
  } else if (event.key === "p" && pCount % 2 === 0) {
    Resume();
    pCount++;
  }

  if (paused && event.key === "r") {
    Reload();
  }
}

window.addEventListener("keydown", MovePlayer);

// Main loop
function Game() {
  if (gameStart && !paused) {
    MoveBall();
    drawPlayer();
    bricksDimensions();
  }
  if (win) {
    alert("Parabéns! Você ganhou!😍");
    clearInterval(timerId);
    return;
  }
  if (timesup) {
    alert("GAME OVER! Tempo acabou!");
    return;
  }
  if (lifeLost) {
    lives.removeChild(lives.lastChild);
    lifeLost = false;
    lifeLostDirectionChange = true;
    if (document.querySelectorAll(".life").length == 0) {
      alert("Game over! Tente novamente. 😘");
      clearInterval(timerId);
      window.location.reload();
      return;
    }
  }
  if (!paused) {
    requestAnimationFrame(Game);
  }
}

// Timer and Pause/Resume
function Reload() {
  gameStart = false;
  window.location.reload();
}

let timerId;
function startTimer(duration, display) {
  var timer = duration;
  timerId = setInterval(function () {
    if (!timesup) {
      let minutes = parseInt(timer / 60, 10);
      let seconds = parseInt(timer % 60, 10);
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      display.textContent = minutes + ":" + seconds;
      if (timer-- <= 0) {
        timesup = true;
        clearInterval(timerId);
      }
    }
  }, 1000);
}

let display = document.querySelector("#time");
function InitTimer() {
  let threeMin = 60 * 3;
  startTimer(threeMin, display);
}

function Pause() {
  clearInterval(timerId);
  paused = true;
  pauseMenu.style.display = "block";
  gameContainer.classList.add("blur");
}

function Resume() {
  paused = false;
  pauseMenu.style.display = "none";
  gameContainer.classList.remove("blur");

  let currentTime = document.querySelector("#time").innerHTML;
  let totalSeconds =
    parseInt(currentTime.split(":")[0]) * 60 +
    parseInt(currentTime.split(":")[1]);

  if (gameStart) {
    Game();
    startTimer(totalSeconds, display);
  }
}

function changeSrc() {
  ball.src = "gat5.gif";
}

function preloadImage(url) {
  img.src = url;
}

// MOBILE TOUCH CONTROLS
let touchStartX = null;
let touchStartY = null;

gameContainer.addEventListener("touchstart", handleTouchStart);
gameContainer.addEventListener("touchmove", handleTouchMove);
gameContainer.addEventListener("touchend", handleTouchEnd);

function handleTouchStart(event) {
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function handleTouchMove(event) {
  if (!touchStartX || !touchStartY) return;
  const touch = event.touches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;
  const sensitivity = 30;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX > sensitivity) {
      // Swipe para direita
      if (position < gameContainerRect.width - 120) {
        position += 18;
        drawPlayer();
      }
    } else if (deltaX < -sensitivity) {
      // Swipe para esquerda
      if (position > 0) {
        position -= 18;
        drawPlayer();
      }
    }
    touchStartX = null;
    touchStartY = null;
  }
}

function handleTouchEnd(event) {
  touchStartX = null;
  touchStartY = null;
}


// SOM QUANDO ACERTA BLOCOS
const hitSound = document.getElementById("hit-sound");

function playHitSound() {
  if (hitSound) {
    hitSound.currentTime = 0;
    hitSound.play();
  }
}

// MODIFICAR CheckCollision() para tocar o som:
function CheckCollision() {
  if (c % 3 == 0) ballRec = ballbox.getBoundingClientRect();
  c++;

  var playerRect = player.getBoundingClientRect();

  if (ballRec.top <= gameRect.top) {
    ballClass.moveDown();
    ballClass.direction = "down";
  }

  blocks.forEach((brick) => {
    var l = parseFloat(brick.dataset.left);
    var r = parseFloat(brick.dataset.right);
    var b = parseFloat(brick.dataset.bottom);
    if (
      brick.className != "hidden" &&
      b >= ballRec.top &&
      ballRec.right > l &&
      ballRec.left < r
    ) {
      brick.style.opacity = "0";
      brick.className = "hidden";
      ballClass.direction = "down";
      changeSrc();
      lifeLostDirectionChange = false;
      playHitSound(); // TOCA SOM AQUI
    }
  });

  var gridLength = grid.querySelectorAll(".hidden").length;
  document.querySelector("#score").textContent = gridLength;

  if (gridLength == 40) {
    win = true;
    return;
  }

  if (
    ballRec.bottom >= playerRect.top &&
    ballRec.right >= playerRect.left &&
    ballRec.left <= playerRect.right
  ) {
    ballClass.direction = "up";
    changeSrc();
  }

  if (lifeLostDirectionChange) {
    lifeLostDirectionChange = false;
    ballClass.bottom += 2;
    ballClass.direction = "up";
    changeSrc();
  }

  if (ballRec.right >= gameRect.right) {
    ballClass.directionX = "left";
  }

  if (ballRec.left <= gameRect.left) {
    ballClass.directionX = "right";
  }
}
