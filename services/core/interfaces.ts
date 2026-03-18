// Core service interfaces and architecture
export interface IService {
  readonly name: string;
  readonly version: string;
  initialize(): Promise<void>;
  dispose(): Promise<void>;
  isInitialized: boolean;
}

export interface IServiceContainer {
  register<T extends IService>(service: T): void;
  unregister(name: string): void;
  get<T extends IService>(name: string): T | undefined;
  getAll(): IService[];
  has(name: string): boolean;
}

export interface IServiceConfig {
  [key: string]: any;
}

export interface IGameService extends IService {
  reset(): Promise<void>;
}

export interface IAIService extends IService {
  processTurn(gameState: any): Promise<any>;
  getStrategicAdvice(gameState: any): Promise<any>;
}

export interface IAudioService extends IService {
  play(soundId: string): void;
  stop(soundId?: string): void;
  setVolume(volume: number): void;
  mute(): void;
  unmute(): void;
}

export interface INetworkService extends IService {
  connect(url: string): Promise<void>;
  disconnect(): Promise<void>;
  send(event: string, data: any): void;
  on(event: string, handler: (data: any) => void): void;
  off(event: string, handler?: (data: any) => void): void;
}

export interface IStorageService extends IService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

export interface IConfigService extends IService {
  get<T>(key: string, defaultValue?: T): T;
  set<T>(key: string, value: T): void;
  load(config: IServiceConfig): void;
  save(): IServiceConfig;
}

export interface IValidationService extends IService {
  validateGameState(data: unknown): boolean;
  validatePlayerConfig(data: unknown): boolean;
  validateTerritoryState(data: unknown): boolean;
  validateMission(data: unknown): boolean;
  validateAssetCard(data: unknown): boolean;
  validateChatMessage(data: unknown): boolean;
  validateLobbyState(data: unknown): boolean;
  validateCampaignState(data: unknown): boolean;
  sanitizeInput<T>(data: unknown, schema: any): T | null;
}