// Sound Manager using Web Audio API for procedural sound generation
export class SoundManager {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.isInitialized = false;
    this.musicOscillators = [];
    this.isMusicPlaying = false;
    this.currentMelodyIndex = 0;
  }

  init() {
    if (this.isInitialized) return;
    
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      
      // Master gain
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.context.destination);
      
      // Music gain
      this.musicGain = this.context.createGain();
      this.musicGain.gain.value = 0.15;
      this.musicGain.connect(this.masterGain);
      
      // SFX gain
      this.sfxGain = this.context.createGain();
      this.sfxGain.gain.value = 0.4;
      this.sfxGain.connect(this.masterGain);
      
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  playShoot() {
    if (!this.isInitialized) return;
    
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playPortal() {
    if (!this.isInitialized) return;
    
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.6);
    
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.6);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(now);
    osc.stop(now + 0.6);
  }

  playEnemySpawn() {
    if (!this.isInitialized) return;
    
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playEnemyDeath() {
    if (!this.isInitialized) return;
    
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playExplosion() {
    if (!this.isInitialized) return;
    
    const now = this.context.currentTime;
    
    // Create noise for explosion
    const bufferSize = this.context.sampleRate * 0.5;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.context.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(50, now + 0.5);
    
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    
    noise.start(now);
    noise.stop(now + 0.5);
  }

  playHit() {
    if (!this.isInitialized) return;
    
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playPlayerHurt() {
    if (!this.isInitialized) return;
    
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
    
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playWaveStart() {
    if (!this.isInitialized) return;
    
    const now = this.context.currentTime;
    
    // Play ascending arpeggio
    const notes = [262, 330, 392, 523]; // C, E, G, C (octave)
    
    notes.forEach((freq, i) => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      osc.type = 'square';
      osc.frequency.value = freq;
      
      const startTime = now + i * 0.1;
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
      
      osc.connect(gain);
      gain.connect(this.sfxGain);
      
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  playGameOver() {
    if (!this.isInitialized) return;
    
    const now = this.context.currentTime;
    
    // Play descending arpeggio
    const notes = [523, 392, 330, 262]; // C, G, E, C (descending)
    
    notes.forEach((freq, i) => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const startTime = now + i * 0.15;
      gain.gain.setValueAtTime(0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      
      osc.connect(gain);
      gain.connect(this.sfxGain);
      
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  playVictory() {
    if (!this.isInitialized) return;
    
    const now = this.context.currentTime;
    
    // Play triumphant fanfare
    const melody = [
      { freq: 392, time: 0 },
      { freq: 392, time: 0.15 },
      { freq: 392, time: 0.3 },
      { freq: 523, time: 0.5 },
    ];
    
    melody.forEach(note => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      osc.type = 'square';
      osc.frequency.value = note.freq;
      
      const startTime = now + note.time;
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);
      
      osc.connect(gain);
      gain.connect(this.sfxGain);
      
      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }

  playTeleport() {
    if (!this.isInitialized) return;
    
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.2);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.2);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start(now);
    osc.stop(now + 0.2);
  }

  startBackgroundMusic() {
    if (!this.isInitialized || this.isMusicPlaying) return;
    
    this.isMusicPlaying = true;
    this.currentMelodyIndex = 0;
    this.playMusicLoop();
  }

  playMusicLoop() {
    if (!this.isMusicPlaying) return;
    
    const now = this.context.currentTime;
    
    // Simple melody pattern (mystical/arcade style)
    const melody = [
      { freq: 523, duration: 0.25 }, // C
      { freq: 659, duration: 0.25 }, // E
      { freq: 784, duration: 0.25 }, // G
      { freq: 659, duration: 0.25 }, // E
      { freq: 698, duration: 0.25 }, // F
      { freq: 784, duration: 0.25 }, // G
      { freq: 880, duration: 0.5 },  // A
      { freq: 784, duration: 0.25 }, // G
    ];
    
    const bassLine = [
      { freq: 131, duration: 0.5 }, // C
      { freq: 165, duration: 0.5 }, // E
      { freq: 147, duration: 0.5 }, // D
      { freq: 196, duration: 0.5 }, // G
    ];
    
    let timeOffset = 0;
    
    // Play melody
    melody.forEach(note => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      osc.type = 'square';
      osc.frequency.value = note.freq;
      
      gain.gain.setValueAtTime(0.1, now + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.01, now + timeOffset + note.duration);
      
      osc.connect(gain);
      gain.connect(this.musicGain);
      
      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + note.duration);
      
      timeOffset += note.duration;
    });
    
    // Play bass line
    timeOffset = 0;
    bassLine.forEach(note => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      
      osc.type = 'triangle';
      osc.frequency.value = note.freq;
      
      gain.gain.setValueAtTime(0.15, now + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.01, now + timeOffset + note.duration);
      
      osc.connect(gain);
      gain.connect(this.musicGain);
      
      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + note.duration);
      
      timeOffset += note.duration;
    });
    
    // Schedule next loop
    const loopDuration = melody.reduce((sum, note) => sum + note.duration, 0);
    setTimeout(() => this.playMusicLoop(), loopDuration * 1000);
  }

  stopBackgroundMusic() {
    this.isMusicPlaying = false;
    this.musicOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.musicOscillators = [];
  }

  setMasterVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }

  setMusicVolume(volume) {
    if (this.musicGain) {
      this.musicGain.gain.value = volume;
    }
  }

  setSFXVolume(volume) {
    if (this.sfxGain) {
      this.sfxGain.gain.value = volume;
    }
  }
}

export default SoundManager;