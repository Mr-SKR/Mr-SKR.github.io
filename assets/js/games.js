let peer;
let conn;
let myId;
let opponentId;
let mySymbol; // 'X' or 'O'
let currentTurn; // 'X' or 'O'
let board = ["", "", "", "", "", "", "", "", ""];
let gameActive = false;
let isHost = false;
let myScore = 0;
let opponentScore = 0;
let targetWins = 1;
let connectionRejected = false;

function initPeer() {
  peer = new Peer();

  peer.on("open", (id) => {
    myId = id;
    console.log("My peer ID is: " + id);

    // Check if joining via URL
    const urlParams = new URLSearchParams(window.location.search);
    const joinId = urlParams.get("join");
    if (joinId) {
      document.getElementById("join-game-id").value = joinId;
      joinGame();
    }
  });

  peer.on("connection", (c) => {
    // Host receives connection
    if (conn && conn.open) {
      c.on("open", () => {
        c.send({ type: "game-full" });
        setTimeout(() => {
          c.close();
        }, 500);
      });
      return;
    }
    conn = c;
    opponentId = conn.peer;
    isHost = true;
    setupConnection();
    // Host is X, Opponent is O
    mySymbol = "X";
    currentTurn = "X";
    const seriesLength =
      parseInt(document.getElementById("series-length").value) || 1;
    targetWins = Math.ceil(seriesLength / 2);
    startGame();
    // Send start signal to opponent
    setTimeout(() => {
      conn.send({ type: "start", symbol: "O", targetWins: targetWins });
    }, 500);
  });

  peer.on("error", (err) => {
    console.error(err);
    alert("Connection error: " + err.type);
    document.getElementById("waiting-screen").style.display = "none";
    document.getElementById("connecting-screen").style.display = "none";
    document.getElementById("connected-screen").style.display = "none";
    document.getElementById("initial-screen").style.display = "block";
  });
}

function createGame() {
  document.getElementById("initial-screen").style.display = "none";
  document.getElementById("waiting-screen").style.display = "block";
  document.getElementById("display-game-id").innerText = myId;

  const url = new URL(window.location.href);
  url.searchParams.set("join", myId);
  document.getElementById("share-url").innerText = url.toString();
}

function joinGame() {
  const joinId = document.getElementById("join-game-id").value.trim();
  if (!joinId) return alert("Please enter a Game ID");

  if (joinId === myId) return alert("You cannot play with yourself!");

  conn = peer.connect(joinId);
  setupConnection();

  document.getElementById("initial-screen").style.display = "none";
  document.getElementById("connecting-screen").style.display = "block";
}

function setupConnection() {
  conn.on("open", () => {
    console.log("Connected to: " + conn.peer);
  });

  conn.on("data", (data) => {
    handleData(data);
  });

  conn.on("close", () => {
    if (!connectionRejected) {
      alert("Connection lost");
      location.reload();
    }
  });
}

function handleData(data) {
  if (data.type === "start") {
    mySymbol = data.symbol;
    targetWins = data.targetWins;
    currentTurn = "X"; // X always starts
    myScore = 0;
    opponentScore = 0;
    startGame();
  } else if (data.type === "move") {
    makeMove(data.index, data.symbol);
  } else if (data.type === "nextGame") {
    mySymbol = data.symbol;
    resetBoard();
  } else if (data.type === "requestNext") {
    if (isHost) handleRestart();
  } else if (data.type === "resetSeries") {
    fullReset();
  } else if (data.type === "game-full") {
    connectionRejected = true;
    alert("The game is already full.");
    const url = new URL(window.location.href);
    url.searchParams.delete("join");
    window.history.replaceState({}, document.title, url.toString());
    location.reload();
  }
}

function startGame() {
  document.getElementById("waiting-screen").style.display = "none";
  document.getElementById("connecting-screen").style.display = "none";
  document.getElementById("connected-screen").style.display = "block";
  updateScoreboard();
  gameActive = true;
  updateStatus();
  renderBoard();
  updateButtonState();
}

function updateStatus() {
  const statusEl = document.getElementById("status");
  if (currentTurn === mySymbol) {
    statusEl.innerText = `Your Turn (${mySymbol})`;
    statusEl.style.color = "#007bff";
  } else {
    statusEl.innerText = `Opponent's Turn (${mySymbol === "X" ? "O" : "X"})`;
    statusEl.style.color = "#6c757d";
  }
}

function updateScoreboard() {
  document.getElementById("my-score").innerText = myScore;
  document.getElementById("op-score").innerText = opponentScore;
  document.getElementById("target-score").innerText = targetWins;
}

function renderBoard() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell, index) => {
    cell.innerText = board[index];
    cell.className = "cell"; // reset
    if (board[index] === "X") cell.classList.add("x", "taken");
    if (board[index] === "O") cell.classList.add("o", "taken");

    cell.onclick = () => handleCellClick(index);
  });
}

function handleCellClick(index) {
  if (!gameActive || board[index] !== "" || currentTurn !== mySymbol) return;

  makeMove(index, mySymbol);
  conn.send({ type: "move", index: index, symbol: mySymbol });
}

function makeMove(index, symbol) {
  board[index] = symbol;
  renderBoard();

  if (checkWin()) {
    gameActive = false;
    const isWin = symbol === mySymbol;
    document.getElementById("status").innerText = isWin
      ? "You Win!"
      : "You Lose!";
    document.getElementById("status").style.color = isWin
      ? "#28a745"
      : "#dc3545";

    if (isWin) myScore++;
    else opponentScore++;
    updateScoreboard();
    checkSeriesEnd();
  } else if (board.every((cell) => cell !== "")) {
    gameActive = false;
    document.getElementById("status").innerText = "Draw!";
    document.getElementById("status").style.color = "#ffc107";
    // Draw doesn't affect score, but we check series end just in case logic changes
    // For now, just show button
    updateButtonState();
  } else {
    currentTurn = currentTurn === "X" ? "O" : "X";
    updateStatus();
  }
}

function checkWin() {
  const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Cols
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];

  return winConditions.some((condition) => {
    return condition.every((index) => {
      return board[index] === currentTurn;
    });
  });
}

function checkSeriesEnd() {
  if (myScore >= targetWins) {
    document.getElementById("status").innerText = "Series Won!";
    document.getElementById("status").style.color = "#28a745";
  } else if (opponentScore >= targetWins) {
    document.getElementById("status").innerText = "Series Lost!";
    document.getElementById("status").style.color = "#dc3545";
  }
  updateButtonState();
}

function updateButtonState() {
  const btn = document.getElementById("restart-btn");
  btn.disabled = gameActive;
  if (myScore >= targetWins || opponentScore >= targetWins) {
    btn.innerText = "New Series";
    btn.className = "btn btn-primary mt-4";
  } else {
    btn.innerText = "Next Game";
    btn.className = "btn btn-info mt-4";
  }
}

function handleRestart() {
  if (!conn) return;

  if (!isHost) {
    conn.send({ type: "requestNext" });
    return;
  }

  // Host Logic
  if (myScore >= targetWins || opponentScore >= targetWins) {
    // Series Over - Full Reset
    conn.send({ type: "resetSeries" });
    fullReset();
  } else {
    // Next Game in Series - Swap Symbols
    // If I was X, I become O. If I was O, I become X.
    mySymbol = mySymbol === "X" ? "O" : "X";
    // Opponent gets the opposite
    const opSymbol = mySymbol === "X" ? "O" : "X";
    conn.send({ type: "nextGame", symbol: opSymbol });
    resetBoard();
  }
}

function fullReset() {
  myScore = 0;
  opponentScore = 0;
  // Host resets to X for new series
  if (isHost) mySymbol = "X";
  else mySymbol = "O";
  resetBoard();
}

function resetBoard() {
  board = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  currentTurn = "X"; // X always starts the game logic
  updateStatus();
  renderBoard();
  updateScoreboard();
  updateButtonState();
}

function copyToClipboard(elementId) {
  const el = document.getElementById(elementId);
  const textArea = document.createElement("textarea");
  textArea.value = el.innerText;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("Copy");
  textArea.remove();
  alert("Copied to clipboard!");
}

// Initialize PeerJS when DOM is ready
document.addEventListener("DOMContentLoaded", initPeer);
