let players = ["", "", ""];
let roles = [];
let currentPlayer = 0;
let selectedWord = null;
let votes = {};
let scores = {};
let availableWords = [...words];
let timer;
let timeLeft = 60;

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function renderPlayers(){
  const box = document.getElementById("playersBox");
  box.innerHTML = "";
  players.forEach((player, index) => {
    box.innerHTML += `
      <div class="player-row">
        <input placeholder="Player ${index + 1}" value="${player}" oninput="players[${index}] = this.value">
        <button class="remove" onclick="removePlayer(${index})">X</button>
      </div>`;
  });
}

function addPlayer(){
  players.push("");
  renderPlayers();
}

function removePlayer(index){
  if(players.length <= 3){
    alert("Minimum 3 players needed");
    return;
  }
  players.splice(index, 1);
  renderPlayers();
}

function getWord(){
  if(availableWords.length === 0){
    alert("All words used. Click Quit Game to restart.");
    return null;
  }
  const index = Math.floor(Math.random() * availableWords.length);
  const word = availableWords[index];
  availableWords.splice(index, 1);
  return word;
}

function startGame(){
  const validPlayers = players.map(p => p.trim()).filter(p => p !== "");

  if(validPlayers.length < 3){
    alert("Add minimum 3 players");
    return;
  }

  const imposterCount = Number(document.getElementById("imposterCountInput").value);

  if(imposterCount < 1 || imposterCount >= validPlayers.length){
    alert("Imposter count must be at least 1 and less than total players");
    return;
  }

  selectedWord = getWord();
  if(!selectedWord) return;

  validPlayers.forEach(name => {
    if(scores[name] === undefined) scores[name] = 0;
  });

  let imposterIndexes = [];
  while(imposterIndexes.length < imposterCount){
    const randomIndex = Math.floor(Math.random() * validPlayers.length);
    if(!imposterIndexes.includes(randomIndex)){
      imposterIndexes.push(randomIndex);
    }
  }

  roles = validPlayers.map((name, index) => {
    const isImposter = imposterIndexes.includes(index);
    return {
      name,
      role: isImposter ? "IMPOSTER" : "PLAYER",
      word: isImposter ? "" : selectedWord.normal
    };
  });

  currentPlayer = 0;
  votes = {};
  loadRevealScreen();
  showScreen("reveal");
}

function loadRevealScreen(){
  document.getElementById("playerName").innerText = roles[currentPlayer].name;
  document.getElementById("wordBox").classList.add("hidden");
  document.getElementById("showBtn").classList.remove("hidden");
  document.getElementById("nextBtn").classList.add("hidden");
}

function showWord(){
  const player = roles[currentPlayer];

  if(player.role === "IMPOSTER"){
    document.getElementById("categoryText").innerText =
      "Hint: " + selectedWord.categoryMalayalam + " / " + selectedWord.categoryEnglish;
    document.getElementById("secretWord").innerText = "You are the Imposter";
  }else{
    document.getElementById("categoryText").innerText = "";
    document.getElementById("secretWord").innerText = player.word;
  }

  document.getElementById("wordBox").classList.remove("hidden");
  document.getElementById("showBtn").classList.add("hidden");
  document.getElementById("nextBtn").classList.remove("hidden");

  document.getElementById("nextBtn").innerText =
    currentPlayer === roles.length - 1 ? "Start Discussion" : "Next Player";
}

function nextPlayer(){
  if(currentPlayer < roles.length - 1){
    currentPlayer++;
    loadRevealScreen();
  }else{
    startTimer();
    showScreen("discussion");
  }
}

function startTimer(){
  clearInterval(timer);
  timeLeft = Number(document.getElementById("timerInput").value);
  document.getElementById("timerDisplay").innerText = timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timerDisplay").innerText = timeLeft;

    if(timeLeft <= 0){
      clearInterval(timer);
      alert("Discussion time over");
    }
  }, 1000);
}

function showVoting(){
  clearInterval(timer);
  const voteBox = document.getElementById("voteBox");
  voteBox.innerHTML = "";
  votes = {};

  roles.forEach(player => {
    votes[player.name] = 0;
    voteBox.innerHTML += `
      <button class="vote-btn" onclick="votePlayer('${player.name}')">
        ${player.name} - Votes: <span id="vote-${player.name}">0</span>
      </button>`;
  });

  showScreen("vote");
}

function votePlayer(name){
  votes[name]++;
  document.getElementById("vote-" + name).innerText = votes[name];
}

function calculateResult(){
  let maxVotes = -1;
  let votedOutNames = [];

  for(let name in votes){
    if(votes[name] > maxVotes){
      maxVotes = votes[name];
      votedOutNames = [name];
    }else if(votes[name] === maxVotes){
      votedOutNames.push(name);
    }
  }

  if(maxVotes === 0){
    alert("Please vote before finishing");
    return;
  }

  const imposters = roles.filter(p => p.role === "IMPOSTER");
  const imposterNames = imposters.map(p => p.name);
  const allFound = imposterNames.every(name => votedOutNames.includes(name));

  if(allFound){
    document.getElementById("winnerText").innerText = "Players Win 🎉";
    roles.forEach(player => {
      if(player.role === "PLAYER") scores[player.name] += 1;
    });
  }else{
    document.getElementById("winnerText").innerText = "Imposters Win 😈";
    imposters.forEach(imposter => {
      scores[imposter.name] += 2;
    });
  }

  let scoreHTML = `<div class="scoreboard"><h3>Scoreboard</h3>`;
  for(let name in scores){
    scoreHTML += `<div class="score-item"><span>${name}</span><span>${scores[name]}</span></div>`;
  }
  scoreHTML += `</div>`;

  document.getElementById("resultDetails").innerHTML = `
    Voted Out: ${votedOutNames.join(", ")}<br><br>
    Imposters: ${imposterNames.join(", ")}<br><br>
    Secret Word: ${selectedWord.normal}<br>
    Hint: ${selectedWord.categoryMalayalam} / ${selectedWord.categoryEnglish}<br><br>
    Remaining Words: ${availableWords.length}
    ${scoreHTML}
  `;

  showScreen("result");
}

function startNewRound(){
  currentPlayer = 0;
  votes = {};
  startGame();
}

function resetGame(){
  clearInterval(timer);
  players = ["", "", ""];
  roles = [];
  currentPlayer = 0;
  selectedWord = null;
  votes = {};
  scores = {};
  availableWords = [...words];
  renderPlayers();
  showScreen("home");
}

renderPlayers();
