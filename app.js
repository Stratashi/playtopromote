// Game State Management
let gameState = {
  username: '',
  link: '',
  linkType: '',
  currentPlayers: [],
  gamesPlayed: 0,
  wins: 0,
  clicksReceived: 0,
  currentWinner: null
};

// Sample players for demo
const samplePlayers = [
  { username: 'Alex', link: 'https://instagram.com/alex' },
  { username: 'Jordan', link: 'https://shop.example.com/jordan' },
  { username: 'Taylor', link: 'https://youtube.com/taylor' }
];

// Utility Functions
function scrollToForm() {
  const registrationSection = document.getElementById('registration');
  registrationSection.scrollIntoView({ behavior: 'smooth' });
}

function hideAllViews() {
  document.querySelectorAll('.game-view').forEach(view => {
    view.style.display = 'none';
  });
  document.getElementById('hero').style.display = 'none';
  document.querySelectorAll('.section').forEach(section => {
    section.style.display = 'none';
  });
  document.querySelector('.footer').style.display = 'none';
}

function showLandingPage() {
  document.getElementById('hero').style.display = 'flex';
  document.querySelectorAll('.section').forEach(section => {
    section.style.display = 'block';
  });
  document.querySelector('.footer').style.display = 'block';
  document.querySelectorAll('.game-view').forEach(view => {
    view.style.display = 'none';
  });
  window.scrollTo(0, 0);
}

function showView(viewId) {
  hideAllViews();
  document.getElementById(viewId).style.display = 'block';
  window.scrollTo(0, 0);
}

// Form Validation
function validateForm() {
  let isValid = true;
  
  // Clear previous errors
  document.querySelectorAll('.error-message').forEach(error => {
    error.classList.remove('show');
  });
  document.querySelectorAll('.form-control').forEach(control => {
    control.classList.remove('error');
  });
  
  // Validate username
  const username = document.getElementById('username').value.trim();
  if (username.length < 3 || username.length > 20) {
    showError('username', 'Username must be between 3 and 20 characters');
    isValid = false;
  }
  
  // Validate link
  const linkUrl = document.getElementById('linkUrl').value.trim();
  const urlPattern = /^https:\/\/.+/;
  if (!urlPattern.test(linkUrl)) {
    showError('linkUrl', 'Please enter a valid URL starting with https://');
    isValid = false;
  }
  
  // Validate link type
  const linkType = document.getElementById('linkType').value;
  if (!linkType) {
    showError('linkType', 'Please select a link type');
    isValid = false;
  }
  
  // Validate terms
  const terms = document.getElementById('terms').checked;
  if (!terms) {
    showError('terms', 'You must agree to the Terms of Service');
    isValid = false;
  }
  
  return isValid;
}

function showError(fieldId, message) {
  const errorElement = document.getElementById(`${fieldId}-error`);
  errorElement.textContent = message;
  errorElement.classList.add('show');
  document.getElementById(fieldId).classList.add('error');
}

// Form Submission
const registrationForm = document.getElementById('registrationForm');
registrationForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  if (validateForm()) {
    // Store user data
    gameState.username = document.getElementById('username').value.trim();
    gameState.link = document.getElementById('linkUrl').value.trim();
    gameState.linkType = document.getElementById('linkType').value;
    
    // Enter lobby
    enterLobby();
  }
});

// Lobby Functions
function enterLobby() {
  // Update lobby view with user data
  document.getElementById('lobbyUsername').textContent = gameState.username;
  document.getElementById('lobbyUserLink').textContent = gameState.link;
  document.getElementById('lobbyUserLink').href = gameState.link;
  
  // Create player list
  gameState.currentPlayers = [
    { username: gameState.username, link: gameState.link },
    ...samplePlayers.slice(0, 3)
  ];
  
  updatePlayersList();
  
  showView('lobbyView');
  
  // Simulate matchmaking
  simulateMatchmaking();
}

function updatePlayersList() {
  const playersList = document.getElementById('playersList');
  playersList.innerHTML = '';
  
  gameState.currentPlayers.forEach(player => {
    const li = document.createElement('li');
    li.textContent = player.username;
    playersList.appendChild(li);
  });
  
  document.getElementById('currentPlayers').textContent = gameState.currentPlayers.length;
}

function simulateMatchmaking() {
  let countdown = 10;
  const waitTimeElement = document.getElementById('waitTime');
  
  const countdownInterval = setInterval(() => {
    countdown--;
    waitTimeElement.textContent = countdown;
    
    if (countdown <= 0) {
      clearInterval(countdownInterval);
      showMatchFound();
    }
  }, 1000);
}

function cancelQueue() {
  showLandingPage();
}

// Match Found
function showMatchFound() {
  showView('matchFoundView');
  
  let countdown = 3;
  const countdownElement = document.getElementById('matchCountdown');
  
  const countdownInterval = setInterval(() => {
    countdown--;
    countdownElement.textContent = countdown;
    
    if (countdown <= 0) {
      clearInterval(countdownInterval);
      startGame();
    }
  }, 1000);
}

// Game Functions
function startGame() {
  showView('gameView');
  
  // Initialize player scores
  const playerScores = document.querySelectorAll('.player-score');
  gameState.currentPlayers.forEach((player, index) => {
    if (index < playerScores.length) {
      playerScores[index].querySelector('.player-name').textContent = player.username;
      playerScores[index].querySelector('.score-value').textContent = '0';
    }
  });
  
  // Simulate game timer and score updates
  let gameTime = 15;
  const timerElement = document.getElementById('gameTimer');
  
  const gameInterval = setInterval(() => {
    gameTime--;
    timerElement.textContent = gameTime;
    
    // Update scores randomly
    playerScores.forEach(scoreElement => {
      const currentScore = parseInt(scoreElement.querySelector('.score-value').textContent);
      const newScore = currentScore + Math.floor(Math.random() * 3);
      scoreElement.querySelector('.score-value').textContent = newScore;
    });
    
    if (gameTime <= 0) {
      clearInterval(gameInterval);
      determineWinner();
    }
  }, 1000);
}

function determineWinner() {
  // Randomly select a winner
  const winnerIndex = Math.floor(Math.random() * gameState.currentPlayers.length);
  const winner = gameState.currentPlayers[winnerIndex];
  gameState.currentWinner = winner;
  
  // Update user stats
  gameState.gamesPlayed++;
  if (winner.username === gameState.username) {
    gameState.wins++;
    gameState.clicksReceived += gameState.currentPlayers.length - 1;
  }
  
  showWinnerAnnouncement();
}

function showWinnerAnnouncement() {
  showView('winnerView');
  
  const winner = gameState.currentWinner;
  document.getElementById('winnerName').textContent = winner.username;
  document.getElementById('winnerLinkDisplay').textContent = winner.link;
  document.getElementById('winnerLinkDisplay').href = winner.link;
  
  // Countdown to redirect
  let countdown = 5;
  const countdownElement = document.getElementById('redirectCountdown');
  const progressFill = document.getElementById('progressFill');
  progressFill.style.width = '100%';
  
  const redirectInterval = setInterval(() => {
    countdown--;
    countdownElement.textContent = countdown;
    progressFill.style.width = `${(countdown / 5) * 100}%`;
    
    if (countdown <= 0) {
      clearInterval(redirectInterval);
      showRedirect();
    }
  }, 1000);
}

function showRedirect() {
  showView('redirectView');
  
  const winner = gameState.currentWinner;
  document.getElementById('redirectLinkDisplay').textContent = winner.link;
  document.getElementById('redirectLinkDisplay').href = winner.link;
  
  // Open winner's link in new tab
  window.open(winner.link, '_blank');
  
  // Show post-game view after 3 seconds
  setTimeout(() => {
    showPostGame();
  }, 3000);
}

function showPostGame() {
  showView('postGameView');
  
  // Update user statistics
  document.getElementById('userGamesPlayed').textContent = gameState.gamesPlayed;
  document.getElementById('userWins').textContent = gameState.wins;
  document.getElementById('userClicks').textContent = gameState.clicksReceived;
}

// Post Game Actions
function playAgain() {
  // Reset form values but keep user data
  document.getElementById('username').value = gameState.username;
  document.getElementById('linkUrl').value = gameState.link;
  document.getElementById('linkType').value = gameState.linkType;
  document.getElementById('terms').checked = true;
  
  enterLobby();
}

function updateLink() {
  showLandingPage();
  scrollToForm();
}

function returnHome() {
  // Reset game state
  gameState = {
    username: '',
    link: '',
    linkType: '',
    currentPlayers: [],
    gamesPlayed: 0,
    wins: 0,
    clicksReceived: 0,
    currentWinner: null
  };
  
  // Reset form
  document.getElementById('registrationForm').reset();
  
  showLandingPage();
}

// Real-time form validation
document.getElementById('username').addEventListener('input', function() {
  const username = this.value.trim();
  const errorElement = document.getElementById('username-error');
  
  if (username.length > 0 && (username.length < 3 || username.length > 20)) {
    showError('username', 'Username must be between 3 and 20 characters');
  } else {
    errorElement.classList.remove('show');
    this.classList.remove('error');
  }
});

document.getElementById('linkUrl').addEventListener('input', function() {
  const linkUrl = this.value.trim();
  const errorElement = document.getElementById('linkUrl-error');
  const urlPattern = /^https:\/\/.+/;
  
  if (linkUrl.length > 0 && !urlPattern.test(linkUrl)) {
    showError('linkUrl', 'URL must start with https://');
  } else {
    errorElement.classList.remove('show');
    this.classList.remove('error');
  }
});

// Initialize
console.log('Play to Promote - Game mechanics initialized!');
console.log('Ready to accept player registrations.');