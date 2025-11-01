
import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GameHUD from '../components/game/GameHUD';
import GameOverScreen from '../components/game/GameOverScreen';
import Lobby from '../components/game/Lobby';
import { SoundManager } from '../components/game/SoundManager';

// Enemy types configuration
const ENEMY_TYPES = {
  CHASER: {
    name: 'Chaser',
    color: '#ff006e',
    width: 30,
    height: 30,
    speed: 2,
    health: 3,
    damage: 0.5,
    points: 10,
  },
  TANK: {
    name: 'Tank',
    color: '#8b5cf6',
    width: 40,
    height: 40,
    speed: 1,
    health: 8,
    damage: 1,
    points: 30,
  },
  SPEEDY: {
    name: 'Speedy',
    color: '#fbbf24',
    width: 20,
    height: 20,
    speed: 4,
    health: 2,
    damage: 0.3,
    points: 15,
  },
  RANGED: {
    name: 'Ranged',
    color: '#10b981',
    width: 25,
    height: 25,
    speed: 1.5,
    health: 4,
    damage: 0,
    points: 20,
    shootInterval: 120,
  },
  BOMBER: {
    name: 'Bomber',
    color: '#f97316',
    width: 35,
    height: 35,
    speed: 1.2,
    health: 5,
    damage: 0,
    points: 25,
    explodeRadius: 80,
    explodeDamage: 3,
  },
  TELEPORTER: {
    name: 'Teleporter',
    color: '#ec4899',
    width: 28,
    height: 28,
    speed: 2.5,
    health: 4,
    damage: 0.4,
    points: 20,
    teleportInterval: 180,
  }
};

// Boss enemy types
const BOSS_TYPES = {
  MEGA_TANK: {
    name: 'Mega Tank',
    color: '#7c3aed',
    width: 80,
    height: 80,
    speed: 0.8,
    health: 100,
    damage: 2,
    points: 500,
    isBoss: true,
    attackPattern: 'charge_and_slam',
    specialCooldown: 0,
    specialInterval: 180,
  },
  SPELL_MASTER: {
    name: 'Spell Master',
    color: '#06b6d4',
    width: 70,
    height: 70,
    speed: 1,
    health: 80,
    damage: 0,
    points: 600,
    isBoss: true,
    attackPattern: 'spiral_shots',
    specialCooldown: 0,
    specialInterval: 120,
    shootInterval: 60,
  },
  PORTAL_LORD: {
    name: 'Portal Lord',
    color: '#d946ef',
    width: 75,
    height: 75,
    speed: 1.5,
    health: 90,
    damage: 1.5,
    points: 550,
    isBoss: true,
    attackPattern: 'teleport_assault',
    specialCooldown: 0,
    specialInterval: 150,
    teleportInterval: 90,
  }
};

// Power-up types configuration
const POWERUP_TYPES = {
  SPEED: {
    name: 'Speed Boost',
    color: '#fbbf24',
    icon: '⚡',
    duration: 300, // 5 seconds at 60fps
    effect: 'speed',
    multiplier: 2,
  },
  SHIELD: {
    name: 'Shield',
    color: '#3b82f6',
    icon: '🛡️',
    duration: 360, // 6 seconds
    effect: 'shield',
  },
  RAPID_FIRE: {
    name: 'Rapid Fire',
    color: '#ef4444',
    icon: '🔥',
    duration: 300,
    effect: 'rapidFire',
  },
  SCORE_MULTIPLIER: {
    name: 'Score x2',
    color: '#a855f7',
    icon: '⭐',
    duration: 360,
    effect: 'scoreMultiplier',
    multiplier: 2,
  },
};

export default function Game() {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const soundManagerRef = useRef(new SoundManager());
  const queryClient = useQueryClient();
  
  // Image refs for character sprites
  const idleImageRef = useRef(null);
  const attackImageRef = useRef(null);
  const imagesLoadedRef = useRef(false);
  
  // Enemy sprite refs
  const enemySpritesRef = useRef({});
  const enemySpritesLoadedRef = useRef(false);
  
  // Background image ref
  const backgroundImageRef = useRef(null);
  const backgroundLoadedRef = useRef(false);
  
  const [gameState, setGameState] = useState('setup');
  const [playerName, setPlayerName] = useState('');
  const [promoLink, setPromoLink] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [practiceMode, setPracticeMode] = useState(false);
  const [previousHealth, setPreviousHealth] = useState(100);
  const [activePowerups, setActivePowerups] = useState([]);
  const [currentBoss, setCurrentBoss] = useState(null);
  
  const gameDataRef = useRef({
    player: { x: 400, y: 300, width: 60, height: 60, speed: 5, baseSpeed: 5 },
    enemies: [],
    spells: [],
    enemyProjectiles: [],
    portals: [],
    particles: [],
    explosions: [],
    powerups: [],
    activePowerups: [],
    floatingTexts: [],
    keys: {},
    lastEnemySpawn: 0,
    enemySpawnRate: 2000,
    lastPowerupSpawn: 0,
    powerupSpawnRate: 8000,
    portalCooldown: 0,
    shootCooldown: 0,
    attackAnimationTimer: 0,
    score: 0,
    health: 100,
    waveNumber: 1,
    previousWaveNumber: 1,
    difficultyMultiplier: 1.0,
    performanceScore: 0,
    lastPerformanceCheck: 0,
    damageThisWave: 0,
    killsThisWave: 0,
    currentBoss: null,
    bossActive: false,
    screenShake: { x: 0, y: 0, intensity: 0 },
    backgroundPulse: 0,
    combatIntensity: 0,
    touch: {
      active: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0
    }
  });

  // Load character images
  useEffect(() => {
    const idleImg = new Image();
    const attackImg = new Image();
    
    idleImg.src = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6903a224f167f192bff79bf5/e20ead410_idle.png';
    attackImg.src = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6903a224f167f192bff79bf5/904c07caa_attack.png';
    
    let loadedCount = 0;
    const onLoad = () => {
      loadedCount++;
      if (loadedCount === 2) {
        imagesLoadedRef.current = true;
      }
    };
    
    idleImg.onload = onLoad;
    attackImg.onload = onLoad;
    
    idleImageRef.current = idleImg;
    attackImageRef.current = attackImg;
  }, []);

  // Load enemy sprites
  useEffect(() => {
    const sprites = {
      'Chaser': new Image(),
      'Ranged': new Image(),
      'Bomber': new Image(),
      'Speedy': new Image(),
      'Tank': new Image(),
      'Teleporter': new Image(),
      'Mega Tank': new Image(),
      'Portal Lord': new Image(),
      'Spell Master': new Image(),
    };
    
    sprites['Chaser'].src = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6903a224f167f192bff79bf5/346e94fcd_Chaser.png';
    sprites['Ranged'].src = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6903a224f167f192bff79bf5/c559db74f_Ranged.png';
    sprites['Bomber'].src = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6903a224f167f192bff79bf5/297dbc31b_Bomber.png';
    sprites['Speedy'].src = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6903a224f167f192bff79bf5/7a18c83a2_Speedy.png';
    sprites['Tank'].src = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6903a224f167f192bff79bf5/904e1c86a_Tank.png';
    sprites['Teleporter'].src = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6903a224f167f192bff79bf5/5fb9cf1c7_Teleporter.png';
    sprites['Mega Tank'].src = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6903a224f167f192bff79bf5/4b41af91f_MegaTank.png';
    sprites['Portal Lord'].src = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6903a224f167f192bff79bf5/ff744d6a4_PortalLord.png';
    sprites['Spell Master'].src = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6903a224f167f192bff79bf5/f295b1fe8_SpellMaster.png';
    
    let loadedCount = 0;
    const totalSprites = Object.keys(sprites).length;
    
    const onLoad = () => {
      loadedCount++;
      if (loadedCount === totalSprites) {
        enemySpritesLoadedRef.current = true;
      }
    };
    
    Object.values(sprites).forEach(img => {
      img.onload = onLoad;
    });
    
    enemySpritesRef.current = sprites;
  }, []);

  // Load background image
  useEffect(() => {
    const bgImg = new Image();
    bgImg.src = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6903a224f167f192bff79bf5/4936276f9_BackgroundPixelart.png';
    bgImg.onload = () => {
      backgroundLoadedRef.current = true;
    };
    backgroundImageRef.current = bgImg;
  }, []);

  const { data: session } = useQuery({
    queryKey: ['session', currentSessionId],
    queryFn: async () => {
      if (!currentSessionId) return null;
      const sessions = await base44.entities.GameSession.filter({ id: currentSessionId });
      return sessions[0] || null;
    },
    enabled: !!currentSessionId && !practiceMode,
    refetchInterval: 1000,
  });

  const { data: players = [] } = useQuery({
    queryKey: ['players', currentSessionId],
    queryFn: async () => {
      if (!currentSessionId) return [];
      return await base44.entities.Player.filter({ session_id: currentSessionId });
    },
    enabled: !!currentSessionId && !practiceMode,
    refetchInterval: 1000,
  });

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const session = await base44.entities.GameSession.create({
        session_code: code,
        status: 'waiting'
      });
      return session;
    },
    onSuccess: (session) => {
      setCurrentSessionId(session.id);
      joinSession(session.id);
    }
  });

  const joinSession = async (sessionId) => {
    const player = await base44.entities.Player.create({
      session_id: sessionId,
      player_name: playerName,
      promotional_link: promoLink,
      score: 0,
      health: 100
    });
    setCurrentPlayerId(player.id);
    setGameState('lobby');
  };

  const handleCreateGame = () => {
    if (!playerName || !promoLink) return;
    createSessionMutation.mutate();
  };

  const handleJoinGame = async () => {
    if (!playerName || !promoLink || !sessionCode) return;
    
    const sessions = await base44.entities.GameSession.filter({ session_code: sessionCode.toUpperCase() });
    if (sessions.length > 0) {
      setCurrentSessionId(sessions[0].id);
      await joinSession(sessions[0].id);
    }
  };

  const handlePracticeMode = () => {
    setPracticeMode(true);
    setPlayerName('Player');
    setPromoLink('https://example.com');
    soundManagerRef.current.init();
    soundManagerRef.current.startBackgroundMusic();
    setGameState('playing');
  };

  const handleStartGame = async () => {
    await base44.entities.GameSession.update(currentSessionId, {
      status: 'playing',
      started_at: new Date().toISOString()
    });
    soundManagerRef.current.init();
    soundManagerRef.current.startBackgroundMusic();
    setGameState('playing');
  };

  useEffect(() => {
    if (session?.status === 'playing' && gameState === 'lobby') {
      soundManagerRef.current.init();
      soundManagerRef.current.startBackgroundMusic();
      setGameState('playing');
    }
    if (session?.status === 'finished' && gameState === 'playing') {
      soundManagerRef.current.stopBackgroundMusic();
      soundManagerRef.current.playGameOver();
      setGameState('gameover');
    }
  }, [session, gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      startGame();
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing' && currentPlayerId && !practiceMode) {
      const interval = setInterval(async () => {
        const currentHealth = gameDataRef.current.health;
        const currentScore = gameDataRef.current.score;
        const isAlive = currentHealth > 0;
        
        await base44.entities.Player.update(currentPlayerId, {
          score: currentScore,
          health: currentHealth,
          is_alive: isAlive
        });
        
        if (!isAlive) {
          const latestPlayers = await base44.entities.Player.filter({ session_id: currentSessionId });
          const alivePlayers = latestPlayers.filter(p => p.is_alive);
          
          if (alivePlayers.length === 0) {
            const winner = latestPlayers.reduce((max, p) => p.score > max.score ? p : max, latestPlayers[0]);
            await base44.entities.GameSession.update(currentSessionId, {
              status: 'finished',
              ended_at: new Date().toISOString(),
              winner_id: winner.id
            });
          }
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [gameState, currentPlayerId, practiceMode, currentSessionId]);

  useEffect(() => {
    if (practiceMode && gameState === 'playing' && gameDataRef.current.health <= 0) {
      soundManagerRef.current.stopBackgroundMusic();
      soundManagerRef.current.playGameOver();
      setTimeout(() => {
        setGameState('gameover');
      }, 500);
    }
  }, [health, practiceMode, gameState]);

  useEffect(() => {
    if (health < previousHealth && health > 0) {
      soundManagerRef.current.playPlayerHurt();
    }
    setPreviousHealth(health);
  }, [health, previousHealth]);

  const startGame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size based on screen
    const setCanvasSize = () => {
      const maxWidth = Math.min(window.innerWidth - 40, 800);
      const maxHeight = Math.min(window.innerHeight - 200, 600);
      canvas.width = maxWidth;
      canvas.height = maxHeight;
    };
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    gameDataRef.current = {
      player: { x: canvas.width / 2 - 30, y: canvas.height / 2 - 30, width: 60, height: 60, speed: 5, baseSpeed: 5 },
      enemies: [],
      spells: [],
      enemyProjectiles: [],
      portals: [],
      particles: [],
      explosions: [],
      powerups: [],
      activePowerups: [],
      floatingTexts: [],
      keys: {},
      lastEnemySpawn: Date.now(),
      enemySpawnRate: 2000,
      lastPowerupSpawn: Date.now(),
      powerupSpawnRate: 8000,
      portalCooldown: 0,
      shootCooldown: 0,
      attackAnimationTimer: 0,
      score: 0,
      health: 100,
      waveNumber: 1,
      previousWaveNumber: 1,
      difficultyMultiplier: 1.0,
      performanceScore: 0,
      lastPerformanceCheck: Date.now(),
      damageThisWave: 0,
      killsThisWave: 0,
      currentBoss: null,
      bossActive: false,
      screenShake: { x: 0, y: 0, intensity: 0 },
      backgroundPulse: 0,
      combatIntensity: 0,
      touch: {
        active: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0
      }
    };
    
    setScore(0);
    setHealth(100);
    setPreviousHealth(100);
    setActivePowerups([]);
    setCurrentBoss(null);
    
    const handleKeyDown = (e) => {
      gameDataRef.current.keys[e.key.toLowerCase()] = true;
      
      if (e.key === ' ') {
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e) => {
      gameDataRef.current.keys[e.key.toLowerCase()] = false;
    };

    const handleMouseClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      shootSpellTowards(mouseX, mouseY);
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      openPortalAt(mouseX, mouseY);
    };
    
    // Mobile touch controls for movement
    const handleTouchStart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      
      gameDataRef.current.touch.active = true;
      gameDataRef.current.touch.startX = touchX;
      gameDataRef.current.touch.startY = touchY;
      gameDataRef.current.touch.currentX = touchX;
      gameDataRef.current.touch.currentY = touchY;
    };
    
    const handleTouchMove = (e) => {
      e.preventDefault();
      if (!gameDataRef.current.touch.active) return;
      
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      gameDataRef.current.touch.currentX = touch.clientX - rect.left;
      gameDataRef.current.touch.currentY = touch.clientY - rect.top;
    };
    
    const handleTouchEnd = (e) => {
      e.preventDefault();
      gameDataRef.current.touch.active = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('click', handleMouseClick);
    canvas.addEventListener('contextmenu', handleContextMenu);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    const gameLoop = () => {
      update();
      render(ctx);
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoop();
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', setCanvasSize);
      canvas.removeEventListener('click', handleMouseClick);
      canvas.removeEventListener('contextmenu', handleContextMenu);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  };

  const shootSpellTowards = (targetX, targetY) => {
    const game = gameDataRef.current;
    
    if (game.shootCooldown > 0) return;
    
    const playerCenterX = game.player.x + game.player.width / 2;
    const playerCenterY = game.player.y + game.player.height / 2;
    
    const dx = targetX - playerCenterX;
    const dy = targetY - playerCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    game.spells.push({
      x: playerCenterX,
      y: playerCenterY,
      vx: (dx / distance) * 8,
      vy: (dy / distance) * 8,
      radius: 8,
      color: '#3b82f6',
      trail: [] // New: trail for spell
    });
    
    soundManagerRef.current.playShoot();
    
    const hasRapidFire = game.activePowerups.some(p => p.effect === 'rapidFire');
    game.shootCooldown = hasRapidFire ? 5 : 15;
    
    // Trigger attack animation
    game.attackAnimationTimer = 20; // Show attack sprite for 20 frames
    
    // Enhanced particle effects for shooting
    for (let i = 0; i < 15; i++) {
      game.particles.push({
        x: playerCenterX,
        y: playerCenterY,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 30,
        maxLife: 30,
        color: '#3b82f6',
        size: Math.random() * 3 + 2,
        alpha: 1
      });
    }
  };

  const openPortalAt = (portalX, portalY) => {
    const game = gameDataRef.current;
    
    if (game.portalCooldown <= 0) {
      game.portals.push({
        x: portalX,
        y: portalY,
        radius: 50,
        life: 180,
        rotation: 0
      });
      
      game.player.x = portalX - game.player.width / 2;
      game.player.y = portalY - game.player.height / 2;
      
      game.portalCooldown = 120;
      
      soundManagerRef.current.playPortal();
      
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        game.particles.push({
          x: portalX,
          y: portalY,
          vx: Math.cos(angle) * 4,
          vy: Math.sin(angle) * 4,
          life: 40,
          maxLife: 40,
          color: '#9d4edd',
          size: 4,
          alpha: 1
        });
      }
    }
  };

  const adjustDifficulty = () => {
    const game = gameDataRef.current;
    const now = Date.now();
    
    // Check performance every 10 seconds
    if (now - game.lastPerformanceCheck < 10000) return;
    game.lastPerformanceCheck = now;
    
    // Calculate performance metrics
    const healthRatio = game.health / 100; // Player health as a ratio
    const killRate = game.killsThisWave; // Kills in last 10 seconds
    const damageRate = game.damageThisWave; // Damage taken in last 10 seconds
    
    // Performance score: higher means player is doing well
    // Max 1 point from healthRatio (if 100% health)
    // Max 1 point from killRate (if >= 20 kills in 10s)
    // Max -1 point from damageRate (if >= 50 damage in 10s)
    const performance = (healthRatio * 0.4) + (Math.min(killRate / 20, 1) * 0.4) - (Math.min(damageRate / 50, 1) * 0.2);
    
    // Adjust difficulty multiplier based on performance
    // If player is doing very well (>0.7), increase difficulty
    // If player is struggling (<0.3), decrease difficulty
    if (performance > 0.7) {
      game.difficultyMultiplier = Math.min(game.difficultyMultiplier + 0.05, 2.0); // Cap at 2.0x
    } else if (performance < 0.3) {
      game.difficultyMultiplier = Math.max(game.difficultyMultiplier - 0.05, 0.7); // Floor at 0.7x
    }
    
    // Reset wave stats for next check
    game.damageThisWave = 0;
    game.killsThisWave = 0;
  };

  const spawnBoss = (canvas) => {
    const game = gameDataRef.current;
    const bossTypes = Object.values(BOSS_TYPES);
    const bossType = bossTypes[Math.floor(Math.random() * bossTypes.length)];
    
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch(side) {
      case 0: x = canvas.width / 2 - bossType.width / 2; y = -100; break;
      case 1: x = canvas.width + 100; y = canvas.height / 2 - bossType.height / 2; break;
      case 2: x = canvas.width / 2 - bossType.width / 2; y = canvas.height + 100; break;
      case 3: x = -100; y = canvas.height / 2 - bossType.height / 2; break;
      default: x = canvas.width / 2 - bossType.width / 2; y = -100; break; // Should not happen
    }
    
    const boss = {
      x, y,
      type: bossType.name,
      width: bossType.width,
      height: bossType.height,
      speed: bossType.speed * game.difficultyMultiplier,
      health: Math.ceil(bossType.health * game.difficultyMultiplier),
      maxHealth: Math.ceil(bossType.health * game.difficultyMultiplier),
      damage: bossType.damage,
      color: bossType.color,
      points: bossType.points,
      isBoss: true,
      attackPattern: bossType.attackPattern,
      specialCooldown: bossType.specialInterval, // Initialize cooldown
      specialInterval: bossType.specialInterval,
      shootCooldown: bossType.shootInterval || 0,
      teleportCooldown: bossType.teleportInterval || 0,
      phaseAngle: 0, // For spiral patterns etc.
    };
    
    game.enemies.push(boss);
    game.currentBoss = boss;
    game.bossActive = true;
    setCurrentBoss(boss);
    
    soundManagerRef.current.playWaveStart(); // Use wave start sound for boss
  };

  const spawnEnemy = (canvas) => {
    const game = gameDataRef.current;
    
    let availableTypes = [ENEMY_TYPES.CHASER];
    
    if (game.waveNumber >= 2) availableTypes.push(ENEMY_TYPES.SPEEDY);
    if (game.waveNumber >= 3) availableTypes.push(ENEMY_TYPES.RANGED);
    if (game.waveNumber >= 4) availableTypes.push(ENEMY_TYPES.TANK);
    if (game.waveNumber >= 5) availableTypes.push(ENEMY_TYPES.BOMBER);
    if (game.waveNumber >= 6) availableTypes.push(ENEMY_TYPES.TELEPORTER);
    
    const enemyType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch(side) {
      case 0: x = Math.random() * canvas.width; y = -50; break;
      case 1: x = canvas.width + 50; y = Math.random() * canvas.height; break;
      case 2: x = Math.random() * canvas.width; y = canvas.height + 50; break;
      case 3: x = -50; y = Math.random() * canvas.height; break;
      default: x = Math.random() * canvas.width; y = -50; break;
    }
    
    game.enemies.push({
      x, y,
      type: enemyType.name,
      width: enemyType.width,
      height: enemyType.height,
      speed: enemyType.speed * game.difficultyMultiplier,
      health: Math.ceil(enemyType.health * game.difficultyMultiplier),
      maxHealth: Math.ceil(enemyType.health * game.difficultyMultiplier),
      damage: enemyType.damage,
      color: enemyType.color,
      points: enemyType.points,
      shootCooldown: 0,
      teleportCooldown: 0,
      aiState: 'chase'
    });
    
    soundManagerRef.current.playEnemySpawn();
  };

  const spawnPowerup = (canvas) => {
    const game = gameDataRef.current;
    const types = Object.values(POWERUP_TYPES);
    const powerupType = types[Math.floor(Math.random() * types.length)];
    
    game.powerups.push({
      x: Math.random() * (canvas.width - 60) + 30,
      y: Math.random() * (canvas.height - 60) + 30,
      width: 30,
      height: 30,
      type: powerupType,
      rotation: 0,
      pulse: 0
    });
  };

  const collectPowerup = (powerup) => {
    const game = gameDataRef.current;
    
    // Add to active powerups
    const newPowerup = {
      name: powerup.type.name,
      color: powerup.type.color,
      icon: powerup.type.icon,
      duration: powerup.type.duration,
      effect: powerup.type.effect,
      multiplier: powerup.type.multiplier || 1,
      timeLeft: powerup.type.duration
    };
    
    game.activePowerups.push(newPowerup);
    
    // Apply immediate effects
    if (powerup.type.effect === 'speed') {
      game.player.speed = game.player.baseSpeed * (powerup.type.multiplier || 2);
    }
    
    setActivePowerups([...game.activePowerups]);
    
    // Play sound effect
    try {
      soundManagerRef.current.playPortal(); // Reusing portal sound for powerup collection
    } catch (e) {
      console.log('Sound effect failed', e);
    }
    
    // Enhanced power-up collection effects with unique patterns per type
    const particleCount = 40;
    const centerX = powerup.x + powerup.width / 2;
    const centerY = powerup.y + powerup.height / 2;
    
    if (powerup.type.effect === 'speed') {
      // Speed boost: Lightning bolts
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        game.particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * 6,
          vy: Math.sin(angle) * 6,
          life: 40,
          maxLife: 40,
          color: powerup.type.color,
          size: 5,
          alpha: 1
        });
      }
    } else if (powerup.type.effect === 'shield') {
      // Shield: Expanding rings
      for (let ring = 0; ring < 3; ring++) {
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 * i) / 12;
          game.particles.push({
            x: centerX + Math.cos(angle) * ring * 10,
            y: centerY + Math.sin(angle) * ring * 10,
            vx: Math.cos(angle) * 3,
            vy: Math.sin(angle) * 3,
            life: 50,
            maxLife: 50,
            color: powerup.type.color,
            size: 4,
            alpha: 1
          });
        }
      }
    } else if (powerup.type.effect === 'rapidFire') {
      // Rapid fire: Explosive burst
      for (let i = 0; i < particleCount; i++) {
        game.particles.push({
          x: centerX,
          y: centerY,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 35,
          maxLife: 35,
          color: powerup.type.color,
          size: Math.random() * 4 + 2,
          alpha: 1
        });
      }
    } else if (powerup.type.effect === 'scoreMultiplier') {
      // Score multiplier: Stars
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        game.particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * 5,
          vy: Math.sin(angle) * 5 - 2,
          life: 45,
          maxLife: 45,
          color: powerup.type.color,
          size: 6,
          alpha: 1
        });
      }
    }
    
    // Add floating text
    game.floatingTexts.push({
      text: powerup.type.name,
      x: centerX,
      y: centerY,
      vy: -2,
      life: 60,
      maxLife: 60,
      color: powerup.type.color,
      size: 16
    });
  };

  const updateBossAI = (boss, game, canvas) => {
    const dx = game.player.x - boss.x;
    const dy = game.player.y - boss.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    boss.specialCooldown--;
    if (boss.specialCooldown < 0) boss.specialCooldown = 0; // Ensure cooldown doesn't go too negative
    
    // Logic for specific boss types
    if (boss.type === 'Mega Tank') {
      // Mega Tank: Charges at player and slams ground
      const originalBossType = BOSS_TYPES.MEGA_TANK;
      
      if (boss.specialCooldown <= 0) {
        // Prepare to charge
        boss.aiState = 'charging';
        boss.speed = originalBossType.speed * 3; // Temporary speed boost for charge
        // Set a new cooldown for the next special attack
        boss.specialCooldown = originalBossType.specialInterval;
      } else if (boss.aiState === 'charging' && dist < 100) {
        // Slam!
        game.explosions.push({
          x: boss.x + boss.width / 2,
          y: boss.y + boss.height / 2,
          radius: 0,
          maxRadius: originalBossType.explodeRadius || 150, // Using default or specific
          life: 40,
          maxLife: 40,
          damage: originalBossType.damage // Use boss's damage
        });
        soundManagerRef.current.playExplosion();
        game.screenShake.intensity = 15; // Screen shake for boss slam
        boss.aiState = 'recovering';
        boss.speed = originalBossType.speed * 0.5; // Slow down after slam
      } else if (boss.aiState === 'recovering' && boss.specialCooldown < originalBossType.specialInterval / 2) {
        boss.aiState = 'chasing';
        boss.speed = originalBossType.speed; // Return to normal speed
      } else if (boss.aiState === undefined || boss.aiState === 'chasing') {
         // Default chase behavior
        boss.x += (dx / dist) * boss.speed;
        boss.y += (dy / dist) * boss.speed;
      }
      
    } else if (boss.type === 'Spell Master') {
      // Spell Master: Shoots in spiral patterns
      const originalBossType = BOSS_TYPES.SPELL_MASTER;
      
      const optimalDistance = 250;
      if (dist > optimalDistance) {
        boss.x += (dx / dist) * boss.speed;
        boss.y += (dy / dist) * boss.speed;
      } else {
        // Try to maintain distance
        boss.x -= (dx / dist) * boss.speed * 0.5;
        boss.y -= (dy / dist) * boss.speed * 0.5;
      }
      
      boss.shootCooldown--;
      if (boss.shootCooldown <= 0) {
        // Shoot 8 projectiles in a circle
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i / 8) + boss.phaseAngle;
          game.enemyProjectiles.push({
            x: boss.x + boss.width / 2,
            y: boss.y + boss.height / 2,
            vx: Math.cos(angle) * 3,
            vy: Math.sin(angle) * 3,
            radius: 8,
            color: boss.color,
            damage: originalBossType.damage || 1.5, // Use boss's damage
            trail: []
          });
        }
        boss.shootCooldown = originalBossType.shootInterval;
        boss.phaseAngle += 0.2; // Rotate spiral
        soundManagerRef.current.playShoot();
      }
      
    } else if (boss.type === 'Portal Lord') {
      // Portal Lord: Teleports around and shoots
      const originalBossType = BOSS_TYPES.PORTAL_LORD;

      boss.teleportCooldown--;
      if (boss.teleportCooldown < 0) boss.teleportCooldown = 0;
      
      if (boss.teleportCooldown <= 0) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 200 + Math.random() * 100;
        boss.x = game.player.x + Math.cos(angle) * distance;
        boss.y = game.player.y + Math.sin(angle) * distance;
        
        // Keep in bounds
        boss.x = Math.max(0, Math.min(canvas.width - boss.width, boss.x));
        boss.y = Math.max(0, Math.min(canvas.height - boss.height, boss.y));
        
        boss.teleportCooldown = originalBossType.teleportInterval; // Reset cooldown
        
        soundManagerRef.current.playTeleport();
        
        // Shoot 4 projectiles after teleporting
        for (let i = 0; i < 4; i++) {
          const shootAngle = Math.atan2(dy, dx) + (i - 1.5) * 0.3; // Spread shot
          game.enemyProjectiles.push({
            x: boss.x + boss.width / 2,
            y: boss.y + boss.height / 2,
            vx: Math.cos(shootAngle) * 5,
            vy: Math.sin(shootAngle) * 5,
            radius: 7,
            color: boss.color,
            damage: originalBossType.damage || 1,
            trail: []
          });
        }
        
        // Teleport particles
        for (let i = 0; i < 20; i++) {
          const pAngle = (Math.PI * 2 * i) / 20;
          game.particles.push({
            x: boss.x + boss.width / 2,
            y: boss.y + boss.height / 2,
            vx: Math.cos(pAngle) * 4,
            vy: Math.sin(pAngle) * 4,
            life: 30,
            maxLife: 30,
            color: boss.color,
            size: 4,
            alpha: 1
          });
        }
      } else {
        // Chase normally when not teleporting
        boss.x += (dx / dist) * boss.speed;
        boss.y += (dy / dist) * boss.speed;
      }
    }
  };

  const update = () => {
    const game = gameDataRef.current;
    const canvas = canvasRef.current;

    // Check for wave change and boss spawn
    if (game.waveNumber > game.previousWaveNumber) {
      soundManagerRef.current.playWaveStart();
      game.previousWaveNumber = game.waveNumber;
      
      // Spawn boss every 5 waves
      if (game.waveNumber % 5 === 0 && !game.bossActive) {
        spawnBoss(canvas);
      }
    }
    
    // Adjust difficulty periodically
    adjustDifficulty();
    
    // Calculate combat intensity
    game.combatIntensity = Math.min(game.enemies.length / 10, 1) * 0.5 + 
                           (game.bossActive ? 0.5 : 0);
    game.backgroundPulse = game.combatIntensity;
    
    // Update screen shake
    if (game.screenShake.intensity > 0) {
      game.screenShake.x = (Math.random() - 0.5) * game.screenShake.intensity; // Reduced multiplier
      game.screenShake.y = (Math.random() - 0.5) * game.screenShake.intensity; // Reduced multiplier
      game.screenShake.intensity *= 0.9;
      
      if (game.screenShake.intensity < 0.1) {
        game.screenShake.intensity = 0;
        game.screenShake.x = 0;
        game.screenShake.y = 0;
      }
    }
    
    // Player movement - keyboard
    if (game.keys['w'] || game.keys['arrowup']) game.player.y -= game.player.speed;
    if (game.keys['s'] || game.keys['arrowdown']) game.player.y += game.player.speed;
    if (game.keys['a'] || game.keys['arrowleft']) game.player.x -= game.player.speed;
    if (game.keys['d'] || game.keys['arrowright']) game.player.x += game.player.speed;
    
    // Player movement - touch/mobile
    if (game.touch.active) {
      const dx = game.touch.currentX - game.touch.startX;
      const dy = game.touch.currentY - game.touch.startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 10) { // Only move if touch drag is significant
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;
        // Scale speed based on how far the finger is from start, up to player.speed
        const moveSpeed = Math.min(distance / 20, 1) * game.player.speed; 
        
        game.player.x += normalizedDx * moveSpeed;
        game.player.y += normalizedDy * moveSpeed;
      }
    }
    
    game.player.x = Math.max(0, Math.min(canvas.width - game.player.width, game.player.x));
    game.player.y = Math.max(0, Math.min(canvas.height - game.player.height, game.player.y));
    
    // Update attack animation timer
    if (game.attackAnimationTimer > 0) {
      game.attackAnimationTimer--;
    }
    
    // Spawn enemies (not during boss fights)
    const now = Date.now();
    if (!game.bossActive && now - game.lastEnemySpawn > game.enemySpawnRate) {
      spawnEnemy(canvas);
      game.lastEnemySpawn = now;
      game.enemySpawnRate = Math.max(600, game.enemySpawnRate - 15);
      
      if (game.score % 100 === 0 && game.score > 0) {
        game.waveNumber++;
      }
    }
    
    // Spawn power-ups
    if (now - game.lastPowerupSpawn > game.powerupSpawnRate) {
      spawnPowerup(canvas);
      game.lastPowerupSpawn = now;
      game.powerupSpawnRate = 8000 + Math.random() * 4000; // Randomize next spawn
    }
    
    // Update power-ups (rotation, pulse, collision detection)
    const playerCenterX = game.player.x + game.player.width / 2;
    const playerCenterY = game.player.y + game.player.height / 2;
    
    game.powerups = game.powerups.filter(powerup => {
      powerup.rotation += 0.05;
      powerup.pulse = (powerup.pulse + 0.1) % (Math.PI * 2);
      
      // Check collision with player using circle collision
      const powerupCenterX = powerup.x + powerup.width / 2;
      const powerupCenterY = powerup.y + powerup.height / 2;
      const dx = playerCenterX - powerupCenterX;
      const dy = playerCenterY - powerupCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < (game.player.width / 2 + powerup.width / 2)) {
        collectPowerup(powerup);
        return false; // Remove from array
      }
      
      return true; // Keep in array
    });
    
    // Update active power-ups
    game.activePowerups = game.activePowerups.filter(powerup => {
      powerup.timeLeft--;
      
      if (powerup.timeLeft <= 0) {
        // Remove effect
        if (powerup.effect === 'speed') {
          game.player.speed = game.player.baseSpeed;
        }
        return false; // Remove expired powerup
      }
      
      return true; // Keep active powerup
    });
    
    setActivePowerups([...game.activePowerups]);
    
    const hasShield = game.activePowerups.some(p => p.effect === 'shield');
    
    // Update enemies
    game.enemies.forEach(enemy => {
      if (enemy.isBoss) {
        updateBossAI(enemy, game, canvas);
      } else {
        const dx = game.player.x - enemy.x;
        const dy = game.player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (enemy.type === 'Chaser' || enemy.type === 'Speedy' || enemy.type === 'Tank') {
          enemy.x += (dx / dist) * enemy.speed;
          enemy.y += (dy / dist) * enemy.speed;
        } else if (enemy.type === 'Ranged') {
          const optimalDistance = 200;
          if (dist > optimalDistance + 50) {
            enemy.x += (dx / dist) * enemy.speed;
            enemy.y += (dy / dist) * enemy.speed;
          } else if (dist < optimalDistance - 50) {
            enemy.x -= (dx / dist) * enemy.speed;
            enemy.y -= (dy / dist) * enemy.speed;
          }
          
          enemy.shootCooldown--;
          if (enemy.shootCooldown <= 0) {
            const angle = Math.atan2(dy, dx);
            game.enemyProjectiles.push({
              x: enemy.x + enemy.width / 2,
              y: enemy.y + enemy.height / 2,
              vx: Math.cos(angle) * 4,
              vy: Math.sin(angle) * 4,
              radius: 6,
              color: enemy.color,
              damage: 1,
              trail: []
            });
            enemy.shootCooldown = ENEMY_TYPES.RANGED.shootInterval;
            soundManagerRef.current.playShoot();
          }
        } else if (enemy.type === 'Bomber') {
          enemy.x += (dx / dist) * enemy.speed;
          enemy.y += (dy / dist) * enemy.speed;
          
          if (dist < ENEMY_TYPES.BOMBER.explodeRadius) {
            game.explosions.push({
              x: enemy.x + enemy.width / 2,
              y: enemy.y + enemy.height / 2,
              radius: 0,
              maxRadius: ENEMY_TYPES.BOMBER.explodeRadius,
              life: 30,
              maxLife: 30,
              damage: ENEMY_TYPES.BOMBER.explodeDamage
            });
            
            soundManagerRef.current.playExplosion();
            game.screenShake.intensity = 10; // Screen shake on explosion
            
            // Check if player is in explosion range and not shielded
            const distToPlayer = Math.sqrt(
              Math.pow(game.player.x + game.player.width/2 - (enemy.x + enemy.width/2), 2) + 
              Math.pow(game.player.y + game.player.height/2 - (enemy.y + enemy.height/2), 2)
            );
            if (distToPlayer < ENEMY_TYPES.BOMBER.explodeRadius && !hasShield) {
              game.health -= ENEMY_TYPES.BOMBER.explodeDamage;
              game.damageThisWave += ENEMY_TYPES.BOMBER.explodeDamage;
              setHealth(Math.max(0, game.health));
            }
            
            enemy.health = 0;
          }
        } else if (enemy.type === 'Teleporter') {
          enemy.teleportCooldown--;
          
          if (enemy.teleportCooldown <= 0) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 150 + Math.random() * 100;
            enemy.x = game.player.x + Math.cos(angle) * distance;
            enemy.y = game.player.y + Math.sin(angle) * distance;
            
            enemy.x = Math.max(0, Math.min(canvas.width - enemy.width, enemy.x));
            enemy.y = Math.max(0, Math.min(canvas.height - enemy.height, enemy.y));
            
            enemy.teleportCooldown = ENEMY_TYPES.TELEPORTER.teleportInterval;
            
            soundManagerRef.current.playTeleport();
            
            for (let i = 0; i < 20; i++) {
              const angle = (Math.PI * 2 * i) / 20;
              game.particles.push({
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4,
                life: 30,
                maxLife: 30,
                color: enemy.color,
                size: 4,
                alpha: 1
              });
            }
          } else {
            enemy.x += (dx / dist) * enemy.speed;
            enemy.y += (dy / dist) * enemy.speed;
          }
        }
      }
      
      // Melee damage
      if (enemy.damage > 0 && !hasShield) {
        if (
          enemy.x < game.player.x + game.player.width &&
          enemy.x + enemy.width > game.player.x &&
          enemy.y < game.player.y + game.player.height &&
          enemy.y + enemy.height > game.player.y
        ) {
          game.health -= enemy.damage;
          game.damageThisWave += enemy.damage;
          setHealth(Math.max(0, game.health));
          game.screenShake.intensity = 5; // Screen shake when hit
        }
      }
    });
    
    // Update enemy projectiles with trails
    game.enemyProjectiles = game.enemyProjectiles.filter(projectile => {
      projectile.x += projectile.vx;
      projectile.y += projectile.vy;
      
      // Add trail
      projectile.trail.push({ x: projectile.x, y: projectile.y, life: 10 });
      projectile.trail = projectile.trail.filter(t => t.life-- > 0);
      
      const dx = projectile.x - (game.player.x + game.player.width / 2);
      const dy = projectile.y - (game.player.y + game.player.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < projectile.radius + game.player.width / 2) {
        if (!hasShield) {
          game.health -= projectile.damage;
          game.damageThisWave += projectile.damage;
          setHealth(Math.max(0, game.health));
          game.screenShake.intensity = 5;
        }
        return false;
      }
      
      return projectile.x > 0 && projectile.x < canvas.width && projectile.y > 0 && projectile.y < canvas.height;
    });
    
    // Update player spells with trails and critical hit chance
    game.spells = game.spells.filter(spell => {
      spell.x += spell.vx;
      spell.y += spell.vy;
      
      // Add trail
      spell.trail.push({ x: spell.x, y: spell.y, life: 15 });
      spell.trail = spell.trail.filter(t => t.life-- > 0);
      
      let hit = false;
      game.enemies = game.enemies.filter(enemy => {
        const dx = spell.x - (enemy.x + enemy.width / 2);
        const dy = spell.y - (enemy.y + enemy.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < spell.radius + enemy.width / 2) {
          // Critical hit chance (15%)
          const isCritical = Math.random() < 0.15;
          const damage = isCritical ? 2 : 1; // Base spell damage is 1
          enemy.health -= damage;
          hit = true;
          
          soundManagerRef.current.playHit();
          
          // Enhanced hit particles
          const particleCount = isCritical ? 20 : 12;
          for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            game.particles.push({
              x: enemy.x + enemy.width / 2,
              y: enemy.y + enemy.height / 2,
              vx: Math.cos(angle) * (isCritical ? 5 : 3),
              vy: Math.sin(angle) * (isCritical ? 5 : 3),
              life: isCritical ? 30 : 20,
              maxLife: isCritical ? 30 : 20,
              color: isCritical ? '#ffff00' : enemy.color,
              size: isCritical ? 5 : 3,
              alpha: 1
            });
          }
          
          // Floating damage text
          game.floatingTexts.push({
            text: isCritical ? 'CRIT!' : '-' + damage,
            x: enemy.x + enemy.width / 2,
            y: enemy.y,
            vy: -2,
            life: 40,
            maxLife: 40,
            color: isCritical ? '#ffff00' : '#ffffff',
            size: isCritical ? 20 : 14
          });
          
          if (isCritical) {
            game.screenShake.intensity = 3;
          }
          
          if (enemy.health <= 0) {
            const scoreMultiplier = game.activePowerups.find(p => p.effect === 'scoreMultiplier');
            const points = scoreMultiplier ? enemy.points * scoreMultiplier.multiplier : enemy.points;
            game.score += points;
            setScore(game.score);
            game.killsThisWave++;
            
            if (enemy.isBoss) {
              game.bossActive = false;
              game.currentBoss = null;
              setCurrentBoss(null);
              soundManagerRef.current.playVictory();
              game.screenShake.intensity = 20; // Big shake for boss defeat
            } else {
              soundManagerRef.current.playEnemyDeath();
            }
            
            // Enhanced death particles
            const deathParticleCount = enemy.isBoss ? 80 : 25;
            for (let i = 0; i < deathParticleCount; i++) {
              game.particles.push({
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2,
                vx: (Math.random() - 0.5) * (enemy.isBoss ? 12 : 8),
                vy: (Math.random() - 0.5) * (enemy.isBoss ? 12 : 8),
                life: enemy.isBoss ? 70 : 50,
                maxLife: enemy.isBoss ? 70 : 50,
                color: enemy.color,
                size: enemy.isBoss ? 7 : 4,
                alpha: 1
              });
            }
            
            // Score popup
            game.floatingTexts.push({
              text: '+' + points,
              x: enemy.x + enemy.width / 2,
              y: enemy.y,
              vy: -1.5,
              life: 50,
              maxLife: 50,
              color: '#00ff00',
              size: enemy.isBoss ? 24 : 16
            });
            
            return false;
          }
        }
        return true;
      });
      
      return !hit && spell.x > 0 && spell.x < canvas.width && spell.y > 0 && spell.y < canvas.height;
    });
    
    game.explosions = game.explosions.filter(explosion => {
      explosion.life--;
      explosion.radius = (1 - explosion.life / explosion.maxLife) * explosion.maxRadius;
      
      // Enhanced explosion particles
      if (explosion.life % 2 === 0) {
        const angle = Math.random() * Math.PI * 2;
        game.particles.push({
          x: explosion.x + Math.cos(angle) * explosion.radius,
          y: explosion.y + Math.sin(angle) * explosion.radius,
          vx: Math.cos(angle) * 3,
          vy: Math.sin(angle) * 3,
          life: 25,
          maxLife: 25,
          color: ['#f97316', '#ef4444', '#fb923c'][Math.floor(Math.random() * 3)],
          size: Math.random() * 5 + 3,
          alpha: 1
        });
      }
      
      return explosion.life > 0;
    });
    
    game.portals = game.portals.filter(portal => {
      portal.life--;
      portal.rotation += 0.1;
      return portal.life > 0;
    });
    
    // Update particles with alpha fade
    game.particles = game.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      particle.alpha = particle.life / particle.maxLife; // Fade out
      return particle.life > 0;
    });
    
    // Update floating texts
    game.floatingTexts = game.floatingTexts.filter(text => {
      text.y += text.vy;
      text.life--;
      return text.life > 0;
    });
    
    if (game.portalCooldown > 0) game.portalCooldown--;
    if (game.shootCooldown > 0) game.shootCooldown--;
  };

  const render = (ctx) => {
    const game = gameDataRef.current;
    const canvas = canvasRef.current;
    
    // Apply screen shake
    ctx.save();
    ctx.translate(game.screenShake.x, game.screenShake.y);
    
    // Draw background image with intensity overlay
    if (backgroundLoadedRef.current) {
      ctx.drawImage(backgroundImageRef.current, 0, 0, canvas.width, canvas.height);
      
      // Add intensity overlay
      const pulseIntensity = game.backgroundPulse * 0.3; // Scale by 0.3 for a more subtle overlay
      ctx.fillStyle = `rgba(157, 78, 221, ${pulseIntensity})`; // Using a purple tint
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      // Fallback gradient background
      const pulseIntensity = Math.sin(Date.now() / 500) * game.backgroundPulse * 20; // Scale by 20 for more noticeable pulse
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, `rgb(${Math.floor(10 + pulseIntensity)}, ${Math.floor(14 + pulseIntensity)}, ${Math.floor(39 + pulseIntensity)})`);
      gradient.addColorStop(1, `rgb(${Math.floor(26 + pulseIntensity)}, ${Math.floor(9 + pulseIntensity)}, ${Math.floor(51 + pulseIntensity)})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Animated stars (lighter now to show over background)
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const x = (i * 157) % canvas.width;
      const y = (i * 211) % canvas.height;
      const twinkle = Math.sin((Date.now() / 1000) + i) * 0.3 + 0.5; // Oscillate between 0.2 and 0.8 alpha
      ctx.globalAlpha = twinkle * 0.4; // Reduced from 0.8 for lighter stars
      ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;

    // Draw mobile joystick indicator
    if (game.touch.active) {
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(game.touch.startX, game.touch.startY, 50, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(game.touch.currentX, game.touch.currentY, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    
    // Draw power-ups with enhanced visuals
    game.powerups.forEach(powerup => {
      ctx.save();
      ctx.translate(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2);
      ctx.rotate(powerup.rotation);
      
      // Multi-layer glow
      const pulseSize = Math.sin(powerup.pulse) * 8 + 45; // Max 53 size
      for (let i = 0; i < 3; i++) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize - i * 10);
        gradient.addColorStop(0, powerup.type.color + Math.floor(100 - i * 30).toString(16)); // Fade out layers
        gradient.addColorStop(1, powerup.type.color + '00');
        ctx.fillStyle = gradient;
        ctx.fillRect(-(pulseSize - i * 10), -(pulseSize - i * 10), (pulseSize - i * 10) * 2, (pulseSize - i * 10) * 2);
      }
      
      ctx.fillStyle = powerup.type.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = powerup.type.color;
      ctx.fillRect(-powerup.width / 2, -powerup.height / 2, powerup.width, powerup.height);
      ctx.shadowBlur = 0;
      
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(powerup.type.icon, 0, 0);
      
      ctx.restore();
    });
    
    // Portals
    game.portals.forEach(portal => {
      ctx.save();
      ctx.translate(portal.x, portal.y);
      ctx.rotate(portal.rotation);
      
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, portal.radius);
      gradient.addColorStop(0, 'rgba(157, 78, 221, 0.8)');
      gradient.addColorStop(0.5, 'rgba(157, 78, 221, 0.4)');
      gradient.addColorStop(1, 'rgba(157, 78, 221, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(-portal.radius, -portal.radius, portal.radius * 2, portal.radius * 2);
      
      ctx.strokeStyle = '#9d4edd';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, portal.radius * 0.7, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.restore();
    });
    
    // Enhanced explosions
    game.explosions.forEach(explosion => {
      ctx.globalAlpha = explosion.life / explosion.maxLife;
      
      // Multiple explosion layers
      const gradient1 = ctx.createRadialGradient(explosion.x, explosion.y, 0, explosion.x, explosion.y, explosion.radius);
      gradient1.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      gradient1.addColorStop(0.3, 'rgba(249, 115, 22, 0.8)');
      gradient1.addColorStop(0.6, 'rgba(239, 68, 68, 0.4)');
      gradient1.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = gradient1;
      ctx.beginPath();
      ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.globalAlpha = 1;
    });
    
    // Enhanced particles with trails
    game.particles.forEach(particle => {
      ctx.globalAlpha = particle.alpha; // Use particle's own alpha
      ctx.fillStyle = particle.color;
      ctx.shadowBlur = 5;
      ctx.shadowColor = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;
    
    const hasShield = game.activePowerups.some(p => p.effect === 'shield');
    const hasSpeed = game.activePowerups.some(p => p.effect === 'speed');
    const hasRapidFire = game.activePowerups.some(p => p.effect === 'rapidFire');
    const hasScoreMultiplier = game.activePowerups.some(p => p.effect === 'scoreMultiplier');
    
    // Draw player with enhanced effects
    ctx.save();
    
    // Power-up visual indicators
    if (hasSpeed) {
      // Speed trails
      const trailGradient = ctx.createRadialGradient(
        game.player.x + game.player.width / 2, 
        game.player.y + game.player.height / 2, 
        0, 
        game.player.x + game.player.width / 2, 
        game.player.y + game.player.height / 2, 
        60
      );
      trailGradient.addColorStop(0, 'rgba(251, 191, 36, 0.3)');
      trailGradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = trailGradient;
      ctx.fillRect(game.player.x - 30, game.player.y - 30, 120, 120);
    }
    
    if (hasShield) {
      // Animated shield
      const shieldPulse = Math.sin(Date.now() / 200) * 5 + 45; // Oscillate radius
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.7;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#3b82f6';
      ctx.beginPath();
      ctx.arc(game.player.x + game.player.width / 2, game.player.y + game.player.height / 2, shieldPulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
    
    if (hasRapidFire) {
      // Fire aura
      const fireGradient = ctx.createRadialGradient(
        game.player.x + game.player.width / 2, 
        game.player.y + game.player.height / 2, 
        0, 
        game.player.x + game.player.width / 2, 
        game.player.y + game.player.height / 2, 
        50
      );
      fireGradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
      fireGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      ctx.fillStyle = fireGradient;
      ctx.fillRect(game.player.x - 25, game.player.y - 25, 110, 110);
    }
    
    if (hasScoreMultiplier) {
      // Star particles orbiting
      for (let i = 0; i < 5; i++) {
        const angle = (Date.now() / 500 + i * (Math.PI * 2 / 5)) % (Math.PI * 2);
        const orbitX = game.player.x + game.player.width / 2 + Math.cos(angle) * 50;
        const orbitY = game.player.y + game.player.height / 2 + Math.sin(angle) * 50;
        ctx.fillStyle = '#a855f7';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#a855f7';
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    
    // Player Glow
    const playerGlow = ctx.createRadialGradient(
      game.player.x + game.player.width / 2, 
      game.player.y + game.player.height / 2, 
      0, 
      game.player.x + game.player.width / 2, 
      game.player.y + game.player.height / 2, 
      40
    );
    playerGlow.addColorStop(0, 'rgba(59, 130, 246, 0.6)');
    playerGlow.addColorStop(1, 'rgba(59, 130, 246, 0)');
    ctx.fillStyle = playerGlow;
    // The glow should cover around the player
    ctx.fillRect(game.player.x - 20, game.player.y - 20, 100, 100);
    
    // Draw character sprite
    if (imagesLoadedRef.current) {
      const sprite = game.attackAnimationTimer > 0 ? attackImageRef.current : idleImageRef.current;
      const spriteWidth = 90;
      const spriteHeight = 90;
      
      const drawX = game.player.x + game.player.width / 2 - spriteWidth / 2;
      const drawY = game.player.y + game.player.height / 2 - spriteHeight / 2;
      
      ctx.drawImage(
        sprite,
        drawX,
        drawY,
        spriteWidth,
        spriteHeight
      );
    }
    
    ctx.restore();
    
    // Draw spell trails
    game.spells.forEach(spell => {
      // Trail
      spell.trail.forEach((point) => {
        ctx.globalAlpha = (point.life / 15) * 0.5; // Fade trail
        ctx.fillStyle = spell.color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, spell.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      
      // Main spell
      ctx.shadowBlur = 20;
      ctx.shadowColor = spell.color;
      ctx.fillStyle = spell.color;
      ctx.beginPath();
      ctx.arc(spell.x, spell.y, spell.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Bright core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(spell.x, spell.y, spell.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    
    // Draw enemy projectile trails
    game.enemyProjectiles.forEach(projectile => {
      // Trail
      projectile.trail.forEach((point) => {
        ctx.globalAlpha = (point.life / 10) * 0.4; // Fade trail
        ctx.fillStyle = projectile.color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, projectile.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      
      // Main projectile
      ctx.shadowBlur = 15;
      ctx.shadowColor = projectile.color;
      ctx.fillStyle = projectile.color;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
    
    // Draw enemies with sprites - BIGGER SIZE
    game.enemies.forEach(enemy => {
      // Draw enemy sprite if loaded
      if (enemySpritesLoadedRef.current && enemySpritesRef.current[enemy.type]) {
        const sprite = enemySpritesRef.current[enemy.type];
        const spriteWidth = enemy.isBoss ? enemy.width * 1.5 : enemy.width * 1.6; // Increased from 1.2 and 1.3
        const spriteHeight = enemy.isBoss ? enemy.height * 1.5 : enemy.height * 1.6; // Increased from 1.2 and 1.3
        
        // Boss glow effect
        if (enemy.isBoss) {
          ctx.save();
          const pulseSize = Math.sin(Date.now() / 200) * 10 + enemy.width / 2 + 20;
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = enemy.color;
          ctx.shadowBlur = 30;
          ctx.shadowColor = enemy.color;
          ctx.beginPath();
          ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, pulseSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
          ctx.restore();
        }
        
        // Teleporter fade effect
        if (enemy.type === 'Teleporter' && enemy.teleportCooldown < 30) {
          ctx.globalAlpha = 0.5;
        }
        
        // Draw sprite centered
        ctx.drawImage(
          sprite,
          enemy.x + enemy.width / 2 - spriteWidth / 2,
          enemy.y + enemy.height / 2 - spriteHeight / 2,
          spriteWidth,
          spriteHeight
        );
        
        ctx.globalAlpha = 1;
      }
      
      // Health bar
      const barWidth = enemy.width;
      const barHeight = enemy.isBoss ? 6 : 4;
      const barY = enemy.isBoss ? enemy.y - 15 : enemy.y - 10;
      
      ctx.fillStyle = '#333';
      ctx.fillRect(enemy.x, barY, barWidth, barHeight);
      const healthPercent = enemy.health / enemy.maxHealth;
      ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#fbbf24' : '#ef4444';
      ctx.fillRect(enemy.x, barY, barWidth * healthPercent, barHeight);
      
      // Boss name label
      if (enemy.isBoss) {
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText(enemy.type, enemy.x + enemy.width / 2, enemy.y - 25);
        ctx.fillText(enemy.type, enemy.x + enemy.width / 2, enemy.y - 25);
      }
    });
    
    // Draw floating texts (damage numbers, crits, etc.)
    game.floatingTexts.forEach(text => {
      ctx.globalAlpha = text.life / text.maxLife; // Fade out text
      ctx.font = `bold ${text.size}px Arial`;
      ctx.fillStyle = text.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.strokeText(text.text, text.x, text.y);
      ctx.fillText(text.text, text.x, text.y);
    });
    ctx.globalAlpha = 1; // Reset alpha after drawing floating texts
    
    ctx.restore(); // Restore from screen shake
  };

  // Mobile shoot button handler
  const handleMobileShoot = () => {
    const game = gameDataRef.current;
    const canvas = canvasRef.current;
    
    // Auto-aim at nearest enemy
    let nearestEnemy = null;
    let minDist = Infinity;
    const playerCenterX = game.player.x + game.player.width / 2;
    const playerCenterY = game.player.y + game.player.height / 2;
    
    game.enemies.forEach(enemy => {
      const dx = (enemy.x + enemy.width / 2) - playerCenterX;
      const dy = (enemy.y + enemy.height / 2) - playerCenterY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        nearestEnemy = enemy;
      }
    });
    
    if (nearestEnemy) {
      const targetX = nearestEnemy.x + nearestEnemy.width / 2;
      const targetY = nearestEnemy.y + nearestEnemy.height / 2;
      shootSpellTowards(targetX, targetY);
    } else if (canvas) { // If no enemy, shoot towards center of canvas
      shootSpellTowards(canvas.width / 2, canvas.height / 2);
    }
  };
  
  const handleMobilePortal = () => {
    const game = gameDataRef.current;
    openPortalAt(game.player.x + game.player.width / 2, game.player.y + game.player.height / 2);
  };

  const winnerPlayer = session?.winner_id ? players.find(p => p.id === session.winner_id) : null;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6903a224f167f192bff79bf5/4936276f9_BackgroundPixelart.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="relative z-10 w-full max-w-6xl">
        {gameState === 'setup' && (
          <Card className="p-8 max-w-md w-full mx-auto bg-slate-800/90 backdrop-blur-xl border-purple-500/50">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                  Jeff the Robot Wizard
                </h1>
                <p className="text-cyan-300 text-lg">Multiplayer Portal Battle</p>
              </div>
              
              <div className="space-y-4 text-left bg-slate-900/50 p-6 rounded-lg border border-purple-500/30">
                <h2 className="text-xl font-semibold text-purple-300">How to Play:</h2>
                <div className="space-y-2 text-slate-300">
                  <p><span className="text-cyan-400 font-semibold">WASD</span> - Move Jeff</p>
                  <p><span className="text-cyan-400 font-semibold">LEFT CLICK</span> - Fire spells</p>
                  <p><span className="text-cyan-400 font-semibold">RIGHT CLICK</span> - Open portals</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <h3 className="text-sm font-semibold text-purple-300 mb-2">Enemy Types:</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#ff006e]" />
                      <span>Chaser</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#fbbf24]" />
                      <span>Speedy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#10b981] rounded-full" />
                      <span>Ranged</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#8b5cf6]" />
                      <span>Tank</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#f97316] rounded-full" />
                      <span>Bomber</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#ec4899] rotate-45" />
                      <span>Teleporter</span>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-purple-300 mt-4 mb-2">Boss Types:</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#7c3aed] border border-white" />
                      <span>Mega Tank</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#06b6d4] rounded-full border border-white" />
                      <span>Spell Master</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#d946ef] rotate-45 border border-white" />
                      <span>Portal Lord</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handlePracticeMode}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 text-lg"
              >
                🎮 Practice Mode (Solo)
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-800 px-2 text-slate-400">Or Play Multiplayer</span>
                </div>
              </div>
              
              <div className="space-y-4 text-left">
                <div>
                  <Label htmlFor="playerName" className="text-purple-300">Your Name</Label>
                  <Input
                    id="playerName"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-slate-900/50 border-purple-500/50 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="promoLink" className="text-purple-300">Your Promotional Link</Label>
                  <Input
                    id="promoLink"
                    value={promoLink}
                    onChange={(e) => setPromoLink(e.target.value)}
                    placeholder="https://twitter.com/yourhandle"
                    className="bg-slate-900/50 border-purple-500/50 text-white"
                  />
                  <p className="text-xs text-slate-400 mt-1">Winner's link will be promoted!</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleCreateGame}
                  disabled={!playerName || !promoLink}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-6"
                >
                  Create New Game
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-800 px-2 text-slate-400">Or</span>
                  </div>
                </div>
                
                <Input
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value)}
                  placeholder="Enter game code"
                  className="bg-slate-900/50 border-purple-500/50 text-white text-center text-lg"
                />
                
                <Button 
                  onClick={handleJoinGame}
                  disabled={!playerName || !promoLink || !sessionCode}
                  variant="outline"
                  className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20 py-6"
                >
                  Join Game
                </Button>
              </div>
            </div>
          </Card>
        )}
        
        {gameState === 'lobby' && (
          <Lobby 
            session={session}
            players={players}
            currentPlayerId={currentPlayerId}
            onStartGame={handleStartGame}
          />
        )}
        
        {gameState === 'playing' && (
          <div className="relative flex flex-col items-center gap-4">
            <canvas 
              ref={canvasRef} 
              width={800} 
              height={600}
              className="border-4 border-purple-500/50 rounded-lg shadow-2xl shadow-purple-500/50 cursor-crosshair touch-none"
            />
            <GameHUD 
              health={health} 
              score={score} 
              portalReady={gameDataRef.current.portalCooldown <= 0}
              players={practiceMode ? [] : players}
              waveNumber={gameDataRef.current.waveNumber}
              activePowerups={activePowerups}
              currentBoss={currentBoss}
              difficultyMultiplier={gameDataRef.current.difficultyMultiplier}
            />
            
            {/* Mobile Controls */}
            <div className="flex gap-4 md:hidden">
              <Button
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleMobileShoot();
                }}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-8 px-12 text-xl rounded-full shadow-lg"
              >
                🔮 SHOOT
              </Button>
              <Button
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleMobilePortal();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-8 px-12 text-xl rounded-full shadow-lg"
              >
                🌀 PORTAL
              </Button>
            </div>
            
            {/* Instructions for mobile */}
            <div className="md:hidden text-center text-slate-300 text-sm space-y-1">
              <p>👆 Touch and drag on screen to move</p>
              <p>Tap buttons to attack</p>
            </div>
          </div>
        )}
        
        {gameState === 'gameover' && practiceMode && (
          <Card className="p-8 max-w-md w-full mx-auto bg-slate-800/90 backdrop-blur-xl border-purple-500/50 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-purple-600">
                  Game Over
                </h1>
                <p className="text-slate-400">Practice makes perfect!</p>
              </div>
              
              <div className="bg-slate-900/50 p-6 rounded-lg border border-purple-500/30">
                <div className="text-sm text-slate-400 mb-2">FINAL SCORE</div>
                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                  {score}
                </div>
                <div className="text-sm text-slate-400 mt-4">Wave {gameDataRef.current.waveNumber}</div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    soundManagerRef.current.startBackgroundMusic();
                    setGameState('playing');
                  }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-6 text-lg"
                >
                  Try Again
                </Button>
                
                <Button 
                  onClick={() => {
                    setGameState('setup');
                    setPracticeMode(false);
                  }}
                  variant="outline"
                  className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20 py-6 text-lg"
                >
                  Main Menu
                </Button>
              </div>
            </div>
          </Card>
        )}
        
        {gameState === 'gameover' && !practiceMode && winnerPlayer && (
          <GameOverScreen 
            score={score}
            winnerName={winnerPlayer.player_name}
            winnerLink={winnerPlayer.promotional_link}
            isWinner={winnerPlayer.id === currentPlayerId}
            onRestart={() => {
              setGameState('setup');
              setCurrentSessionId(null);
              setCurrentPlayerId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
