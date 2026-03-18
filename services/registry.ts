import { serviceContainer } from './core/container';
import { ConfigService } from './core/configService';
import { StorageService } from './core/storageService';
import { ValidationService } from './core/validationService';
import { AudioService } from './audio/audioService';
import { AIService } from './game/aiService';
import { IService } from './core/interfaces';

// Service initialization order matters - dependencies first
const SERVICES = [
  ConfigService,
  StorageService,
  ValidationService,
  AudioService,
  AIService,
] as const;

export class ServiceRegistry {
  static async initialize(): Promise<void> {
    console.log('Initializing Global Conquest services...');

    // Register all services
    for (const ServiceClass of SERVICES) {
      const service = new ServiceClass();
      serviceContainer.register(service);
    }

    // Initialize all services in dependency order
    await serviceContainer.initializeAll();

    console.log('All services initialized successfully');
  }

  static async dispose(): Promise<void> {
    console.log('Disposing Global Conquest services...');

    await serviceContainer.disposeAll();

    console.log('All services disposed');
  }

  static getService<T extends IService>(name: string): T {
    const service = serviceContainer.get<T>(name);
    if (!service) {
      throw new Error(`Service '${name}' not found`);
    }
    return service;
  }

  static hasService(name: string): boolean {
    return serviceContainer.has(name);
  }
}

// Convenience getters for commonly used services
export const getConfigService = () => ServiceRegistry.getService<ConfigService>('ConfigService');
export const getStorageService = () => ServiceRegistry.getService<StorageService>('StorageService');
export const getAudioService = () => ServiceRegistry.getService<AudioService>('AudioService');
export const getAIService = () => ServiceRegistry.getService<AIService>('AIService');