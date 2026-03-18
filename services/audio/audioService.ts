import { IAudioService, IService } from '../core/interfaces';
import { soundEngine, SOUNDS } from '../soundEngine';

export class AudioService implements IAudioService {
  readonly name = 'AudioService';
  readonly version = '1.0.0';
  isInitialized = false;

  private masterVolume = 0.7;
  private muted = false;

  async initialize(): Promise<void> {
    // Sound engine is already initialized
    this.isInitialized = true;
  }

  async dispose(): Promise<void> {
    soundEngine.stopComms();
    soundEngine.stopBgm();
    this.isInitialized = false;
  }

  play(soundId: string): void {
    if (!this.isInitialized || this.muted) return;

    // Check if the soundId is a valid SOUNDS key
    if (soundId in SOUNDS) {
      try {
        soundEngine.play(soundId as keyof typeof SOUNDS);
      } catch (error) {
        console.error(`Failed to play sound '${soundId}':`, error);
      }
    } else {
      console.warn(`Unknown sound ID: ${soundId}`);
    }
  }

  stop(soundId?: string): void {
    if (!this.isInitialized) return;

    if (soundId) {
      // Note: Current sound engine doesn't support stopping individual sounds
      console.warn(`Stopping individual sounds not supported for '${soundId}'`);
    } else {
      soundEngine.stopComms();
      soundEngine.stopBgm();
    }
  }

  setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    soundEngine.setBgmVolume(volume);
  }

  mute(): void {
    this.muted = true;
    soundEngine.setBgmVolume(0);
  }

  unmute(): void {
    this.muted = false;
    soundEngine.setBgmVolume(this.masterVolume);
  }

  isMuted(): boolean {
    return this.muted;
  }

  getVolume(): number {
    return this.masterVolume;
  }
}