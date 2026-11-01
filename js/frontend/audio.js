/**
 * @file audio.js
 * Procedural Web Audio API sound synthesizer for Municipal Carbon Assessor.
 *
 * Implements tactile audio effects without external audio dependencies:
 * - Mechanical stamp impact thud (APPROVE, FINE, GRANT)
 * - Bright positive chime for correct decisions
 * - Harsh buzzer for incorrect actions
 * - Subtle paper rustle when loading citizen cases
 * - Mechanical click for calculator and receipt interactions
 * - Shift start / transition chime
 *
 * Includes autoplay handling and mute state persistence.
 */

class SoundEngine {
  constructor() {
    /** @type {AudioContext|null} */
    this.ctx = null;
    this.muted = false;

    // Check localStorage for persisted mute preference
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem('mca_sound_muted');
        if (saved !== null) {
          this.muted = saved === 'true';
        }
      } catch (_) {
        // Ignore localStorage restrictions
      }
    }
  }

  /**
   * Initializes or resumes the AudioContext on first user interaction.
   * Gracefully handles browser autoplay restrictions.
   *
   * @returns {boolean} true if AudioContext is active
   */
  init() {
    if (typeof window === 'undefined') return false;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;

    if (!this.ctx) {
      try {
        this.ctx = new AudioContextClass();
      } catch (e) {
        console.warn('[AudioEngine] Could not initialize AudioContext:', e.message);
        return false;
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return true;
  }

  /**
   * Checks if sound is currently muted.
   *
   * @returns {boolean}
   */
  isMuted() {
    return this.muted;
  }

  /**
   * Sets mute state and persists to localStorage.
   *
   * @param {boolean} muted
   */
  setMuted(muted) {
    this.muted = Boolean(muted);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('mca_sound_muted', String(this.muted));
      } catch (_) {}
    }
  }

  /**
   * Toggles mute state.
   *
   * @returns {boolean} New mute state
   */
  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * Mechanical rubber stamp impact thud.
   *
   * @param {'APPROVE'|'FINE'|'GRANT'} [type='APPROVE']
   */
  playStamp(type = 'APPROVE') {
    if (this.muted || !this.init() || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch variation based on stamp weight
      const baseFreq = type === 'FINE' ? 95 : type === 'GRANT' ? 140 : 120;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.18);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      // Lowpass filter for muffled heavy physical desk impact
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch (_) {}
  }

  /**
   * Bright rising duo-tone chime for correct audit decision.
   */
  playSuccess() {
    if (this.muted || !this.init() || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.09); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.18); // G5

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (_) {}
  }

  /**
   * Harsh low saw buzz for incorrect decision / penalty.
   */
  playError() {
    if (this.muted || !this.init() || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.setValueAtTime(95, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.32);
    } catch (_) {}
  }

  /**
   * Subtle paper rustle / slide sound when loading a new dossier or flipping records.
   */
  playPaper() {
    if (this.muted || !this.init() || !this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * 0.12; // 120ms
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch (_) {}
  }

  /**
   * Short mechanical click for calculator, tabs, or receipt row tap.
   */
  playClick() {
    if (this.muted || !this.init() || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (_) {}
  }

  /**
   * Shift start or conclusion chime.
   */
  playTransition() {
    if (this.muted || !this.init() || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25); // A5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (_) {}
  }
}

export const soundEngine = new SoundEngine();

