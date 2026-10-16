/**
 * ROOM S A — High-Performance Low-Latency Central Audio Manager
 * Synthesizes lightweight, zero-latency procedural cues via Web Audio API.
 * Features dedicated volume buses (Master, SFX, Ambience), throttling for rapid events
 * (footsteps, hover raycasting), graceful autoplay unlock, and persistent settings.
 */

export interface AudioSettings {
  masterVolume: number;   // 0.0 to 1.0
  sfxVolume: number;      // 0.0 to 1.0
  ambienceVolume: number; // 0.0 to 1.0
  muted: boolean;
}

const SETTINGS_KEY = 'room_sa_audio_settings_v3';

const DEFAULT_SETTINGS: AudioSettings = {
  masterVolume: 0.25,   // 25% default
  sfxVolume: 0.25,      // 25% default
  ambienceVolume: 0.0,  // 0% - background music/ambience OFF by default
  muted: false,
};

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;

  // Background ambience nodes
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private isAmbienceRunning = false;

  // Throttling timers
  private lastFootstepTime = 0;
  private lastHoverTime = 0;
  private lastHoverTarget = '';
  private lastKeystrokeTime = 0;

  private settings: AudioSettings = DEFAULT_SETTINGS;

  constructor() {
    this.loadSettings();
  }

  private loadSettings(): void {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore sandboxed environments
    }
  }

  private saveSettings(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch {
      // Ignore
    }
  }

  /**
   * Lazily initializes the Web Audio Context on the first valid user gesture.
   */
  public ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();

        // Build Gain Bus Hierarchy:
        // [SFX] ------> [Master] ------> [Destination]
        // [Ambience] -> [Master]
        this.masterGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.ambienceGain = this.ctx.createGain();

        this.updateGainLevels();

        this.sfxGain.connect(this.masterGain);
        this.ambienceGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  private updateGainLevels(): void {
    if (!this.ctx || !this.masterGain || !this.sfxGain || !this.ambienceGain) return;
    const now = this.ctx.currentTime;
    const masterVal = this.settings.muted ? 0 : this.settings.masterVolume;
    this.masterGain.gain.setValueAtTime(masterVal, now);
    this.sfxGain.gain.setValueAtTime(this.settings.sfxVolume, now);
    this.ambienceGain.gain.setValueAtTime(this.settings.ambienceVolume, now);
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public setSettings(partial: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...partial };
    this.saveSettings();
    this.updateGainLevels();
  }

  public toggleMute(): boolean {
    this.setSettings({ muted: !this.settings.muted });
    return this.settings.muted;
  }

  public isMuted(): boolean {
    return this.settings.muted;
  }

  // ==========================================================
  // Ambient Chamber Soundscape (Drone completely disabled)
  // Background music/ambience is OFF by default. No continuous synth buzzing.
  // ==========================================================
  public startAmbience(): void {
    // Continuous ambient buzzing/drone permanently removed at the source.
    // Silence is strictly preferred to annoying continuous synth tones.
    this.isAmbienceRunning = false;
  }

  public stopAmbience(): void {
    if (!this.isAmbienceRunning) return;
    try {
      this.ambientOsc1?.stop();
      this.ambientOsc2?.stop();
      this.ambientOsc1?.disconnect();
      this.ambientOsc2?.disconnect();
      this.ambientFilter?.disconnect();
    } catch {
      // Ignore
    }
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
    this.ambientFilter = null;
    this.isAmbienceRunning = false;
  }

  // ==========================================================
  // Throttled Sound Effects
  // ==========================================================

  /**
   * Footstep sound throttled to max 1 per 340ms to avoid audio overload while moving
   */
  public playFootstep(): void {
    if (this.settings.muted) return;
    const now = Date.now();
    if (now - this.lastFootstepTime < 340) return;
    this.lastFootstepTime = now;

    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Ignore
    }
  }

  /**
   * Reticle interaction hover cue (throttled to avoid stuttering on frame updates)
   */
  public playHoverCue(targetId?: string): void {
    if (this.settings.muted) return;
    const now = Date.now();
    if (targetId && targetId === this.lastHoverTarget && now - this.lastHoverTime < 250) {
      return;
    }
    if (now - this.lastHoverTime < 140) return;

    this.lastHoverTime = now;
    if (targetId) this.lastHoverTarget = targetId;

    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.02);

      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // Ignore
    }
  }

  /**
   * Crisp tactile terminal keystroke / UI tap
   */
  public playKeystroke(): void {
    if (this.settings.muted) return;
    const now = Date.now();
    if (now - this.lastKeystrokeTime < 40) return; // Debounce rapid repeat
    this.lastKeystrokeTime = now;

    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.025);

      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // Ignore
    }
  }

  /**
   * Tactile object pickup cue
   */
  public playPickup(): void {
    if (this.settings.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Ignore
    }
  }

  /**
   * Tactile object drop / pressure plate engage cue
   */
  public playDrop(): void {
    if (this.settings.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // Ignore
    }
  }

  /**
   * Objective discovered or completed chime
   */
  public playObjectiveComplete(): void {
    if (this.settings.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const notes = [587.33, 739.99, 880.0]; // D5, F#5, A5 major chord
      notes.forEach((freq, idx) => {
        if (!ctx || !this.sfxGain) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const startTime = ctx.currentTime + idx * 0.06;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.05, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(startTime);
        osc.stop(startTime + 0.26);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Hydraulic door release sound
   */
  public playDoorUnlock(): void {
    if (this.settings.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    try {
      // Deep pneumatic release
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      // Ignore
    }
  }

  /**
   * Sealed / locked rejection tone
   */
  public playDoorLocked(): void {
    if (this.settings.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.setValueAtTime(95, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.19);
    } catch {
      // Ignore
    }
  }

  /**
   * Procedural Reality Shift Harmonic Distortion
   */
  public playRealityShift(): void {
    if (this.settings.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.4);
      filter.Q.setValueAtTime(4.0, now);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.52);
    } catch {
      // Ignore
    }
  }

  /**
   * Chamber completion stinger
   */
  public playChamberWin(): void {
    if (this.settings.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const chords = [440, 554.37, 659.25, 880]; // A major
      chords.forEach((f, i) => {
        if (!ctx || !this.sfxGain) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const st = ctx.currentTime + i * 0.07;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, st);

        gain.gain.setValueAtTime(0.06, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.6);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(st);
        osc.stop(st + 0.65);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundManager();
