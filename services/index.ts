// Service architecture exports
export * from './core/interfaces';
export * from './core/container';
export * from './core/configService';
export * from './core/storageService';
export * from './audio/audioService';
export * from './game/aiService';
export * from './registry';

// Legacy service exports (for backward compatibility)
export * from './soundEngine';
export * from './aiBrain';
export * from './geminiService';
export * from './githubService';

// Utility exports
export * from './utils';