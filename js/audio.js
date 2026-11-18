// Web Audio API sound cues + optional Russian Web Speech API voice coach

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.voiceEnabled = false;
  }

  configure({ soundEnabled, voiceEnabled }) {
    if (typeof soundEnabled === 'boolean') this.soundEnabled = soundEnabled;
    if (typeof voiceEnabled === 'boolean') this.voiceEnabled = voiceEnabled;
  }

  ensureContext() {
    if (!this.soundEnabled) return null;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  tone(freq, duration = 0.12, type = 'sine', gainVal = 0.18, delay = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainVal, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playTick() {
    this.tone(660, 0.09, 'triangle', 0.16);
  }

  playGo() {
    this.tone(587.33, 0.12, 'triangle', 0.18, 0);
    this.tone(880, 0.24, 'triangle', 0.22, 0.11);
  }

  playRest() {
    this.tone(523.25, 0.14, 'sine', 0.16, 0);
    this.tone(392.0, 0.24, 'sine', 0.16, 0.14);
  }

  playFinish() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.tone(n, 0.22, 'triangle', 0.2, idx * 0.11);
    });
  }

  speak(text) {
    if (!this.voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ru-RU';
      utter.rate = 1.05;
      const voices = window.speechSynthesis.getVoices();
      const ruVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('ru'));
      if (ruVoice) utter.voice = ruVoice;
      window.speechSynthesis.speak(utter);
    } catch {
      // Ignore speech synthesis errors on unsupported browsers
    }
  }
}

export const soundEngine = new SoundEngine();
