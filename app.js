// Game configuration - no upgrades system

// Game Data from JSON
const GAME_DATA = {
  powerUps: [
    { name: "Shield", effect: "Invincible for 5 seconds", color: "#00aaff", duration: 5 },
    { name: "Speed Boost", effect: "2x movement speed", color: "#ffaa00", duration: 10 },
    { name: "Rapid Fire", effect: "No shooting cooldown", color: "#ff3333", duration: 8 },
    { name: "Health Pack", effect: "Restore 50 HP", color: "#00ff88", instant: true }
  ],
  achievements: [
    { id: "first_blood", name: "First Blood", description: "Get your first kill", xp_reward: 100, unlocked: false },
    { id: "portal_master", name: "Portal Master", description: "Get 10 kills through portals", xp_reward: 500, unlocked: false },
    { id: "flawless", name: "Flawless Victory", description: "Win without taking damage", xp_reward: 1000, unlocked: false },
    { id: "sharpshooter", name: "Sharpshooter", description: "90%+ accuracy in a game", xp_reward: 300, unlocked: false }
  ],
  dailyChallenges: [
    { id: "kills_20", task: "Get 20 kills", reward: "500 XP", progress: 0, target: 20 },
    { id: "wins_3", task: "Win 3 games", reward: "Exclusive skin", progress: 0, target: 3 },
    { id: "portals_15", task: "Use portals 15 times", reward: "200 XP", progress: 0, target: 15 }
  ],
  killstreaks: [
    { kills: 3, name: "Killing Spree", bonus: 50 },
    { kills: 5, name: "Dominating", bonus: 100 },
    { kills: 7, name: "Unstoppable", bonus: 200 }
  ],
  playerColors: ["#00ffff", "#ff00ff", "#ffff00", "#00ff00", "#ff6600", "#9966ff", "#ff3366", "#00ffaa"],
  quickChat: ["Nice shot!", "Good game!", "Thanks!", "Oops!", "Let's go!", "Well played!"],
  xpRewards: { kill: 10, portal_kill: 15, assist: 5, win: 100, participation: 20, daily_bonus: 50 }
};



// Player Progression
let playerProgression = {
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  totalKills: 0,
  portalKills: 0,
  achievements: [...GAME_DATA.achievements],
  dailyChallenges: [...GAME_DATA.dailyChallenges],
  coins: 0,
  currentStreak: 0
};

// Session state (not using localStorage due to sandbox restrictions)
let sessionState = {
  hasSeenTutorial: false
};

// Game State Management
let gameState = {
  username: '',
  link: '',
  linkType: '',
  currentPlayers: [],
  gamesPlayed: 0,
  wins: 0,
  clicksReceived: 0,
  currentWinner: null,
  opponentType: 'AI', // 'Real' or 'AI'
  opponentName: '',
  opponentLink: ''
};

// Matchmaking Queue (simulated multiplayer)
let matchmakingQueue = [];
let queueTimeout = null;
let queueStartTime = null;
let queueDuration = 0;

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

function scrollToGame() {
  const gameSection = document.getElementById('game-preview');
  gameSection.scrollIntoView({ behavior: 'smooth' });
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
    gameState.linkType = 'Auto-detected';
    
    // Enter lobby
    enterLobby();
  }
});

// Lobby Functions
function enterLobby() {
  // Go directly to queue instead of old lobby
  enterMatchmakingQueue();
}

function enterMatchmakingQueue() {
  // Update queue view with user data
  document.getElementById('queueUserLink').textContent = gameState.link;
  document.getElementById('queueUserLink').href = gameState.link;
  
  showView('queueView');
  
  // Random timeout between 12-25 seconds
  queueDuration = Math.floor(Math.random() * (25 - 12 + 1)) + 12;
  queueStartTime = Date.now();
  
  // Add player to queue
  matchmakingQueue.push({
    username: gameState.username,
    link: gameState.link,
    timestamp: Date.now()
  });
  
  // Start countdown
  startMatchmakingCountdown();
}

function startMatchmakingCountdown() {
  let remainingTime = queueDuration;
  document.getElementById('queueCountdown').textContent = remainingTime;
  document.getElementById('queueTimeRemaining').textContent = remainingTime;
  document.getElementById('matchType').textContent = 'Searching...';
  
  queueTimeout = setInterval(() => {
    remainingTime--;
    document.getElementById('queueCountdown').textContent = remainingTime;
    document.getElementById('queueTimeRemaining').textContent = remainingTime;
    
    // Check for real opponents (simulate)
    const hasRealOpponent = checkForRealOpponent();
    
    if (hasRealOpponent) {
      clearInterval(queueTimeout);
      matchFoundReal();
      return;
    }
    
    if (remainingTime <= 0) {
      clearInterval(queueTimeout);
      matchFoundAI();
    }
  }, 1000);
}

function checkForRealOpponent() {
  // Simulate checking for real opponents
  // In a real implementation, this would check a shared queue
  // For demo: 20% chance of finding opponent in first 10 seconds
  const elapsed = Math.floor((Date.now() - queueStartTime) / 1000);
  if (elapsed < 10) {
    return Math.random() < 0.02; // 2% chance per second
  }
  return false;
}

function matchFoundReal() {
  // Simulate matching with real opponent
  const opponent = samplePlayers[Math.floor(Math.random() * samplePlayers.length)];
  gameState.opponentType = 'Real';
  gameState.opponentName = opponent.username;
  gameState.opponentLink = opponent.link;
  
  document.getElementById('matchType').textContent = 'Real Opponent!';
  document.getElementById('matchType').style.color = 'var(--neon-green)';
  
  // Show match found message
  document.getElementById('queueCountdown').textContent = '✓';
  document.querySelector('.searching-animation h3').textContent = `Matched with ${opponent.username}!`;
  
  setTimeout(() => {
    showMatchFound();
  }, 2000);
}

function matchFoundAI() {
  // Fallback to AI opponent
  const aiNames = ['CyberBot', 'PixelWarrior', 'NeonGhost', 'QuantumPlayer', 'VoidRunner'];
  const aiName = aiNames[Math.floor(Math.random() * aiNames.length)];
  
  gameState.opponentType = 'AI';
  gameState.opponentName = aiName;
  gameState.opponentLink = 'https://example.com/ai-opponent';
  
  document.getElementById('matchType').textContent = 'AI Opponent';
  document.getElementById('matchType').style.color = 'var(--neon-orange)';
  
  // Show AI match message
  document.getElementById('queueCountdown').textContent = 'AI';
  document.querySelector('.searching-animation h3').textContent = 'Playing vs AI Opponent (system generated)';
  
  setTimeout(() => {
    showMatchFound();
  }, 2000);
}

function cancelMatchmaking() {
  if (queueTimeout) {
    clearInterval(queueTimeout);
  }
  // Remove from queue
  matchmakingQueue = matchmakingQueue.filter(p => p.username !== gameState.username);
  showLandingPage();
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
  cancelMatchmaking();
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

// ===========================
// SPRITE & ASSET LOADING
// ===========================

const ASSETS = {
  player: {
    idle: null,
    attack: null
  },
  enemies: {
    chaser: null,
    ranged: null,
    speedy: null,
    tank: null,
    bomber: null,
    teleporter: null,
    mega_tank: null,
    portal_lord: null,
    spell_master: null
  },
  background: null,
  coverArt: null,
  loaded: false,
  totalAssets: 0,
  loadedAssets: 0
};

function loadAssets(callback) {
  const assetList = [
    { key: 'player.idle', src: 'idle.jpg' },
    { key: 'player.attack', src: 'attack.jpg' },
    { key: 'enemies.chaser', src: 'Chaser.jpg' },
    { key: 'enemies.ranged', src: 'Ranged.jpg' },
    { key: 'enemies.speedy', src: 'Speedy.jpg' },
    { key: 'enemies.tank', src: 'Tank.jpg' },
    { key: 'enemies.bomber', src: 'Bomber.jpg' },
    { key: 'enemies.teleporter', src: 'Teleporter.jpg' },
    { key: 'enemies.mega_tank', src: 'Mega-Tank.jpg' },
    { key: 'enemies.portal_lord', src: 'Portal-Lord.jpg' },
    { key: 'enemies.spell_master', src: 'Spell-Master.jpg' },
    { key: 'background', src: 'Background-Pixel-art.jpg' },
    { key: 'coverArt', src: 'test.jpg' }
  ];
  
  ASSETS.totalAssets = assetList.length;
  ASSETS.loadedAssets = 0;
  
  assetList.forEach(asset => {
    const img = new Image();
    img.onload = () => {
      ASSETS.loadedAssets++;
      const keys = asset.key.split('.');
      if (keys.length === 2) {
        ASSETS[keys[0]][keys[1]] = img;
      } else {
        ASSETS[keys[0]] = img;
      }
      
      if (ASSETS.loadedAssets === ASSETS.totalAssets) {
        ASSETS.loaded = true;
        callback();
      }
    };
    img.onerror = () => {
      console.warn(`Failed to load ${asset.src}, using fallback`);
      ASSETS.loadedAssets++;
      if (ASSETS.loadedAssets === ASSETS.totalAssets) {
        ASSETS.loaded = true;
        callback();
      }
    };
    img.src = asset.src;
  });
}

// ===========================
// PORTAL SHOOTER GAME ENGINE
// ===========================

const GAME_CONFIG = {
  width: 800,
  height: 600,
  fps: 60,
  gameDuration: 300,
  maxPlayers: 6,
  player: {
    maxHealth: 100,
    moveSpeed: 3,
    projectileSpeed: 5,
    shootCooldown: 200,
    portalCooldown: 1500,
    maxPortals: 2,
    size: 20
  },
  powerUp: {
    spawnInterval: 15000,
    maxActive: 3,
    radius: 15
  },
  enemies: {
    chaser: { health: 40, speed: 0.8, damage: 8, points: 10, color: '#ff3333', size: 15 },
    ranged: { health: 35, speed: 0.7, damage: 6, points: 15, color: '#33ff33', size: 14 },
    speedy: { health: 25, speed: 1.2, damage: 5, points: 12, color: '#ffff33', size: 12 },
    tank: { health: 80, speed: 0.5, damage: 12, points: 25, color: '#9933ff', size: 22 },
    bomber: { health: 30, speed: 0.6, damage: 15, points: 18, color: '#ff6600', size: 16 },
    teleporter: { health: 20, speed: 1.0, damage: 4, points: 20, color: '#00ffff', size: 13 },
    mega_tank: { health: 200, speed: 0.4, damage: 20, points: 100, color: '#663399', size: 30 },
    portal_lord: { health: 150, speed: 0.8, damage: 10, points: 150, color: '#00ffaa', size: 26 },
    spell_master: { health: 100, speed: 0.9, damage: 15, points: 120, color: '#0099ff', size: 24 }
  },
  wave: {
    initialEnemies: 1,
    enemiesPerWave: 2,
    waveDelay: 5000,
    maxEnemies: 15
  },
  colors: {
    player: '#00ffff',
    projectile: '#ffaa00',
    portalEntry: '#0088ff',
    portalExit: '#ff6600',
    background: '#0a0a1a'
  },
  multiplayer: {
    botNames: ['Shadow', 'Phoenix', 'Viper', 'Ghost', 'Blaze', 'Nova', 'Storm', 'Frost'],
    botDifficulty: 0.7
  }
};

class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  add(v) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }
  
  subtract(v) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }
  
  multiply(scalar) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }
  
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  
  normalize() {
    const mag = this.magnitude();
    return mag > 0 ? new Vector2(this.x / mag, this.y / mag) : new Vector2(0, 0);
  }
  
  distance(v) {
    return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2);
  }
}

class PowerUp {
  constructor(x, y, type) {
    this.pos = new Vector2(x, y);
    this.type = type;
    const config = GAME_DATA.powerUps.find(p => p.name === type);
    this.color = config.color;
    this.duration = config.duration || 0;
    this.instant = config.instant || false;
    this.radius = GAME_CONFIG.powerUp.radius;
    this.alive = true;
    this.rotation = 0;
    this.pulse = 0;
  }
  
  update() {
    this.rotation += 0.05;
    this.pulse = Math.sin(Date.now() / 200) * 0.3 + 1;
  }
  
  draw(ctx) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.pulse, this.pulse);
    
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.color;
    
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
    
    ctx.globalAlpha = 1;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
    
    ctx.restore();
    ctx.shadowBlur = 0;
  }
}

class MultiplayerBot {
  constructor(x, y, name, color) {
    this.pos = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
    this.name = name;
    this.color = color;
    this.rotation = 0;
    this.health = 100;
    this.maxHealth = 100;
    this.size = 20;
    this.score = 0;
    this.kills = 0;
    this.alive = true;
    this.lastShot = 0;
    this.targetPos = new Vector2(x, y);
    this.retargetTime = Date.now() + Math.random() * 3000;
    this.animState = 'idle';
    this.animFrame = 0;
    this.animTimer = 0;
    this.attackAnimTimer = 0;
    // Bot-specific upgrades
    this.upgrades = {
      projectileSpeed: 1,
      moveSpeed: 1,
      damage: 1,
      active: []
    };
  }
  
  update(players, enemies) {
    if (Date.now() > this.retargetTime) {
      this.targetPos = new Vector2(
        Math.random() * (GAME_CONFIG.width - 100) + 50,
        Math.random() * (GAME_CONFIG.height - 100) + 50
      );
      this.retargetTime = Date.now() + Math.random() * 3000 + 2000;
    }
    
    const dir = this.targetPos.subtract(this.pos).normalize();
    const moveSpeed = GAME_CONFIG.player.moveSpeed * 0.8 * this.upgrades.moveSpeed;
    this.velocity = dir.multiply(moveSpeed);
    this.pos = this.pos.add(this.velocity);
    
    this.pos.x = Math.max(this.size, Math.min(GAME_CONFIG.width - this.size, this.pos.x));
    this.pos.y = Math.max(this.size, Math.min(GAME_CONFIG.height - this.size, this.pos.y));
    
    if (enemies.length > 0) {
      const nearest = enemies.reduce((prev, curr) => 
        this.pos.distance(curr.pos) < this.pos.distance(prev.pos) ? curr : prev
      );
      const dx = nearest.pos.x - this.pos.x;
      const dy = nearest.pos.y - this.pos.y;
      this.rotation = Math.atan2(dy, dx);
    }
  }
  
  canShoot() {
    return Date.now() - this.lastShot >= GAME_CONFIG.player.shootCooldown * 1.5;
  }
  
  shoot() {
    this.lastShot = Date.now();
    this.animState = 'attack';
    this.attackAnimTimer = 20;
    const direction = new Vector2(Math.cos(this.rotation), Math.sin(this.rotation));
    const spawnPos = this.pos.add(direction.multiply(this.size));
    const projectile = new Projectile(spawnPos.x, spawnPos.y, direction, GAME_CONFIG.player.projectileSpeed, 'bot');
    // Apply bot upgrades
    projectile.speed *= this.upgrades.projectileSpeed;
    projectile.damage *= this.upgrades.damage;
    return projectile;
  }
  
  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
    }
  }
  
  draw(ctx) {
    // Update animation
    if (this.attackAnimTimer > 0) {
      this.attackAnimTimer--;
      if (this.attackAnimTimer === 0) {
        this.animState = 'idle';
      }
    }
    
    this.animTimer++;
    if (this.animTimer > 15) {
      this.animFrame = (this.animFrame + 1) % 2;
      this.animTimer = 0;
    }
    
    const sprite = this.animState === 'attack' ? ASSETS.player.attack : ASSETS.player.idle;
    
    if (sprite && ASSETS.loaded) {
      ctx.save();
      ctx.translate(this.pos.x, this.pos.y);
      ctx.rotate(this.rotation);
      
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.color;
      
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = this.color;
      const spriteSize = this.size * 3;
      ctx.fillRect(-spriteSize / 2, -spriteSize / 2, spriteSize, spriteSize);
      ctx.globalCompositeOperation = 'source-over';
      
      ctx.drawImage(
        sprite,
        -spriteSize / 2,
        -spriteSize / 2,
        spriteSize,
        spriteSize
      );
      
      ctx.restore();
      ctx.shadowBlur = 0;
    } else {
      // Fallback
      ctx.save();
      ctx.translate(this.pos.x, this.pos.y);
      ctx.rotate(this.rotation);
      ctx.shadowBlur = 15;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(this.size, 0);
      ctx.lineTo(-this.size * 0.6, -this.size * 0.6);
      ctx.lineTo(-this.size * 0.6, this.size * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.shadowBlur = 0;
    }
    
    ctx.fillStyle = this.color;
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.pos.x, this.pos.y - this.size - 25);
    
    if (this.health < this.maxHealth) {
      const barWidth = this.size * 2;
      const barHeight = 4;
      const healthPercent = this.health / this.maxHealth;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(this.pos.x - barWidth / 2, this.pos.y - this.size - 20, barWidth, barHeight);
      
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(this.pos.x - barWidth / 2, this.pos.y - this.size - 20, barWidth * healthPercent, barHeight);
    }
  }
}

class Particle {
  constructor(x, y, color, velocity, life) {
    this.pos = new Vector2(x, y);
    this.color = color;
    this.velocity = velocity;
    this.life = life;
    this.maxLife = life;
    this.size = Math.random() * 3 + 2;
  }
  
  update() {
    this.pos = this.pos.add(this.velocity);
    this.life--;
    this.velocity = this.velocity.multiply(0.95);
  }
  
  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class Projectile {
  constructor(x, y, direction, speed, owner = 'player') {
    this.pos = new Vector2(x, y);
    this.direction = direction;
    this.speed = speed;
    this.radius = 5;
    this.damage = 25;
    this.alive = true;
    this.life = 120; // 2 seconds at 60fps
    this.owner = owner;
    this.throughPortal = false;
    this.pierceCount = 0;
    this.pierceHits = 0;
    this.bounceCount = 0;
    this.bounces = 0;
  }
  
  update() {
    this.pos = this.pos.add(this.direction.multiply(this.speed));
    this.life--;
    
    if (this.life <= 0) {
      this.alive = false;
      return;
    }
    
    // Bounce mechanics
    if (this.bounceCount > this.bounces) {
      if (this.pos.x < 0 || this.pos.x > GAME_CONFIG.width) {
        this.direction.x *= -1;
        this.bounces++;
        this.pos.x = Math.max(0, Math.min(GAME_CONFIG.width, this.pos.x));
      }
      if (this.pos.y < 0 || this.pos.y > GAME_CONFIG.height) {
        this.direction.y *= -1;
        this.bounces++;
        this.pos.y = Math.max(0, Math.min(GAME_CONFIG.height, this.pos.y));
      }
    } else if (this.pos.x < 0 || this.pos.x > GAME_CONFIG.width ||
               this.pos.y < 0 || this.pos.y > GAME_CONFIG.height) {
      this.alive = false;
    }
  }
  
  draw(ctx) {
    // Trail effect
    for (let i = 0; i < 3; i++) {
      const trailPos = this.pos.subtract(this.direction.multiply(i * 8));
      ctx.globalAlpha = 0.3 - i * 0.1;
      ctx.fillStyle = GAME_CONFIG.colors.projectile;
      ctx.beginPath();
      ctx.arc(trailPos.x, trailPos.y, this.radius - i, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
    ctx.fillStyle = GAME_CONFIG.colors.projectile;
    ctx.shadowBlur = 10;
    ctx.shadowColor = GAME_CONFIG.colors.projectile;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

class Portal {
  constructor(x, y, type) {
    this.pos = new Vector2(x, y);
    this.type = type; // 'entry' or 'exit'
    this.radius = 20;
    this.rotation = 0;
    this.alive = true;
    this.duration = 30000;
    this.createdAt = Date.now();
  }
  
  update() {
    this.rotation += 0.05;
    // Check if portal has expired
    if (Date.now() - this.createdAt > this.duration) {
      this.alive = false;
    }
  }
  
  draw(ctx) {
    const color = this.type === 'entry' ? GAME_CONFIG.colors.portalEntry : GAME_CONFIG.colors.portalExit;
    
    // Outer glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    
    // Swirling effect
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.rotation);
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * this.radius * 0.7;
      const y = Math.sin(angle) * this.radius * 0.7;
      
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
    
    // Main portal circle
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
  }
}

class Enemy {
  constructor(x, y, type) {
    this.pos = new Vector2(x, y);
    this.type = type;
    const config = GAME_CONFIG.enemies[type];
    this.maxHealth = config.health;
    this.health = config.health;
    this.speed = config.speed;
    this.damage = config.damage;
    this.points = config.points;
    this.color = config.color;
    this.size = config.size;
    this.alive = true;
    this.hitFlash = 0;
    this.spriteKey = type;
    this.animFrame = 0;
    this.animTimer = 0;
    this.lastShot = 0;
    this.lastTeleport = 0;
    this.shootCooldown = 3000;
    this.teleportCooldown = 5000;
  }
  
  update(target) {
    // Special behavior for ranged enemies
    if (this.type === 'ranged' || this.type === 'spell_master') {
      const dist = this.pos.distance(target);
      if (dist > 150) {
        const direction = target.subtract(this.pos).normalize();
        this.pos = this.pos.add(direction.multiply(this.speed));
      } else if (dist < 100) {
        const direction = target.subtract(this.pos).normalize();
        this.pos = this.pos.add(direction.multiply(-this.speed * 0.5));
      }
    } else if (this.type === 'teleporter' || this.type === 'portal_lord') {
      const dist = this.pos.distance(target);
      if (dist < 100 && Date.now() - this.lastTeleport > this.teleportCooldown) {
        this.teleport();
      } else {
        const direction = target.subtract(this.pos).normalize();
        this.pos = this.pos.add(direction.multiply(this.speed));
      }
    } else {
      // Default chase behavior
      const direction = target.subtract(this.pos).normalize();
      this.pos = this.pos.add(direction.multiply(this.speed));
    }
    
    if (this.hitFlash > 0) {
      this.hitFlash--;
    }
  }
  
  teleport() {
    this.lastTeleport = Date.now();
    this.pos.x = Math.random() * (GAME_CONFIG.width - 100) + 50;
    this.pos.y = Math.random() * (GAME_CONFIG.height - 100) + 50;
  }
  
  canShoot() {
    return (this.type === 'ranged' || this.type === 'spell_master') && 
           Date.now() - this.lastShot > this.shootCooldown;
  }
  
  shoot(target) {
    this.lastShot = Date.now();
    const direction = target.subtract(this.pos).normalize();
    return new Projectile(this.pos.x, this.pos.y, direction, 3, 'enemy');
  }
  
  takeDamage(amount) {
    this.health -= amount;
    this.hitFlash = 10;
    if (this.health <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }
  
  draw(ctx) {
    this.animTimer++;
    if (this.animTimer > 10) {
      this.animFrame = (this.animFrame + 1) % 2;
      this.animTimer = 0;
    }
    
    const sprite = ASSETS.enemies[this.spriteKey];
    
    if (sprite && ASSETS.loaded) {
      ctx.save();
      
      if (this.hitFlash > 0) {
        ctx.globalAlpha = 0.5 + Math.sin(this.hitFlash * 0.5) * 0.5;
      }
      
      const spriteSize = this.size * 2.5;
      ctx.drawImage(
        sprite,
        this.pos.x - spriteSize / 2,
        this.pos.y - spriteSize / 2,
        spriteSize,
        spriteSize
      );
      
      ctx.restore();
    } else {
      // Fallback to triangle
      const flashColor = this.hitFlash > 0 ? '#ffffff' : this.color;
      ctx.fillStyle = flashColor;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.save();
      ctx.translate(this.pos.x, this.pos.y);
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.lineTo(-this.size * 0.8, this.size * 0.6);
      ctx.lineTo(this.size * 0.8, this.size * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.shadowBlur = 0;
    }
    
    // Health bar
    if (this.health < this.maxHealth) {
      const barWidth = this.size * 2;
      const barHeight = 4;
      const healthPercent = this.health / this.maxHealth;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(this.pos.x - barWidth / 2, this.pos.y - this.size - 15, barWidth, barHeight);
      
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(this.pos.x - barWidth / 2, this.pos.y - this.size - 15, barWidth * healthPercent, barHeight);
    }
  }
}

class Player {
  constructor(x, y) {
    this.pos = new Vector2(x, y);
    this.velocity = new Vector2(0, 0);
    this.rotation = 0;
    this.maxHealth = GAME_CONFIG.player.maxHealth;
    this.health = this.maxHealth;
    this.size = GAME_CONFIG.player.size;
    this.lastShot = 0;
    this.lastPortal = 0;
    this.alive = true;
    this.animState = 'idle';
    this.animFrame = 0;
    this.animTimer = 0;
    this.attackAnimTimer = 0;
  }
  
  update(input, mousePos) {
    // Movement
    const moveDir = new Vector2(0, 0);
    if (input.w || input.arrowup) moveDir.y -= 1;
    if (input.s || input.arrowdown) moveDir.y += 1;
    if (input.a || input.arrowleft) moveDir.x -= 1;
    if (input.d || input.arrowright) moveDir.x += 1;
    
    if (moveDir.x !== 0 || moveDir.y !== 0) {
      this.velocity = moveDir.normalize().multiply(GAME_CONFIG.player.moveSpeed);
    } else {
      this.velocity = this.velocity.multiply(0.8);
    }
    
    this.pos = this.pos.add(this.velocity);
    
    // Boundary collision
    this.pos.x = Math.max(this.size, Math.min(GAME_CONFIG.width - this.size, this.pos.x));
    this.pos.y = Math.max(this.size, Math.min(GAME_CONFIG.height - this.size, this.pos.y));
    
    // Rotation towards mouse
    const dx = mousePos.x - this.pos.x;
    const dy = mousePos.y - this.pos.y;
    this.rotation = Math.atan2(dy, dx);
  }
  
  canShoot() {
    const cooldown = GAME_CONFIG.player.shootCooldown * playerUpgrades.stats.shootCooldown;
    return Date.now() - this.lastShot >= cooldown;
  }
  
  canPlacePortal() {
    const maxPortals = Math.min(playerUpgrades.stats.maxPortals, 4); // Cap at 4
    const currentPortals = (this.portals && this.portals.entry ? 1 : 0) + (this.portals && this.portals.exit ? 1 : 0);
    return Date.now() - this.lastPortal >= GAME_CONFIG.player.portalCooldown;
  }
  
  shoot() {
    this.lastShot = Date.now();
    this.animState = 'attack';
    this.attackAnimTimer = 20;
    const direction = new Vector2(Math.cos(this.rotation), Math.sin(this.rotation));
    const spawnPos = this.pos.add(direction.multiply(this.size));
    return new Projectile(spawnPos.x, spawnPos.y, direction, GAME_CONFIG.player.projectileSpeed);
  }
  
  placePortal(x, y, type) {
    this.lastPortal = Date.now();
    const portal = new Portal(x, y, type);
    // Apply portal duration upgrade
    portal.duration = 30000 + (playerUpgrades.stats.portalDuration * 1000); // Base 30s + upgrades
    portal.createdAt = Date.now();
    return portal;
  }
  
  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
    }
  }
  
  draw(ctx) {
    // Update animation
    if (this.attackAnimTimer > 0) {
      this.attackAnimTimer--;
      if (this.attackAnimTimer === 0) {
        this.animState = 'idle';
      }
    }
    
    this.animTimer++;
    if (this.animTimer > 15) {
      this.animFrame = (this.animFrame + 1) % 2;
      this.animTimer = 0;
    }
    
    const sprite = this.animState === 'attack' ? ASSETS.player.attack : ASSETS.player.idle;
    
    if (sprite && ASSETS.loaded) {
      ctx.save();
      ctx.translate(this.pos.x, this.pos.y);
      ctx.rotate(this.rotation);
      
      ctx.shadowBlur = 15;
      ctx.shadowColor = GAME_CONFIG.colors.player;
      
      const spriteSize = this.size * 3;
      ctx.drawImage(
        sprite,
        -spriteSize / 2,
        -spriteSize / 2,
        spriteSize,
        spriteSize
      );
      
      ctx.restore();
      ctx.shadowBlur = 0;
    } else {
      // Fallback to triangle
      ctx.save();
      ctx.translate(this.pos.x, this.pos.y);
      ctx.rotate(this.rotation);
      ctx.shadowBlur = 15;
      ctx.shadowColor = GAME_CONFIG.colors.player;
      ctx.fillStyle = GAME_CONFIG.colors.player;
      ctx.beginPath();
      ctx.moveTo(this.size, 0);
      ctx.lineTo(-this.size * 0.6, -this.size * 0.6);
      ctx.lineTo(-this.size * 0.6, this.size * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.shadowBlur = 0;
    }
  }
}

class PortalShooterGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.miniMapCanvas = document.getElementById('miniMapCanvas');
    this.miniMapCtx = this.miniMapCanvas.getContext('2d');
    this.running = false;
    this.paused = false;
    
    this.player = new Player(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2);
    this.bots = [];
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.portals = { entry: null, exit: null };
    this.powerUps = [];
    this.activePowerUp = null;
    this.powerUpEndTime = 0;
    
    this.score = 0;
    this.kills = 0;
    this.wave = 1;
    this.gameTime = GAME_CONFIG.gameDuration;
    this.startTime = Date.now();
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.portalKills = 0;
    this.currentKillstreak = 0;
    this.damageTaken = 0;
    this.killFeedItems = [];
    this.chatMessages = [];
    this.waveTransition = false;
    this.waveAnnouncementTime = 0;
    
    this.input = {};
    this.mousePos = new Vector2(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2);
    this.lastFrameTime = 0;
    this.fps = 60;
    this.lastPowerUpSpawn = Date.now();
    
    this.setupInput();
    this.setupMultiplayer();
    this.setupQuickChat();
    this.setupChallenges();
    this.setupUpgradesUI();
    this.spawnWave();
  }
  
  setupMultiplayer() {
    const numBots = Math.floor(Math.random() * 3) + 3;
    const usedColors = [GAME_CONFIG.colors.player];
    
    for (let i = 0; i < numBots; i++) {
      const color = GAME_DATA.playerColors.filter(c => !usedColors.includes(c))[i % 7];
      usedColors.push(color);
      const name = GAME_CONFIG.multiplayer.botNames[i];
      const x = Math.random() * (GAME_CONFIG.width - 100) + 50;
      const y = Math.random() * (GAME_CONFIG.height - 100) + 50;
      this.bots.push(new MultiplayerBot(x, y, name, color));
    }
    
    document.getElementById('hudPlayerName').textContent = gameState.username;
    document.getElementById('playerLevelBadge').textContent = `Lv.${playerProgression.level}`;
    this.updatePlayersList();
  }
  
  setupQuickChat() {
    const quickChatDiv = document.getElementById('quickChatOptions');
    GAME_DATA.quickChat.forEach(msg => {
      const btn = document.createElement('button');
      btn.className = 'quick-chat-btn';
      btn.textContent = msg;
      btn.onclick = () => this.sendQuickChat(msg);
      quickChatDiv.appendChild(btn);
    });
  }
  
  showWaveAnnouncement() {
    this.waveAnnouncementTime = Date.now() + 3000;
    this.addChatMessage('System', `Wave ${this.wave} incoming!`, '#ffaa00');
  }
  
  setupChallenges() {
    const challengesDiv = document.getElementById('challengesContent');
    playerProgression.dailyChallenges.forEach(challenge => {
      const div = document.createElement('div');
      div.className = 'challenge-item';
      div.id = `challenge-${challenge.id}`;
      div.innerHTML = `
        <div class="challenge-task">${challenge.task}</div>
        <div class="challenge-progress">
          <div class="challenge-progress-bar">
            <div class="challenge-progress-fill" id="progress-${challenge.id}" style="width: 0%;"></div>
          </div>
          <span class="challenge-progress-text" id="progress-text-${challenge.id}">0/${challenge.target}</span>
        </div>
        <div class="challenge-reward">Reward: ${challenge.reward}</div>
      `;
      challengesDiv.appendChild(div);
    });
  }
  
  sendQuickChat(message) {
    this.addChatMessage(gameState.username, message, GAME_CONFIG.colors.player);
    document.getElementById('quickChat').style.display = 'none';
    
    setTimeout(() => {
      const botIndex = Math.floor(Math.random() * this.bots.length);
      if (this.bots[botIndex]) {
        const response = GAME_DATA.quickChat[Math.floor(Math.random() * GAME_DATA.quickChat.length)];
        this.addChatMessage(this.bots[botIndex].name, response, this.bots[botIndex].color);
      }
    }, 1000 + Math.random() * 2000);
  }
  
  addChatMessage(sender, message, color) {
    const chatDiv = document.getElementById('chatMessages');
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = `<span class="chat-bubble-sender" style="color: ${color};">${sender}:</span>${message}`;
    chatDiv.appendChild(bubble);
    this.chatMessages.push({ time: Date.now(), element: bubble });
    
    setTimeout(() => {
      bubble.remove();
    }, 5000);
    
    if (chatDiv.children.length > 5) {
      chatDiv.removeChild(chatDiv.firstChild);
    }
  }
  
  addKillFeedItem(killer, victim, isPortalKill = false, isPlayer = false) {
    const killFeed = document.getElementById('killFeed');
    const item = document.createElement('div');
    item.className = 'kill-feed-item';
    if (isPlayer) item.classList.add('player-kill');
    if (isPortalKill) item.classList.add('portal-kill');
    
    const method = isPortalKill ? 'portal-killed' : 'eliminated';
    item.textContent = `${killer} ${method} ${victim}`;
    killFeed.appendChild(item);
    
    setTimeout(() => {
      item.remove();
    }, 5000);
    
    if (killFeed.children.length > 6) {
      killFeed.removeChild(killFeed.firstChild);
    }
  }
  
  updatePlayersList() {
    const playersDiv = document.getElementById('playersListContent');
    playersDiv.innerHTML = '';
    
    const allPlayers = [
      { name: gameState.username, score: this.score, color: GAME_CONFIG.colors.player, isPlayer: true },
      ...this.bots.map(bot => ({ name: bot.name, score: bot.score, color: bot.color, isPlayer: false }))
    ];
    
    allPlayers.sort((a, b) => b.score - a.score);
    
    allPlayers.forEach(player => {
      const div = document.createElement('div');
      div.className = 'player-list-item';
      div.style.borderLeftColor = player.color;
      if (player.isPlayer) div.style.backgroundColor = 'rgba(0, 255, 255, 0.1)';
      div.innerHTML = `
        <span class="player-list-name">${player.name}</span>
        <span class="player-list-score">${player.score}</span>
      `;
      playersDiv.appendChild(div);
    });
  }
  
  setupInput() {
    document.addEventListener('keydown', (e) => {
      this.input[e.key.toLowerCase()] = true;
      
      if (e.key === ' ' && this.player.canShoot() && !this.paused) {
        e.preventDefault();
        this.playerShoot();
      }
      
      if (e.key.toLowerCase() === 'p' && this.player.canPlacePortal() && !this.paused) {
        this.placePortal();
      }
      
      if (e.key.toLowerCase() === 'c') {
        const quickChat = document.getElementById('quickChat');
        quickChat.style.display = quickChat.style.display === 'none' ? 'block' : 'none';
      }
      
      if (e.key === 'h' || e.key === 'H') {
        const tutorialOverlay = document.getElementById('tutorialOverlay');
        if (tutorialOverlay.style.display === 'flex') {
          // Close tutorial if open
          closeTutorial();
        } else {
          // Show tutorial
          showTutorialWithAnyInput();
        }
      }
      
      if (e.key === 'Escape') {
        this.paused = !this.paused;
      }
    });
    
    document.addEventListener('keyup', (e) => {
      this.input[e.key.toLowerCase()] = false;
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
    });
    
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0 && this.player.canShoot() && !this.paused) {
        this.playerShoot();
      }
      if (e.button === 2 && this.player.canPlacePortal() && !this.paused) {
        e.preventDefault();
        this.placePortal();
      }
    });
    
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  
  playerShoot() {
    if (this.activePowerUp === 'Rapid Fire') {
      this.player.lastShot = Date.now() - GAME_CONFIG.player.shootCooldown;
    }
    
    const projectile = this.player.shoot();
    this.projectiles.push(projectile);
    this.shotsFired++;
    
    // Muzzle flash particles
    for (let i = 0; i < 5; i++) {
      const angle = this.player.rotation + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 2 + 1;
      const vel = new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed);
      this.particles.push(
        new Particle(projectile.pos.x, projectile.pos.y, GAME_CONFIG.colors.projectile, vel, 20)
      );
    }
  }
  
  placePortal() {
    const rect = this.canvas.getBoundingClientRect();
    const maxPortals = 2;
    
    // For 2 portals (default)
    if (maxPortals === 2) {
      if (!this.portals.entry) {
        this.portals.entry = this.player.placePortal(this.mousePos.x, this.mousePos.y, 'entry');
        this.createPortalParticles(this.mousePos, GAME_CONFIG.colors.portalEntry);
      } else if (!this.portals.exit) {
        this.portals.exit = this.player.placePortal(this.mousePos.x, this.mousePos.y, 'exit');
        this.createPortalParticles(this.mousePos, GAME_CONFIG.colors.portalExit);
      } else {
        // Replace entry portal
        this.portals.entry = this.player.placePortal(this.mousePos.x, this.mousePos.y, 'entry');
        this.portals.exit = null;
        this.createPortalParticles(this.mousePos, GAME_CONFIG.colors.portalEntry);
      }
    } else {
      // For 3+ portals, cycle through entry->exit->replace oldest
      if (!this.portals.entry) {
        this.portals.entry = this.player.placePortal(this.mousePos.x, this.mousePos.y, 'entry');
        this.createPortalParticles(this.mousePos, GAME_CONFIG.colors.portalEntry);
      } else if (!this.portals.exit) {
        this.portals.exit = this.player.placePortal(this.mousePos.x, this.mousePos.y, 'exit');
        this.createPortalParticles(this.mousePos, GAME_CONFIG.colors.portalExit);
      } else {
        // Replace the older portal
        if (this.portals.entry.createdAt < this.portals.exit.createdAt) {
          this.portals.entry = this.player.placePortal(this.mousePos.x, this.mousePos.y, 'entry');
          this.createPortalParticles(this.mousePos, GAME_CONFIG.colors.portalEntry);
        } else {
          this.portals.exit = this.player.placePortal(this.mousePos.x, this.mousePos.y, 'exit');
          this.createPortalParticles(this.mousePos, GAME_CONFIG.colors.portalExit);
        }
      }
    }
    
    this.updateChallengeProgress('portals_15');
    this.updateHUD();
  }
  
  createPortalParticles(pos, color) {
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const speed = Math.random() * 3 + 2;
      const vel = new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed);
      this.particles.push(new Particle(pos.x, pos.y, color, vel, 30));
    }
  }
  
  spawnPowerUp() {
    if (this.powerUps.length >= GAME_CONFIG.powerUp.maxActive) return;
    
    const types = GAME_DATA.powerUps.map(p => p.name);
    const type = types[Math.floor(Math.random() * types.length)];
    const x = Math.random() * (GAME_CONFIG.width - 100) + 50;
    const y = Math.random() * (GAME_CONFIG.height - 100) + 50;
    
    this.powerUps.push(new PowerUp(x, y, type));
  }
  
  activatePowerUp(powerUp) {
    this.activePowerUp = powerUp.type;
    
    if (powerUp.instant) {
      if (powerUp.type === 'Health Pack') {
        this.player.health = Math.min(this.player.maxHealth, this.player.health + 50);
      }
      this.activePowerUp = null;
    } else {
      this.powerUpEndTime = Date.now() + powerUp.duration * 1000;
      document.getElementById('powerUpIndicator').style.display = 'block';
      document.getElementById('powerUpName').textContent = powerUp.type;
    }
    
    this.addChatMessage('System', `${gameState.username} collected ${powerUp.type}!`, '#ffaa00');
  }
  
  checkPowerUpExpiry() {
    if (this.activePowerUp && Date.now() >= this.powerUpEndTime) {
      this.activePowerUp = null;
      document.getElementById('powerUpIndicator').style.display = 'none';
    }
    
    if (this.activePowerUp) {
      const remaining = Math.ceil((this.powerUpEndTime - Date.now()) / 1000);
      document.getElementById('powerUpTimer').textContent = `${remaining}s`;
    }
  }
  
  addXP(amount, source = '') {
    playerProgression.xp += amount;
    
    if (playerProgression.xp >= playerProgression.xpToNextLevel) {
      this.levelUp();
    }
    
    this.updateXPBar();
  }
  
  levelUp() {
    const oldLevel = playerProgression.level;
    playerProgression.level++;
    playerProgression.xp -= playerProgression.xpToNextLevel;
    playerProgression.xpToNextLevel = Math.floor(playerProgression.xpToNextLevel * 1.5);
    playerProgression.coins += 50;
    
    document.getElementById('oldLevel').textContent = oldLevel;
    document.getElementById('newLevel').textContent = playerProgression.level;
    document.getElementById('levelupRewards').textContent = `+50 Portal Coins`;
    document.getElementById('playerLevelBadge').textContent = `Lv.${playerProgression.level}`;
    
    const popup = document.getElementById('levelupPopup');
    popup.style.display = 'flex';
    
    setTimeout(() => {
      popup.style.display = 'none';
    }, 3000);
  }
  
  updateXPBar() {
    const percent = (playerProgression.xp / playerProgression.xpToNextLevel) * 100;
    document.getElementById('xpBar').style.width = `${percent}%`;
    document.getElementById('xpText').textContent = `${playerProgression.xp} / ${playerProgression.xpToNextLevel} XP`;
  }
  
  checkAchievement(achievementId) {
    const achievement = playerProgression.achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      this.showAchievement(achievement);
      this.addXP(achievement.xp_reward);
    }
  }
  
  showAchievement(achievement) {
    document.getElementById('achievementTitle').textContent = achievement.name;
    document.getElementById('achievementDescription').textContent = achievement.description;
    document.getElementById('achievementXP').textContent = achievement.xp_reward;
    
    const popup = document.getElementById('achievementPopup');
    popup.style.display = 'block';
    
    setTimeout(() => {
      popup.style.display = 'none';
    }, 5000);
  }
  
  checkKillstreak() {
    const streak = GAME_DATA.killstreaks.find(s => s.kills === this.currentKillstreak);
    if (streak) {
      document.getElementById('killstreakText').textContent = streak.name.toUpperCase() + '!';
      const announcement = document.getElementById('killstreakAnnouncement');
      announcement.style.display = 'block';
      this.score += streak.bonus;
      this.addXP(streak.bonus / 2);
      
      setTimeout(() => {
        announcement.style.display = 'none';
      }, 2000);
      
      this.addChatMessage('System', `${gameState.username} is on a ${streak.name}!`, '#ff3333');
    }
  }
  
  updateChallengeProgress(challengeId, amount = 1) {
    const challenge = playerProgression.dailyChallenges.find(c => c.id === challengeId);
    if (challenge && challenge.progress < challenge.target) {
      challenge.progress = Math.min(challenge.progress + amount, challenge.target);
      const percent = (challenge.progress / challenge.target) * 100;
      document.getElementById(`progress-${challengeId}`).style.width = `${percent}%`;
      document.getElementById(`progress-text-${challengeId}`).textContent = `${challenge.progress}/${challenge.target}`;
      
      if (challenge.progress >= challenge.target) {
        this.addChatMessage('System', `Challenge completed: ${challenge.task}!`, '#00ff88');
      }
    }
  }
  
  spawnWave() {
    const enemyCount = Math.min(
      GAME_CONFIG.wave.initialEnemies + (this.wave - 1) * GAME_CONFIG.wave.enemiesPerWave,
      GAME_CONFIG.wave.maxEnemies
    );
    
    const types = ['chaser', 'ranged', 'speedy', 'tank', 'bomber', 'teleporter'];
    const bossTypes = ['mega_tank', 'portal_lord', 'spell_master'];
    
    for (let i = 0; i < enemyCount; i++) {
      setTimeout(() => {
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(edge) {
          case 0: x = Math.random() * GAME_CONFIG.width; y = -20; break;
          case 1: x = GAME_CONFIG.width + 20; y = Math.random() * GAME_CONFIG.height; break;
          case 2: x = Math.random() * GAME_CONFIG.width; y = GAME_CONFIG.height + 20; break;
          case 3: x = -20; y = Math.random() * GAME_CONFIG.height; break;
        }
        
        let type;
        if (this.wave >= 5 && i === 0 && Math.random() < 0.3) {
          type = bossTypes[Math.floor(Math.random() * bossTypes.length)];
        } else if (this.wave === 1) {
          type = 'chaser';
        } else if (this.wave === 2) {
          type = i % 2 === 0 ? 'chaser' : 'ranged';
        } else if (this.wave === 3) {
          type = i < 2 ? 'chaser' : 'ranged';
        } else if (this.wave === 4) {
          const wave4Types = ['chaser', 'speedy', 'tank'];
          type = wave4Types[i % wave4Types.length];
        } else {
          const availableTypes = types.slice(0, Math.min(types.length, 2 + this.wave));
          type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        }
        
        this.enemies.push(new Enemy(x, y, type));
      }, i * 500);
    }
  }
  
  checkCollisions() {
    // Player Power-up collisions
    for (let powerUp of this.powerUps) {
      if (!powerUp.alive) continue;
      const dist = this.player.pos.distance(powerUp.pos);
      if (dist < this.player.size + powerUp.radius) {
        powerUp.alive = false;
        this.activatePowerUp(powerUp);
      }
    }
    
    // Projectile-Enemy collisions
    for (let proj of this.projectiles) {
      if (!proj.alive) continue;
      
      // Enemy projectiles hit player/bots
      if (proj.owner === 'enemy') {
        const dist = proj.pos.distance(this.player.pos);
        if (dist < proj.radius + this.player.size) {
          proj.alive = false;
          if (!this.activePowerUp || this.activePowerUp !== 'Shield') {
            this.player.takeDamage(proj.damage);
            this.damageTaken += proj.damage;
            this.currentKillstreak = 0;
          }
        }
        
        for (let bot of this.bots) {
          if (!bot.alive) continue;
          const botDist = proj.pos.distance(bot.pos);
          if (botDist < proj.radius + bot.size) {
            proj.alive = false;
            bot.takeDamage(proj.damage);
          }
        }
        continue;
      }
      
      for (let enemy of this.enemies) {
        if (!enemy.alive) continue;
        
        const dist = proj.pos.distance(enemy.pos);
        if (dist < proj.radius + enemy.size) {
          // Pierce mechanic - don't destroy projectile if it can still pierce
          const canPierce = proj.pierceCount > proj.pierceHits;
          if (!canPierce) {
            proj.alive = false;
          } else {
            proj.pierceHits++;
          }
          
          const isPlayerShot = proj.owner === 'player';
          
          if (isPlayerShot) {
            this.shotsHit++;
          }
          
          if (enemy.takeDamage(proj.damage)) {
            if (isPlayerShot) {
              this.kills++;
              this.currentKillstreak++;
              this.score += enemy.points;
              this.addXP(GAME_DATA.xpRewards.kill);
              
              if (proj.throughPortal) {
                this.score += 5;
                this.portalKills++;
                this.addXP(GAME_DATA.xpRewards.portal_kill);
                this.addKillFeedItem(gameState.username, 'Enemy', true, true);
                this.updateChallengeProgress('portals_15');
                
                if (this.portalKills >= 10) {
                  this.checkAchievement('portal_master');
                }
              } else {
                this.addKillFeedItem(gameState.username, 'Enemy', false, true);
              }
              
              if (this.kills === 1) {
                this.checkAchievement('first_blood');
              }
              
              this.checkKillstreak();
              this.updateChallengeProgress('kills_20');
            } else {
              const bot = this.bots.find(b => b.alive);
              if (bot) {
                bot.score += enemy.points;
                bot.kills++;
                this.addKillFeedItem(bot.name, 'Enemy', false, false);
              }
            }
            this.createExplosion(enemy.pos, enemy.color);
          }
        }
      }
    }
    
    // Player-Enemy collisions
    if (!this.activePowerUp || this.activePowerUp !== 'Shield') {
      for (let enemy of this.enemies) {
        if (!enemy.alive) continue;
        
        const dist = this.player.pos.distance(enemy.pos);
        if (dist < this.player.size + enemy.size) {
          this.player.takeDamage(enemy.damage / 60);
          this.damageTaken += enemy.damage / 60;
          this.currentKillstreak = 0;
        }
      }
    }
    
    // Bot-Enemy collisions
    for (let bot of this.bots) {
      if (!bot.alive) continue;
      for (let enemy of this.enemies) {
        if (!enemy.alive) continue;
        const dist = bot.pos.distance(enemy.pos);
        if (dist < bot.size + enemy.size) {
          bot.takeDamage(enemy.damage / 60);
        }
      }
    }
    
    // Projectile-Portal collisions
    if (this.portals.entry && this.portals.exit) {
      for (let proj of this.projectiles) {
        if (!proj.alive || proj.throughPortal) continue;
        
        const distEntry = proj.pos.distance(this.portals.entry.pos);
        if (distEntry < this.portals.entry.radius) {
          proj.pos.x = this.portals.exit.pos.x;
          proj.pos.y = this.portals.exit.pos.y;
          proj.throughPortal = true;
          this.createPortalParticles(this.portals.exit.pos, GAME_CONFIG.colors.portalExit);
        }
      }
    }
  }
  
  createExplosion(pos, color) {
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      const vel = new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed);
      this.particles.push(new Particle(pos.x, pos.y, color, vel, 40));
    }
  }
  
  update() {
    if (this.paused) return;
    
    // Update game timer
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    this.gameTime = Math.max(0, GAME_CONFIG.gameDuration - elapsed);
    
    if (this.gameTime <= 0) {
      this.gameOver();
      return;
    }
    
    // Spawn power-ups
    if (Date.now() - this.lastPowerUpSpawn > GAME_CONFIG.powerUp.spawnInterval) {
      this.spawnPowerUp();
      this.lastPowerUpSpawn = Date.now();
    }
    
    // Update player with power-up boost
    let moveSpeed = GAME_CONFIG.player.moveSpeed;
    if (this.activePowerUp === 'Speed Boost') {
      moveSpeed *= 2;
    }
    const originalSpeed = GAME_CONFIG.player.moveSpeed;
    GAME_CONFIG.player.moveSpeed = moveSpeed;
    this.player.update(this.input, this.mousePos);
    GAME_CONFIG.player.moveSpeed = originalSpeed;
    
    // Update bots
    for (let bot of this.bots) {
      if (bot.alive) {
        bot.update(this.bots, this.enemies);
        
        if (this.enemies.length > 0 && bot.canShoot() && Math.random() < 0.02) {
          this.projectiles.push(bot.shoot());
        }
      }
    }
    
    // Update enemies
    for (let enemy of this.enemies) {
      if (enemy.alive) {
        const target = Math.random() < 0.5 ? this.player.pos : 
          (this.bots.length > 0 ? this.bots[Math.floor(Math.random() * this.bots.length)].pos : this.player.pos);
        enemy.update(target);
        
        // Ranged enemies shoot
        if (enemy.canShoot() && Math.random() < 0.02) {
          const dist = enemy.pos.distance(target);
          if (dist < 300 && dist > 100) {
            this.projectiles.push(enemy.shoot(target));
          }
        }
      }
    }
    
    // Update projectiles
    for (let proj of this.projectiles) {
      if (proj.alive) {
        proj.update();
      }
    }
    
    // Update power-ups
    for (let powerUp of this.powerUps) {
      if (powerUp.alive) {
        powerUp.update();
      }
    }
    
    // Update portals
    if (this.portals.entry) {
      this.portals.entry.update();
      if (!this.portals.entry.alive) {
        this.portals.entry = null;
      }
    }
    if (this.portals.exit) {
      this.portals.exit.update();
      if (!this.portals.exit.alive) {
        this.portals.exit = null;
      }
    }
    
    // Update particles
    for (let particle of this.particles) {
      particle.update();
    }
    
    // Remove dead entities
    this.enemies = this.enemies.filter(e => e.alive);
    this.projectiles = this.projectiles.filter(p => p.alive);
    this.particles = this.particles.filter(p => p.life > 0);
    this.powerUps = this.powerUps.filter(p => p.alive);
    
    // Check collisions
    this.checkCollisions();
    
    // Check power-up expiry
    this.checkPowerUpExpiry();
    
    // Check for wave completion
    if (this.enemies.length === 0 && !this.waveTransition) {
      this.waveTransition = true;
      this.wave++;
      this.score += 50;
      this.addXP(25);
      this.showWaveAnnouncement();
      
      setTimeout(() => {
        this.waveTransition = false;
        this.spawnWave();
      }, 3000);
    }
    
    // Update bot scores
    this.bots.forEach(bot => {
      if (Math.random() < 0.001) {
        bot.score += Math.floor(Math.random() * 5);
      }
    });
    
    this.updatePlayersList();
    
    // Check game over
    if (!this.player.alive) {
      this.gameOver();
    }
    
    this.updateHUD();
  }
  
  updateHUD() {
    document.getElementById('healthBar').style.width = (this.player.health / this.player.maxHealth * 100) + '%';
    document.getElementById('healthText').textContent = Math.ceil(this.player.health);
    
    const healthBar = document.getElementById('healthBar');
    healthBar.className = 'health-bar';
    if (this.player.health < 50) healthBar.classList.add('medium');
    if (this.player.health < 25) healthBar.classList.add('low');
    
    document.getElementById('scoreDisplay').textContent = this.score;
    document.getElementById('killsDisplay').textContent = this.kills;
    document.getElementById('waveDisplay').textContent = this.wave;
    
    const maxPortals = 2;
    const portalCount = (this.portals.entry ? 1 : 0) + (this.portals.exit ? 1 : 0);
    document.getElementById('portalsDisplay').textContent = `${maxPortals - portalCount}/${maxPortals}`;
    
    const minutes = Math.floor(this.gameTime / 60);
    const seconds = this.gameTime % 60;
    document.getElementById('timeDisplay').textContent = 
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  drawMiniMap() {
    const scale = 150 / GAME_CONFIG.width;
    this.miniMapCtx.fillStyle = 'rgba(10, 10, 26, 0.9)';
    this.miniMapCtx.fillRect(0, 0, 150, 150);
    
    this.miniMapCtx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
    this.miniMapCtx.lineWidth = 1;
    for (let x = 0; x < 150; x += 30) {
      this.miniMapCtx.beginPath();
      this.miniMapCtx.moveTo(x, 0);
      this.miniMapCtx.lineTo(x, 150);
      this.miniMapCtx.stroke();
    }
    for (let y = 0; y < 150; y += 30) {
      this.miniMapCtx.beginPath();
      this.miniMapCtx.moveTo(0, y);
      this.miniMapCtx.lineTo(150, y);
      this.miniMapCtx.stroke();
    }
    
    this.miniMapCtx.fillStyle = GAME_CONFIG.colors.player;
    this.miniMapCtx.beginPath();
    this.miniMapCtx.arc(this.player.pos.x * scale, this.player.pos.y * scale, 3, 0, Math.PI * 2);
    this.miniMapCtx.fill();
    
    this.bots.forEach(bot => {
      if (bot.alive) {
        this.miniMapCtx.fillStyle = bot.color;
        this.miniMapCtx.beginPath();
        this.miniMapCtx.arc(bot.pos.x * scale, bot.pos.y * scale, 2, 0, Math.PI * 2);
        this.miniMapCtx.fill();
      }
    });
    
    this.enemies.forEach(enemy => {
      if (enemy.alive) {
        this.miniMapCtx.fillStyle = enemy.color;
        this.miniMapCtx.globalAlpha = 0.6;
        this.miniMapCtx.beginPath();
        this.miniMapCtx.arc(enemy.pos.x * scale, enemy.pos.y * scale, 1.5, 0, Math.PI * 2);
        this.miniMapCtx.fill();
        this.miniMapCtx.globalAlpha = 1;
      }
    });
    
    if (this.portals.entry) {
      this.miniMapCtx.fillStyle = GAME_CONFIG.colors.portalEntry;
      this.miniMapCtx.beginPath();
      this.miniMapCtx.arc(this.portals.entry.pos.x * scale, this.portals.entry.pos.y * scale, 2, 0, Math.PI * 2);
      this.miniMapCtx.fill();
    }
    if (this.portals.exit) {
      this.miniMapCtx.fillStyle = GAME_CONFIG.colors.portalExit;
      this.miniMapCtx.beginPath();
      this.miniMapCtx.arc(this.portals.exit.pos.x * scale, this.portals.exit.pos.y * scale, 2, 0, Math.PI * 2);
      this.miniMapCtx.fill();
    }
  }
  
  draw() {
    // Draw background
    if (ASSETS.background && ASSETS.loaded) {
      this.ctx.drawImage(ASSETS.background, 0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
    } else {
      // Fallback background
      this.ctx.fillStyle = GAME_CONFIG.colors.background;
      this.ctx.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
      
      // Draw star background
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      for (let i = 0; i < 100; i++) {
        const x = (i * 117) % GAME_CONFIG.width;
        const y = (i * 239) % GAME_CONFIG.height;
        this.ctx.fillRect(x, y, 1, 1);
      }
      
      // Draw grid
      this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
      this.ctx.lineWidth = 1;
      for (let x = 0; x < GAME_CONFIG.width; x += 50) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, GAME_CONFIG.height);
        this.ctx.stroke();
      }
      for (let y = 0; y < GAME_CONFIG.height; y += 50) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(GAME_CONFIG.width, y);
        this.ctx.stroke();
      }
    }
    
    // Draw power-ups
    for (let powerUp of this.powerUps) {
      if (powerUp.alive) powerUp.draw(this.ctx);
    }
    
    // Draw portals
    if (this.portals.entry) this.portals.entry.draw(this.ctx);
    if (this.portals.exit) this.portals.exit.draw(this.ctx);
    
    // Draw particles
    for (let particle of this.particles) {
      particle.draw(this.ctx);
    }
    
    // Draw projectiles
    for (let proj of this.projectiles) {
      if (proj.alive) proj.draw(this.ctx);
    }
    
    // Draw enemies
    for (let enemy of this.enemies) {
      if (enemy.alive) enemy.draw(this.ctx);
    }
    
    // Draw bots
    for (let bot of this.bots) {
      if (bot.alive) bot.draw(this.ctx);
    }
    
    // Draw player
    if (this.player.alive) {
      this.player.draw(this.ctx);
      
      // Draw player name
      this.ctx.fillStyle = GAME_CONFIG.colors.player;
      this.ctx.font = 'bold 11px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(gameState.username, this.player.pos.x, this.player.pos.y - this.player.size - 15);
    }
    
    // Draw wave announcement
    if (this.waveAnnouncementTime > Date.now()) {
      const alpha = Math.min(1, (this.waveAnnouncementTime - Date.now()) / 1000);
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = '#ffaa00';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.shadowBlur = 20;
      this.ctx.shadowColor = '#ffaa00';
      this.ctx.fillText(`WAVE ${this.wave}`, GAME_CONFIG.width / 2, GAME_CONFIG.height / 2);
      this.ctx.shadowBlur = 0;
      this.ctx.globalAlpha = 1;
    }
    
    // Draw paused overlay
    if (this.paused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
      this.ctx.fillStyle = '#00ffff';
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', GAME_CONFIG.width / 2, GAME_CONFIG.height / 2);
      this.ctx.font = '20px Arial';
      this.ctx.fillText('Press ESC to resume', GAME_CONFIG.width / 2, GAME_CONFIG.height / 2 + 50);
    }
  }
  
  gameLoop(timestamp) {
    if (!this.running) return;
    
    // Calculate FPS
    if (this.lastFrameTime) {
      const delta = timestamp - this.lastFrameTime;
      this.fps = Math.round(1000 / delta);
    }
    this.lastFrameTime = timestamp;
    
    this.update();
    this.draw();
    this.drawMiniMap();
    
    requestAnimationFrame((t) => this.gameLoop(t));
  }
  
  start() {
    this.running = true;
    this.gameLoop(0);
  }
  
  stop() {
    this.running = false;
  }
  
  gameOver() {
    this.stop();
    
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const accuracy = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0;
    
    // Check achievements
    if (this.damageTaken === 0 && this.kills > 0) {
      this.checkAchievement('flawless');
    }
    if (accuracy >= 90 && this.shotsFired >= 10) {
      this.checkAchievement('sharpshooter');
    }
    
    // Add participation XP
    this.addXP(GAME_DATA.xpRewards.participation);
    
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('finalKills').textContent = this.kills;
    document.getElementById('finalWaves').textContent = this.wave;
    document.getElementById('finalTime').textContent = 
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('finalAccuracy').textContent = accuracy + '%';
    
    document.getElementById('gameOverScreen').style.display = 'flex';
    
    // Create final player standings (player vs opponent)
    const opponentScore = Math.floor(this.score * (0.7 + Math.random() * 0.5)); // AI score is 70-120% of player's
    const allPlayers = [
      { username: gameState.username, link: gameState.link, score: this.score },
      { username: gameState.opponentName, link: gameState.opponentLink, score: opponentScore }
    ];
    
    allPlayers.sort((a, b) => b.score - a.score);
    gameState.currentPlayers = allPlayers;
    gameState.currentWinner = allPlayers[0];
    
    // Award win XP if player won
    if (allPlayers[0].username === gameState.username) {
      this.addXP(GAME_DATA.xpRewards.win);
      this.updateChallengeProgress('wins_3');
      playerProgression.currentStreak++;
    } else {
      playerProgression.currentStreak = 0;
    }
    
    // Auto-transition to winner screen after 3 seconds
    setTimeout(() => {
      document.getElementById('gameOverScreen').style.display = 'none';
      determineWinner();
    }, 3000);
  }
}

let currentGame = null;

function showLoadingScreen() {
  showView('gameView');
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
  
  if (ASSETS.coverArt && ASSETS.loaded) {
    const scale = Math.min(
      GAME_CONFIG.width / ASSETS.coverArt.width,
      GAME_CONFIG.height / ASSETS.coverArt.height
    ) * 0.8;
    const w = ASSETS.coverArt.width * scale;
    const h = ASSETS.coverArt.height * scale;
    const x = (GAME_CONFIG.width - w) / 2;
    const y = (GAME_CONFIG.height - h) / 2 - 50;
    
    ctx.drawImage(ASSETS.coverArt, x, y, w, h);
  }
  
  ctx.fillStyle = '#00ffff';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText("Jeff's Portal Shooter", GAME_CONFIG.width / 2, GAME_CONFIG.height - 150);
  
  ctx.fillStyle = '#ffaa00';
  ctx.font = '20px Arial';
  ctx.fillText('Loading assets...', GAME_CONFIG.width / 2, GAME_CONFIG.height - 100);
  
  const loadPercent = Math.floor((ASSETS.loadedAssets / ASSETS.totalAssets) * 100);
  ctx.fillRect(GAME_CONFIG.width / 2 - 150, GAME_CONFIG.height - 70, 300, 20);
  ctx.fillStyle = '#00ffff';
  ctx.fillRect(GAME_CONFIG.width / 2 - 150, GAME_CONFIG.height - 70, 300 * (loadPercent / 100), 20);
  
  ctx.fillStyle = 'white';
  ctx.font = '14px Arial';
  ctx.fillText(`${loadPercent}%`, GAME_CONFIG.width / 2, GAME_CONFIG.height - 55);
}

function startGame() {
  if (!ASSETS.loaded) {
    showLoadingScreen();
    loadAssets(() => {
      setTimeout(() => {
        initializeGame();
      }, 500);
    });
    
    const checkLoading = setInterval(() => {
      if (!ASSETS.loaded) {
        showLoadingScreen();
      } else {
        clearInterval(checkLoading);
      }
    }, 100);
  } else {
    initializeGame();
  }
}

function initializeGame() {
  showView('gameView');
  document.getElementById('gameOverScreen').style.display = 'none';
  
  // Show tutorial on first game only (once per session)
  if (!sessionState.hasSeenTutorial && gameState.gamesPlayed === 0) {
    setTimeout(() => {
      showTutorial();
      sessionState.hasSeenTutorial = true;
    }, 1000);
  }
  
  // Start the portal shooter game
  currentGame = new PortalShooterGame();
  currentGame.start();
}

function restartGame() {
  document.getElementById('gameOverScreen').style.display = 'none';
  if (currentGame) {
    currentGame.stop();
  }
  currentGame = new PortalShooterGame();
  currentGame.start();
}

function returnToLobby() {
  if (currentGame) {
    currentGame.stop();
  }
  enterLobby();
}

function determineWinner() {
  // Winner already determined in game over
  const winner = gameState.currentWinner;
  
  // Update user stats
  gameState.gamesPlayed++;
  if (winner.username === gameState.username) {
    gameState.wins++;
    gameState.clicksReceived += gameState.currentPlayers.length - 1;
  }
  
  // Track total kills
  if (currentGame) {
    playerProgression.totalKills += currentGame.kills;
    playerProgression.portalKills += currentGame.portalKills;
  }
  
  showWinnerAnnouncement();
}

function showWinnerAnnouncement() {
  showView('winnerView');
  
  const winner = gameState.currentWinner;
  const isPlayerWinner = winner.username === gameState.username;
  
  if (isPlayerWinner) {
    // Player won - show their link being promoted
    document.getElementById('winnerIsYou').style.display = 'block';
    document.getElementById('winnerIsOpponent').style.display = 'none';
    
    document.getElementById('yourLinkHuge').textContent = gameState.link;
    document.getElementById('yourLinkHuge').href = gameState.link;
    document.getElementById('opponentNameWin').textContent = gameState.opponentName;
    document.getElementById('yourScoreWin').textContent = winner.score || 0;
  } else {
    // Player lost - show winner's link HUGE
    document.getElementById('winnerIsYou').style.display = 'none';
    document.getElementById('winnerIsOpponent').style.display = 'block';
    
    document.getElementById('winnerNameLose').textContent = winner.username;
    document.getElementById('winnerLinkHuge').textContent = winner.link;
    document.getElementById('winnerLinkHuge').href = winner.link;
    
    const playerScore = gameState.currentPlayers.find(p => p.username === gameState.username)?.score || 0;
    document.getElementById('yourScoreLose').textContent = playerScore;
    document.getElementById('opponentScoreLose').textContent = winner.score || 0;
    document.getElementById('opponentNameLose').textContent = winner.username;
    
    // Track that loser saw winner's link
    gameState.clicksReceived++;
  }
}

function copyYourLink() {
  const link = gameState.link;
  // Copy to clipboard (navigator.clipboard may not work in sandbox)
  const textarea = document.createElement('textarea');
  textarea.value = link;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    alert('Link copied to clipboard!');
  } catch (err) {
    alert('Link: ' + link);
  }
  document.body.removeChild(textarea);
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
  
  // Update match statistics
  document.getElementById('postGameScore').textContent = currentGame ? currentGame.score : 0;
  document.getElementById('postGameKills').textContent = currentGame ? currentGame.kills : 0;
  
  const xpEarned = playerProgression.xp;
  document.getElementById('postGameXP').textContent = Math.floor(xpEarned);
  document.getElementById('postGameCoins').textContent = playerProgression.coins;
  
  // Update progression display
  document.getElementById('postGameLevel').textContent = playerProgression.level;
  const xpPercent = (playerProgression.xp / playerProgression.xpToNextLevel) * 100;
  document.getElementById('postGameXPBar').style.width = `${xpPercent}%`;
  document.getElementById('postGameXPText').textContent = `${playerProgression.xp} / ${playerProgression.xpToNextLevel} XP`;
  
  // Show unlocked achievements
  const unlockedThisGame = playerProgression.achievements.filter(a => a.unlocked);
  if (unlockedThisGame.length > 0) {
    document.getElementById('achievementsUnlocked').style.display = 'block';
    const list = document.getElementById('unlockedAchievementsList');
    list.innerHTML = '';
    unlockedThisGame.forEach(achievement => {
      const badge = document.createElement('div');
      badge.className = 'achievement-badge';
      badge.innerHTML = `
        <span class="achievement-badge-icon">🏆</span>
        <span class="achievement-badge-name">${achievement.name}</span>
      `;
      list.appendChild(badge);
    });
  }
  
  // Update match leaderboard
  const leaderboard = document.getElementById('matchLeaderboard');
  leaderboard.innerHTML = '';
  
  gameState.currentPlayers.forEach((player, index) => {
    const row = document.createElement('tr');
    if (player.username === gameState.username) {
      row.style.backgroundColor = 'var(--color-bg-1)';
      row.style.fontWeight = 'var(--font-weight-bold)';
    }
    
    const medal = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : ''));
    
    row.innerHTML = `
      <td>${medal} ${index + 1}</td>
      <td>${player.username}</td>
      <td>${player.score || 0}</td>
      <td>${currentGame && player.username === gameState.username ? currentGame.kills : Math.floor(Math.random() * 15)}</td>
    `;
    leaderboard.appendChild(row);
  });
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

function viewStats() {
  alert(`Your Stats:\n\nLevel: ${playerProgression.level}\nTotal XP: ${playerProgression.xp}\nPortal Coins: ${playerProgression.coins}\nTotal Kills: ${playerProgression.totalKills}\nPortal Kills: ${playerProgression.portalKills}\nCurrent Streak: ${playerProgression.currentStreak}\n\nAchievements Unlocked: ${playerProgression.achievements.filter(a => a.unlocked).length}/${playerProgression.achievements.length}`);
}

function selectGameMode(mode) {
  console.log('Selected game mode:', mode);
  enterLobby();
}

function closeTutorial() {
  document.getElementById('tutorialOverlay').style.display = 'none';
  // Return focus to game canvas
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    canvas.focus();
  }
}

function showTutorialWithAnyInput() {
  const tutorialOverlay = document.getElementById('tutorialOverlay');
  tutorialOverlay.style.display = 'flex';
  
  // Close on any click
  const closeOnClick = (e) => {
    if (e.target === tutorialOverlay || e.target.closest('.btn-primary')) {
      closeTutorial();
      tutorialOverlay.removeEventListener('click', closeOnClick);
      document.removeEventListener('keydown', closeOnKey);
    }
  };
  
  // Close on any key
  const closeOnKey = (e) => {
    if (['Enter', ' ', 'Escape', 'h', 'H'].includes(e.key) || e.key.length === 1) {
      closeTutorial();
      tutorialOverlay.removeEventListener('click', closeOnClick);
      document.removeEventListener('keydown', closeOnKey);
      e.preventDefault();
    }
  };
  
  tutorialOverlay.addEventListener('click', closeOnClick);
  document.addEventListener('keydown', closeOnKey);
}

function showTutorial() {
  showTutorialWithAnyInput();
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

// Helper functions
function toggleChallenges() {
  const content = document.getElementById('challengesContent');
  content.style.display = content.style.display === 'none' ? 'block' : 'none';
}

// Initialize with welcome message
window.addEventListener('load', () => {
  console.log('%c🎮 Play to Promote - Portal Shooter Game!', 'color: #00ffff; font-size: 16px; font-weight: bold;');
  console.log('%c✨ Features:', 'color: #ffaa00; font-size: 14px;');
  console.log('  • Real-time multiplayer with AI bots');
  console.log('  • Player progression & leveling system');
  console.log('  • Achievements & daily challenges');
  console.log('  • Power-ups & killstreaks');
  console.log('  • Quick chat & kill feed');
  console.log('  • Mini-map & player list');
  console.log('  • Portal mechanics with teleportation');
  console.log('  • Post-game statistics & leaderboards');
  console.log('%c🚀 Ready to play!', 'color: #00ff88; font-size: 14px;');
  console.log('%c📦 GitHub Pages Ready!', 'color: #ff00ff; font-size: 14px;');
});