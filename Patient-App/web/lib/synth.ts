/**
 * ZenAudioSynthesizer
 * Programmatic Web Audio Synthesizer for high-fidelity mindfulness soundscapes.
 * Modulates wave swells (Ocean), soft raindrops (Rain), singing bowls, and binaural beats.
 * Zero external MP3 asset dependency. Works out of the box on client side.
 */

export class ZenAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterVolume: GainNode | null = null;

  // Ocean Nodes
  private oceanNoise: AudioBufferSourceNode | null = null;
  private oceanGain: GainNode | null = null;
  private oceanLFO: OscillatorNode | null = null;

  // Rain Nodes
  private rainNoise: AudioBufferSourceNode | null = null;
  private rainGain: GainNode | null = null;

  // Binaural Nodes
  private binLeft: OscillatorNode | null = null;
  private binRight: OscillatorNode | null = null;
  private binGain: GainNode | null = null;

  // State flags
  private initialized = false;
  private active = false;

  // Default volumes (0 to 1)
  public oceanVol = 0.3;
  public rainVol = 0.2;
  public binVol = 0.15;
  public masterVol = 0.8;

  constructor() {}

  public init() {
    if (typeof window === 'undefined' || this.initialized) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();
      
      // Master Gain Node
      this.masterVolume = this.ctx.createGain();
      this.masterVolume.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);
      this.masterVolume.connect(this.ctx.destination);

      this.setupOcean();
      this.setupRain();
      this.setupBinaural();
      
      this.initialized = true;
    } catch (e) {
      console.error('Failed to initialize ZenAudioSynthesizer:', e);
    }
  }

  private createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 5; // 5 seconds of noise buffer
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private setupOcean() {
    if (!this.ctx || !this.masterVolume) return;
    const buffer = this.createNoiseBuffer();
    if (!buffer) return;

    this.oceanNoise = this.ctx.createBufferSource();
    this.oceanNoise.buffer = buffer;
    this.oceanNoise.loop = true;

    // Deep lowpass filter to emulate the ocean rumble
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    this.oceanGain = this.ctx.createGain();
    this.oceanGain.gain.setValueAtTime(this.oceanVol, this.ctx.currentTime);

    // LFO to create a wave swell cycle (every ~12 seconds)
    this.oceanLFO = this.ctx.createOscillator();
    this.oceanLFO.type = 'sine';
    this.oceanLFO.frequency.setValueAtTime(0.08, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.12, this.ctx.currentTime); // mod amplitude

    this.oceanLFO.connect(lfoGain);
    lfoGain.connect(this.oceanGain.gain);

    this.oceanNoise.connect(filter);
    filter.connect(this.oceanGain);
    this.oceanGain.connect(this.masterVolume);
  }

  private setupRain() {
    if (!this.ctx || !this.masterVolume) return;
    const buffer = this.createNoiseBuffer();
    if (!buffer) return;

    this.rainNoise = this.ctx.createBufferSource();
    this.rainNoise.buffer = buffer;
    this.rainNoise.loop = true;

    // Bandpass filter to make it sound like gentle rain drop crackles
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1150, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(this.rainVol, this.ctx.currentTime);

    this.rainNoise.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.masterVolume);
  }

  private setupBinaural() {
    if (!this.ctx || !this.masterVolume) return;

    const merger = this.ctx.createChannelMerger(2);

    // Left ear sine oscillator
    this.binLeft = this.ctx.createOscillator();
    this.binLeft.type = 'sine';
    this.binLeft.frequency.setValueAtTime(110, this.ctx.currentTime); // 110Hz Base

    // Right ear sine oscillator
    this.binRight = this.ctx.createOscillator();
    this.binRight.type = 'sine';
    this.binRight.frequency.setValueAtTime(116, this.ctx.currentTime); // 116Hz (6Hz Theta difference)

    this.binGain = this.ctx.createGain();
    this.binGain.gain.setValueAtTime(this.binVol, this.ctx.currentTime);

    this.binLeft.connect(merger, 0, 0);
    this.binRight.connect(merger, 0, 1);

    merger.connect(this.binGain);
    this.binGain.connect(this.masterVolume);
  }

  public play() {
    if (!this.initialized) this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (!this.active) {
      try {
        this.oceanNoise?.start(0);
        this.oceanLFO?.start(0);
        this.rainNoise?.start(0);
        this.binLeft?.start(0);
        this.binRight?.start(0);
      } catch (e) {
        // Node already started
      }
      this.active = true;
    }
  }

  public stop() {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
  }

  public setVolume(channel: string, val: number) {
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    if (channel === 'master' && this.masterVolume) {
      this.masterVol = val;
      this.masterVolume.gain.setValueAtTime(val, time);
    } else if (channel === 'ocean' && this.oceanGain) {
      this.oceanVol = val;
      this.oceanGain.gain.setValueAtTime(val, time);
    } else if (channel === 'rain' && this.rainGain) {
      this.rainVol = val;
      this.rainGain.gain.setValueAtTime(val, time);
    } else if (channel === 'binaural' && this.binGain) {
      this.binVol = val;
      this.binGain.gain.setValueAtTime(val, time);
    }
  }

  public strikeSoundBowl() {
    if (!this.initialized) this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const time = this.ctx.currentTime;
    const fundamental = 210; // C3-like grounding vibration
    const harmonics = [1, 2.02, 3.01, 4.04, 5.03]; // Resonant overtone harmonics
    const overtoneGains = [0.4, 0.22, 0.14, 0.08, 0.04]; // Exp decay amplitude of harmonics

    harmonics.forEach((h, index) => {
      const osc = this.ctx!.createOscillator();
      const gainNode = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * h, time);

      // Low frequency pitch vibrato for organic singing bowl wobble
      const lfo = this.ctx!.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(4.2, time); // 4.2Hz wobble

      const lfoGain = this.ctx!.createGain();
      lfoGain.gain.setValueAtTime((fundamental * h) * 0.006, time); // subtle detune width

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      // Attack-Decay-Sustain-Release Chime Envelope
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(overtoneGains[index], time + 0.06); // Attack
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 6.0); // 6s Chime decay

      osc.connect(gainNode);
      if (this.masterVolume) {
        gainNode.connect(this.masterVolume);
      } else {
        gainNode.connect(this.ctx!.destination);
      }

      lfo.start(time);
      osc.start(time);

      lfo.stop(time + 6.2);
      osc.stop(time + 6.2);
    });
  }
}
