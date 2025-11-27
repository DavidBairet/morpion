"use strict";

// Sélection des éléments du DOM
const cells = document.querySelectorAll(".cell");
const status = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const resetScoresBtn = document.getElementById("resetScores");
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const scoreDraw = document.getElementById("scoreDraw");
const modePvpBtn = document.getElementById("mode-pvp");
const modePvaiBtn = document.getElementById("mode-pvai");

// Constantes pour les joueurs
const HUMAN_PLAYER = "X";
const AI_PLAYER = "O";

// État du jeu
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = HUMAN_PLAYER;
let gameActive = true;
let scores = { X: 0, O: 0, draw: 0 };
let mode = "pvp"; // 'pvp' ou 'pvai'

// Combinaisons gagnantes
const winPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // lignes
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // colonnes
  [0, 4, 8],
  [2, 4, 6], // diagonales
];

// Retourne le pattern gagnant ou null
function getWinningPattern(b) {
  for (const pattern of winPatterns) {
    const [a, c, d] = pattern;
    if (b[a] !== "" && b[a] === b[c] && b[a] === b[d]) {
      return pattern;
    }
  }
  return null;
}

// Met en valeur les cases gagnantes
function highlightWinner(pattern) {
  pattern.forEach((i) => {
    cells[i].classList.add("winner");
  });
}

// Met à jour l'affichage des scores
function updateScores() {
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
  scoreDraw.textContent = scores.draw;
}

// Met à jour le texte de statut
function updateStatusLabel() {
  if (!gameActive) return;
  const modeText = mode === "pvai" ? " (Joueur vs IA)" : " (Joueur vs Joueur)";
  status.textContent = `Au tour de ${currentPlayer}${modeText}`;
}

// Réinitialise uniquement la partie
function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = HUMAN_PLAYER;
  gameActive = true;

  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("taken", "x", "o", "winner");
  });

  updateStatusLabel();
}

// Réinitialise scores + partie
function resetScores() {
  scores = { X: 0, O: 0, draw: 0 };
  updateScores();
  resetGame();
}

// Renvoie les indices vides du plateau
function getEmptyIndexes(b) {
  return b
    .map((val, index) => (val === "" ? index : null))
    .filter((index) => index !== null);
}

// Choisit le meilleur coup pour l'IA
function getBestMove() {
  const empty = getEmptyIndexes(board);

  // 1. L'IA peut-elle gagner ?
  for (const index of empty) {
    const copy = [...board];
    copy[index] = AI_PLAYER;
    if (getWinningPattern(copy)) {
      return index;
    }
  }

  // 2. Bloquer le joueur s'il peut gagner
  for (const index of empty) {
    const copy = [...board];
    copy[index] = HUMAN_PLAYER;
    if (getWinningPattern(copy)) {
      return index;
    }
  }

  // 3. Prendre le centre
  if (board[4] === "") return 4;

  // 4. Prendre un coin
  const corners = [0, 2, 6, 8].filter((i) => board[i] === "");
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // 5. Prendre un côté
  const sides = [1, 3, 5, 7].filter((i) => board[i] === "");
  if (sides.length > 0) {
    return sides[Math.floor(Math.random() * sides.length)];
  }

  // Fallback
  return empty[0];
}

// Joue un coup pour le joueur courant
function makeMove(index) {
  if (board[index] !== "" || !gameActive) return false;

  board[index] = currentPlayer;
  const cell = cells[index];
  cell.textContent = currentPlayer;
  cell.classList.add("taken", currentPlayer.toLowerCase());

  const winningPattern = getWinningPattern(board);

  if (winningPattern) {
    status.textContent = `${currentPlayer} a gagné !`;
    gameActive = false;
    scores[currentPlayer]++;
    updateScores();
    highlightWinner(winningPattern);
    return false;
  }

  if (board.every((cell) => cell !== "")) {
    status.textContent = "Match nul !";
    gameActive = false;
    scores.draw++;
    updateScores();
    return false;
  }

  currentPlayer = currentPlayer === HUMAN_PLAYER ? AI_PLAYER : HUMAN_PLAYER;
  updateStatusLabel();
  return true;
}

// Tour de l'IA
function playAiTurn() {
  if (!gameActive || mode !== "pvai" || currentPlayer !== AI_PLAYER) return;
  const index = getBestMove();
  makeMove(index);
}

// Gestion du clic sur une case
function handleCellClick(e) {
  if (!gameActive) return;
  if (mode === "pvai" && currentPlayer !== HUMAN_PLAYER) return;

  const index = e.target.dataset.index;
  if (board[index] !== "") return;

  const gameContinues = makeMove(index);

  if (mode === "pvai" && gameContinues && currentPlayer === AI_PLAYER) {
    setTimeout(playAiTurn, 400);
  }
}

// Changement de mode de jeu
function setMode(newMode) {
  mode = newMode;
  modePvpBtn.classList.toggle("mode-active", mode === "pvp");
  modePvaiBtn.classList.toggle("mode-active", mode === "pvai");
  resetGame();
}

// Écouteurs d'événements
cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
resetBtn.addEventListener("click", resetGame);
resetScoresBtn.addEventListener("click", resetScores);
modePvpBtn.addEventListener("click", () => setMode("pvp"));
modePvaiBtn.addEventListener("click", () => setMode("pvai"));

// Initialisation
updateStatusLabel();
updateScores();
