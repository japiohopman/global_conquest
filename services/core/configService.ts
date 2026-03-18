import { IConfigService, IService, IServiceConfig } from './interfaces';

export class ConfigService implements IConfigService {
  readonly name = 'ConfigService';
  readonly version = '1.0.0';
  isInitialized = false;

  private config: IServiceConfig = {};
  private defaults: IServiceConfig = {
    // Audio settings
    audio: {
      masterVolume: 0.7,
      sfxVolume: 0.8,
      bgmVolume: 0.3,
      muted: false
    },

    // Game settings
    game: {
      difficulty: 'normal',
      aiDelay: 1000,
      animations: true,
      soundEffects: true
    },

    // Network settings
    network: {
      backendUrl: 'http://localhost:3001',
      reconnectAttempts: 3,
      reconnectDelay: 1000
    },

    // UI settings
    ui: {
      theme: 'dark',
      language: 'en',
      showTips: true,
      highContrast: false
    }
  };

  async initialize(): Promise<void> {
    // Load from localStorage or environment
    const saved = localStorage.getItem('global_conquest_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.config = { ...this.defaults, ...parsed };
      } catch (error) {
        console.warn('Failed to load config, using defaults:', error);
        this.config = { ...this.defaults };
      }
    } else {
      this.config = { ...this.defaults };
    }

    this.isInitialized = true;
  }

  async dispose(): Promise<void> {
    await this.save();
    this.isInitialized = false;
  }

  get<T>(key: string, defaultValue?: T): T {
    const keys = key.split('.');
    let value: any = this.config;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue as T;
      }
    }

    return value as T;
  }

  set<T>(key: string, value: T): void {
    const keys = key.split('.');
    let obj: any = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in obj) || typeof obj[k] !== 'object') {
        obj[k] = {};
      }
      obj = obj[k];
    }

    obj[keys[keys.length - 1]] = value;
  }

  load(config: IServiceConfig): void {
    this.config = { ...this.defaults, ...config };
  }

  save(): IServiceConfig {
    const config = { ...this.config };
    localStorage.setItem('global_conquest_config', JSON.stringify(config));
    return config;
  }

  reset(): void {
    this.config = { ...this.defaults };
  }

  getAll(): IServiceConfig {
    return { ...this.config };
  }
}