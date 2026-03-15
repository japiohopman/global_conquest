
const BASE_SE_URL = 'https://raw.githubusercontent.com/japiohopman/risk/main/assets/audio/sfx/';
const BASE_VOICE_URL = 'https://raw.githubusercontent.com/japiohopman/risk/main/assets/audio/voices/';

const BGM_URLS = {
  MAIN: 'https://cdn1.suno.ai/qts9dKnKkZeo99rA.mp3',
  SELECT: 'https://raw.githubusercontent.com/japiohopman/risk/main/assets/audio/Empire_Ascendant_Character_Select.mp3'
};

export const SOUNDS = {
  UI_CLICK: 'UI_CLICK.mp3',
  CONFIRM: 'CONFIRM.mp3',
  ERROR: 'ERROR.mp3',
  DEPLOY: 'DEPLOY.mp3',
  INTEL: 'INTEL_POPUP.mp3',
  ASSAULT: 'ASSAULT.mp3',
  CAPTURE: 'CAPTURE.mp3',
  VICTORY: 'VICTORY.mp3',
  DEFEAT: 'DEFEAT.mp3',
  APPLAUSE: 'APPLAUSE.mp3',
  DICE_ROLL: 'DICE_ROLL.mp3',
  UI_HOVER: 'UI_HOVER.mp3',
  CANCEL: 'CANCEL.mp3',
  BATTLE_WIN: 'BATTLE_WIN.mp3',
  BATTLE_LOSS: 'BATTLE_LOSS.mp3',
  AIRSTRIKE: 'AIRSTRIKE.mp3',
  ORBITAL_DROP: 'ORBITAL_DROP.mp3',
  REINFORCE: 'REINFORCE.mp3',
  CARD_DRAW: 'CARD_DRAW.mp3',
  CARD_TRADE: 'CARD_TRADE.mp3',
  TURN_START: 'TURN_START.mp3',
  PLAYER_ELIMINATED: 'PLAYER_ELIMINATED.mp3',
} as const;

class TacticalSoundEngine {
  private enabled: boolean = true;
  private audioContext: AudioContext | null = null;
  private audioCache: Map<string, AudioBuffer> = new Map();
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private nextStartTime: number = 0;
  private bgmAudio: HTMLAudioElement | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  private isDucking: boolean = false;
  private originalBgmVolume: number = 0.3;

  private getCtx() {
    if (!this.audioContext) {
      // Use native sample rate for better compatibility
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      this.masterGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();
      this.voiceGain = this.audioContext.createGain();
      
      this.sfxGain.gain.value = 0.6;
      this.voiceGain.gain.value = 1.5; // Boost voices
      
      this.sfxGain.connect(this.masterGain);
      this.voiceGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);
    }
    return this.audioContext;
  }

  async resumeContext() {
    const ctx = this.getCtx();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  toggle(state: boolean) {
    this.enabled = state;
    if (!state) {
      this.stopComms();
      this.stopBgm();
    }
  }

  async startBgm(track: keyof typeof BGM_URLS = 'MAIN') {
    if (!this.enabled) return;
    
    const url = BGM_URLS[track];
    await this.resumeContext();

    if (this.bgmAudio && this.bgmAudio.src !== url) {
      this.bgmAudio.pause();
      this.bgmAudio = null;
    }

    if (!this.bgmAudio) {
      this.bgmAudio = new Audio(url);
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = this.originalBgmVolume;
      this.bgmAudio.crossOrigin = "anonymous";
    }
    
    try {
      await this.bgmAudio.play();
      console.log(`Neural Link Audio [${track}]: Synchronized.`);
    } catch (e) {
      console.warn("BGM sync failed. Retrying on next interaction.", e);
      setTimeout(() => this.bgmAudio?.play().catch(() => {}), 1000);
    }
  }

  setBgmVolume(level: number) {
    this.originalBgmVolume = level;
    if (this.bgmAudio && !this.isDucking) {
      this.bgmAudio.volume = level;
    }
  }

  private duckBgm(duck: boolean) {
    if (!this.bgmAudio) return;
    this.isDucking = duck;
    const targetVolume = duck ? this.originalBgmVolume * 0.2 : this.originalBgmVolume;
    
    // Smooth transition for ducking
    if (duck) {
      this.bgmAudio.volume = targetVolume;
    } else {
      // Fade back in slightly slower
      setTimeout(() => {
        if (this.bgmAudio && !this.isDucking) {
          this.bgmAudio.volume = targetVolume;
        }
      }, 300);
    }
  }

  stopBgm() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  async play(soundKey: keyof typeof SOUNDS) {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    await this.resumeContext();

    const fileName = SOUNDS[soundKey];
    const url = `${BASE_SE_URL}${fileName}`;

    try {
      let buffer = this.audioCache.get(url);
      if (!buffer) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fetch failed for ${url}`);
        const arrayBuffer = await response.arrayBuffer();
        buffer = await ctx.decodeAudioData(arrayBuffer);
        this.audioCache.set(url, buffer);
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.sfxGain!);
      source.start(0);
    } catch (e) {
      console.warn("Sound effect missing or failed:", soundKey, url);
    }
  }

  stopComms() {
    this.activeSources.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    this.activeSources.clear();
    this.nextStartTime = 0;
    this.duckBgm(false);
  }

  async speak(voiceKey: string, clips: { category: string, file: string }[]): Promise<void> {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    await this.resumeContext();
    
    this.stopComms();
    this.duckBgm(true);
    
    const playbackPromises: Promise<void>[] = [];
    this.nextStartTime = ctx.currentTime + 0.1;

    for (const clip of clips) {
      let url = `${BASE_VOICE_URL}${voiceKey}/${clip.category}/${clip.file}.wav?t=${Date.now()}`;
      
      try {
        let response = await fetch(url);
        
        // Fallback to .mp3 if .wav is not found
        if (!response.ok) {
          const mp3Url = `${BASE_VOICE_URL}${voiceKey}/${clip.category}/${clip.file}.mp3?t=${Date.now()}`;
          response = await fetch(mp3Url);
          if (!response.ok) {
            console.warn(`Voice clip not found (.wav or .mp3): ${clip.file}`);
            continue;
          }
          url = mp3Url;
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.voiceGain!);
        
        const startTime = Math.max(this.nextStartTime, ctx.currentTime);
        source.start(startTime);
        this.activeSources.add(source);
        
        this.nextStartTime = startTime + audioBuffer.duration - 0.05;

        const p = new Promise<void>((resolve) => {
          source.onended = () => {
            this.activeSources.delete(source);
            resolve();
          };
        });
        playbackPromises.push(p);
      } catch (e) {
        console.error(`Clip stitching failure: ${clip.file}`, e);
      }
    }
    
    if (playbackPromises.length > 0) {
      await Promise.all(playbackPromises);
    }
    
    this.duckBgm(false);
  }
}

export const soundEngine = new TacticalSoundEngine();
