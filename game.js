const SIZE = 10;
const WIN = 100;

const LADDERS = {
  4: 14,
  9: 31,
  20: 38,
  28: 84,
  40: 59,
  51: 67,
  63: 81,
  71: 91,
};

const SNAKES = {
  17: 7,
  54: 34,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  99: 78,
};

const boardEl = document.getElementById("board");
const pathsEl = document.getElementById("paths");
const rollBtn = document.getElementById("roll");
const pipsEl = document.getElementById("pips");
const turnLabel = document.getElementById("turn-label");
const logEl = document.getElementById("log");
const winEl = document.getElementById("win");
const winTitle = document.getElementById("win-title");

const state = {
  positions: [0, 0],
  turn: 0,
  busy: false,
  vsCpu: true,
};

function squareToGrid(square) {
  const index = square - 1;
  const rowFromBottom = Math.floor(index / SIZE);
  const colInRow = index % SIZE;
  const col = rowFromBottom % 2 === 0 ? colInRow : SIZE - 1 - colInRow;
  const rowFromTop = SIZE - 1 - rowFromBottom;
  return { row: rowFromTop, col };
}

function buildBoard() {
  boardEl.innerHTML = "";
  const cells = [];
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const rowFromBottom = SIZE - 1 - row;
      const colInRow = rowFromBottom % 2 === 0 ? col : SIZE - 1 - col;
      const square = rowFromBottom * SIZE + colInRow + 1;
      const cell = document.createElement("div");
      cell.className = "cell";
      if ((row + col) % 2 === 1) cell.classList.add("cell--alt");
      if (square === 1) cell.classList.add("cell--start");
      if (square === 100) cell.classList.add("cell--finish");
      cell.dataset.square = String(square);
      cell.innerHTML = `<span>${square}</span><div class="tokens" data-tokens="${square}"></div>`;
      cells.push(cell);
    }
  }
  boardEl.append(...cells);
}

function cellCenter(square) {
  const { row, col } = squareToGrid(square);
  const rect = boardEl.getBoundingClientRect();
  const cellW = rect.width / SIZE;
  const cellH = rect.height / SIZE;
  return {
    x: col * cellW + cellW / 2,
    y: row * cellH + cellH / 2,
  };
}

function drawPaths() {
  const rect = boardEl.getBoundingClientRect();
  pathsEl.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
  pathsEl.innerHTML = "";

  const addPath = (from, to, color, wavy) => {
    const a = cellCenter(from);
    const b = cellCenter(to);
    const midX = (a.x + b.x) / 2 + (wavy ? 24 : 0);
    const midY = (a.y + b.y) / 2;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", wavy ? "5" : "4");
    path.setAttribute("stroke-linecap", "round");
    if (wavy) path.setAttribute("stroke-dasharray", "8 6");
    pathsEl.appendChild(path);
  };

  Object.entries(LADDERS).forEach(([from, to]) => addPath(Number(from), to, "#2f7d4a", false));
  Object.entries(SNAKES).forEach(([from, to]) => addPath(Number(from), to, "#c43c3c", true));
}

function renderTokens() {
  document.querySelectorAll("[data-tokens]").forEach((el) => {
    el.innerHTML = "";
  });
  state.positions.forEach((pos, player) => {
    if (pos < 1) return;
    const holder = document.querySelector(`[data-tokens="${pos}"]`);
    if (!holder) return;
    const token = document.createElement("span");
    token.className = `token token--p${player + 1} token--bounce`;
    holder.appendChild(token);
  });
}

function setPip(value) {
  pipsEl.dataset.value = String(value);
  pipsEl.innerHTML = "";
  for (let i = 0; i < 9; i += 1) {
    pipsEl.appendChild(document.createElement("span"));
  }
}

function log(message) {
  const item = document.createElement("li");
  item.textContent = message;
  logEl.prepend(item);
}

function playerName(index) {
  if (state.vsCpu) return index === 0 ? "You" : "Computer";
  return index === 0 ? "Player 1" : "Player 2";
}

function updateHud() {
  document.getElementById("name-0").textContent = playerName(0);
  document.getElementById("name-1").textContent = playerName(1);
  document.getElementById("pos-0").textContent = String(state.positions[0]);
  document.getElementById("pos-1").textContent = String(state.positions[1]);
  document.getElementById("card-0").classList.toggle("active", state.turn === 0);
  document.getElementById("card-1").classList.toggle("active", state.turn === 1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function movePlayer(player, steps) {
  const start = state.positions[player];
  const target = start + steps;
  if (target > WIN) {
    log(`${playerName(player)} rolled ${steps} but needs an exact ${WIN - start} to finish.`);
    return false;
  }
  for (let square = start + 1; square <= target; square += 1) {
    state.positions[player] = square;
    renderTokens();
    updateHud();
    await sleep(180);
  }
  const landed = state.positions[player];
  if (LADDERS[landed]) {
    log(`${playerName(player)} climbed a ladder ${landed} → ${LADDERS[landed]}.`);
    state.positions[player] = LADDERS[landed];
    renderTokens();
  } else if (SNAKES[landed]) {
    log(`${playerName(player)} slid down a snake ${landed} → ${SNAKES[landed]}.`);
    state.positions[player] = SNAKES[landed];
    renderTokens();
  }
  updateHud();
  return state.positions[player] === WIN;
}

function showWin(player) {
  winTitle.textContent = `${playerName(player)} wins!`;
  winEl.classList.remove("hidden");
  winEl.setAttribute("aria-hidden", "false");
  rollBtn.disabled = true;
  turnLabel.textContent = "Game over";
}

function nextTurn(rolledSix) {
  if (rolledSix) {
    turnLabel.textContent = `${playerName(state.turn)} rolled a 6 and goes again.`;
    updateHud();
    maybeCpuTurn();
    return;
  }
  state.turn = 1 - state.turn;
  turnLabel.textContent =
    state.vsCpu
      ? state.turn === 0
        ? "Your turn — click the die"
        : "Computer is thinking…"
      : `${playerName(state.turn)}'s turn — click the die`;
  updateHud();
  maybeCpuTurn();
}

function maybeCpuTurn() {
  const cpuTurn = state.vsCpu && state.turn === 1 && winEl.classList.contains("hidden");
  rollBtn.disabled = state.busy || cpuTurn;
  if (cpuTurn && !state.busy) {
    setTimeout(() => {
      takeTurn();
    }, 700);
  }
}

async function takeTurn() {
  if (state.busy || !winEl.classList.contains("hidden")) return;
  state.busy = true;
  rollBtn.disabled = true;
  rollBtn.classList.add("rolling");
  let roll = 1;
  for (let i = 0; i < 8; i += 1) {
    roll = 1 + Math.floor(Math.random() * 6);
    setPip(roll);
    await sleep(50);
  }
  rollBtn.classList.remove("rolling");
  log(`${playerName(state.turn)} rolled a ${roll}.`);
  const won = await movePlayer(state.turn, roll);
  state.busy = false;
  if (won) {
    log(`${playerName(state.turn)} reached 100!`);
    showWin(state.turn);
    return;
  }
  nextTurn(roll === 6);
}

function resetGame() {
  state.positions = [0, 0];
  state.turn = 0;
  state.busy = false;
  state.vsCpu = document.querySelector('input[name="mode"]:checked').value === "cpu";
  logEl.innerHTML = "";
  winEl.classList.add("hidden");
  winEl.setAttribute("aria-hidden", "true");
  setPip(1);
  renderTokens();
  updateHud();
  turnLabel.textContent = state.vsCpu ? "Your turn — click the die" : "Player 1's turn — click the die";
  rollBtn.disabled = false;
  log("New game. Tokens start off the board.");
}

buildBoard();
setPip(1);
resetGame();
requestAnimationFrame(drawPaths);
window.addEventListener("resize", drawPaths);
rollBtn.addEventListener("click", takeTurn);
document.getElementById("reset").addEventListener("click", resetGame);
document.getElementById("play-again").addEventListener("click", resetGame);
document.querySelectorAll('input[name="mode"]').forEach((input) => {
  input.addEventListener("change", resetGame);
});
