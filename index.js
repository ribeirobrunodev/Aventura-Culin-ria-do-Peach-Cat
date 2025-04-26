// Global variables related to each element, character, and state in the game.
var gameContainer = document.querySelector("#game-container");
var gameContainerRect = gameContainer.getBoundingClientRect();
var grid = document.querySelector(".grid");
var gameStart = false;
var win = false;
var paused = false;
var timesup = false;

var lifeLost = false;
var lifeLostDirectionChange = false;
var lives = document.getElementById("lives");

// Pause menu element
var pauseMenu = document.querySelector("#pause-menu");

// Start screen element
const startScreen = document.getElementById("start-screen");

// Image preloader
let img = new Image();

class Ball {
  constructor(left, bottom, direction, directionX, random) {
    this.direction = direction;
    this.left = left;
    this.bottom = bottom;
    this.directionX = directionX;
    this.random = random;
  }

  moveUp() {
    this.bottom += 3;
  }
  moveDown() {
    this.bottom -= 3;
  }
  moveLeft() {
    this.left -= 3;
  }
  moveRight() {
    this.left += 3;
  }
  moveRandom() {
    if (random == 0) random = -1.5;
    this.left += random;
  }
}

let random = Math.floor(Math.random() * (4 - -4 + 1)) + -4;
let ballClass = new Ball(0, 68, null, null, random);

var blocks = [];
function CreateGrid() {
  for (var i = 0; i < 40; i++) {
    var rectangle = document.createElement("img");
    rectangle.src = "static/1.gif";
    if (i >= 10 && i <= 19) rectangle.src = "static/3.gif";
    else if (i >= 20 && i <= 29) rectangle.src = "static/5.gif";
    else if (i >= 30 && i <= 40) rectangle.src = "static/2.gif";

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

var player = document.createElement("div");
var ball = document.createElement("img");
var ballbox = document.createElement("div");

var water = document.createElement("div");
var ballbox = document.createElement("div");
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

function CreatePlayer() {
  player.id = "player";
  player.style.height = "15px";
  player.style.width = "120px";
  player.style.transform = `translateX(${
    gameContainerRect.width / 2 - 120 / 2
  }px)`;
  player.style.bottom = "50px";
  player.style.marginLeft = "1px";
  player.style.position = "absolute";
  document.querySelector("#game-container").appendChild(player);
}
CreatePlayer();

var position = gameContainerRect.width / 2 - 120 / 2 - 1;
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

ball.id = "sprite";
ball.src = "./src/assets/gat5.gif";
ball.style.position = "absolute";

ballbox.className = "ballbox";
ballbox.appendChild(ball);
gameContainer.appendChild(ballbox);

ballbox.style.left = `${
  gameContainerRect.width / 2 - ballbox.getBoundingClientRect().width / 2
}px`;

var topEdge, rightEdge, leftEdge, brickBottomCollision, pCollision;
var c = 2;
var ballRec = ballbox.getBoundingClientRect();
var gameRect = gameContainer.getBoundingClientRect();

function CreateWater() {
  water.id = "water";
  water.style.position = "absolute";
  water.style.width = "100%";
  water.style.height = "43px";
  water.style.bottom = "0px";
  gameContainer.appendChild(water);
}
CreateWater();

var topEdge, rightEdge, leftEdge, brickBottomCollision, pCollision;

function MoveBall() {
  CheckCollision();
  ballbox.style.transform = `translate(${ballClass.left}px,${
    -ballClass.bottom + 66
  }px)`;

  if (ballClass.direction == "up") ballClass.moveUp();
  if (ballClass.direction == "down") ballClass.moveDown();

  if (
    (rightEdge && ballClass.directionX == "left") ||
    (pCollision && ballClass.directionX == "left")
  )
    ballClass.moveLeft();
  else if (
    (leftEdge && ballClass.directionX == "right") ||
    (pCollision && ballClass.directionX == "right")
  )
    ballClass.moveRight();

  if (ballClass.directionX == null) ballClass.moveRandom();

  if (ballClass.bottom <= 30) {
    ballClass.moveUp();
    lifeLost = true;
    return;
  }
}

var frontEndScore = document.querySelector("#score");

var url = window.location.href;
function trim() {
  if (url.includes("index.html")) {
    url = window.location.href.slice(0, -10);
  }
}
trim();

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
    topEdge = true;
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
      brickBottomCollision = true;
      topEdge = false;
      changeSrc();
      lifeLostDirectionChange = false;
      return;
    }
  });

  var gridLength = grid.querySelectorAll(".hidden").length;
  frontEndScore.textContent = gridLength;

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
    pCollision = true;
    topEdge = false;
    brickBottomCollision = false;
    changeSrc();
  }

  if (lifeLostDirectionChange) {
    lifeLostDirectionChange = false;
    ballClass.bottom += 2;
    ballClass.direction = "up";
    changeSrc();
  }

  if (ballRec.right >= gameRect.right) {
    rightEdge = true;
    leftEdge = false;
    ball.src = "gat5.gif";
    ballClass.directionX = "left";
  }

  if (ballRec.left <= gameRect.left) {
    leftEdge = true;
    rightEdge = false;
    ball.src = "gat5.gif";
    ballClass.directionX = "right";
  }
}

var sCount = 0;
var pCount = 1;

function start(event) {
  if (event.key === "Enter" && sCount === 0) {
    if (startScreen) {
      startScreen.style.display = "none"; // Esconde a tela inicial
    }
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

  if (paused === true && event.key === "r") {
    Reload();
  }
}

window.addEventListener("keydown", MovePlayer);
function Game() {
  if (gameStart && !paused) {
    MoveBall();
    drawPlayer();
    bricksDimensions();
  }
  if (win) {
    alert("" + "Parabéns! Você ganhou!😍");
    clearInterval(timerId);
    return;
  }
  if (timesup) {
    alert("GAME OVER!Tempo acabou!");
    return;
  }
  if (lifeLost) {
    lives.removeChild(lives.lastChild);
    lifeLost = false;
    lifeLostDirectionChange = true;

    if (document.querySelectorAll(".life").length == 0) {
      alert("Game over!Tenta novamente.😘");
      clearInterval(timerId);
      window.location.reload(); // Reinicia o jogo após clicar em OK
      return;
    }
  }
  if (!paused) {
    requestAnimationFrame(Game);
  }
}

function Reload() {
  gameStart = false;
  window.location.reload();
}

let timerId;
function startTimer(duration, display) {
  var timer = duration,
    minutes,
    seconds;
  timerId = setInterval(function () {
    if (!timesup) {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      display.textContent = minutes + ":" + seconds;
      if (timer-- <= 0) {
        timesup = true;
        return;
      }
    }
  }, 1000);
}

let display = document.querySelector("#time");
function InitTimer() {
  let twoMin = 60 * 3;
  startTimer(twoMin, display);
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

let leftbtn = document.getElementById("leftbtn");
let rightbtn = document.getElementById("rightbtn");

leftbtn.addEventListener("touchstart", MoveLeft);
rightbtn.addEventListener("touchstart", MoveRight);

function preventZoom(e) {
  var t2 = e.timeStamp;
  var t1 = e.currentTarget.dataset.lastTouch || t2;
  var dt = t2 - t1;
  var fingers = e.touches.length;
  e.currentTarget.dataset.lastTouch = t2;
  if (!dt || dt > 500 || fingers > 1) return;
  e.preventDefault();
  e.target.click();
}

function MoveLeft(e) {
  preventZoom(e);
  if (!gameStart) {
    ball.src = `gat5.gif`;
    ball.id = "";
    ball.className = "center";
    gameStart = true;
    Game();
    InitTimer();
  }
  if (position >= 29) {
    position -= 18;
    player.style.transform = `translateX(${position}px)`;
  }
  if (position == 11) {
    position -= 11;
    player.style.transform = `translateX(${position}px)`;
  }
}

function MoveRight(e) {
  preventZoom(e);
  if (!gameStart) {
    ball.src = `gat5.gif`;
    ball.id = "";
    ball.className = "center";
    gameStart = true;
    Game();
    InitTimer();
  }
  if (position <= 227) {
    position += 18;
  }
  player.style.transform = `translateX(${position}px)`;
}

function preloadImage(url) {
  img.src = url;
}

gameLoop();

let touchStartX = null;
let touchStartY = null;

canvas.addEventListener("touchstart", handleTouchStart);
canvas.addEventListener("touchmove", handleTouchMove);
canvas.addEventListener("touchend", handleTouchEnd);

function handleTouchStart(event) {
  event.preventDefault();
  const touch = event.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function handleTouchMove(event) {
  if (!touchStartX || !touchStartY) return;
  event.preventDefault();
  const touch = event.touches[0];
  const touchEndX = touch.clientX;
  const touchEndY = touch.clientY;
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  const sensitivity = 20;

  if (Math.abs(deltaX) > sensitivity || Math.abs(deltaY) > sensitivity) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0 && direction !== "left") direction = "right";
      else if (deltaX < 0 && direction !== "right") direction = "left";
    } else {
      if (deltaY > 0 && direction !== "up") direction = "down";
      else if (deltaY < 0 && direction !== "down") direction = "up";
    }
    touchStartX = null;
    touchStartY = null;
  }
}

function handleTouchEnd(event) {
  touchStartX = null;
  touchStartY = null;
}

document.addEventListener("keydown", ({ key }) => {
  if (key === "ArrowRight" && direction !== "left") direction = "right";
  if (key === "ArrowLeft" && direction !== "right") direction = "left";
  if (key === "ArrowDown" && direction !== "up") direction = "down";
  if (key === "ArrowUp" && direction !== "down") direction = "up";
});

function move(dir) {
  if (dir === "up" && direction !== "down") direction = "up";
  if (dir === "down" && direction !== "up") direction = "down";
  if (dir === "left" && direction !== "right") direction = "left";
  if (dir === "right" && direction !== "left") direction = "right";
}

buttonPlay.addEventListener("click", () => {
  score.innerText = "00";
  menu.style.display = "none";
  canvas.style.filter = "none";
  snake = [initialPosition];
  direction = undefined;
  gameLoop();
});

function checkMobile() {
  if (window.innerWidth <= 768) {
    if (mobileControls) mobileControls.style.display = "flex";
  } else {
    if (mobileControls) mobileControls.style.display = "none";
  }
}

checkMobile();
window.addEventListener("resize", checkMobile);
