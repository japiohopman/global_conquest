import { IService } from './interfaces';
import {
  validateGameState,
  validatePlayerConfig,
  validateTerritoryState,
  validateMission,
  validateAssetCard,
  validateChatMessage,
  validateLobbyState,
  validateCampaignState,
  ValidationResult
} from '../../validation';
import { IValidationService } from './interfaces';

export class ValidationService implements IValidationService {
  readonly name = 'ValidationService';
  readonly version = '1.0.0';
  public isInitialized = false;

  private validationErrors: string[] = [];

  async initialize(): Promise<void> {
    this.isInitialized = true;
    console.log('ValidationService initialized');
  }

  async dispose(): Promise<void> {
    this.validationErrors = [];
    this.isInitialized = false;
    console.log('ValidationService disposed');
  }

  validateGameState(data: unknown): boolean {
    const result = validateGameState(data);
    if (!result.success) {
      this.logValidationError('GameState', result.error);
      return false;
    }
    return true;
  }

  validatePlayerConfig(data: unknown): boolean {
    const result = validatePlayerConfig(data);
    if (!result.success) {
      this.logValidationError('PlayerConfig', result.error);
      return false;
    }
    return true;
  }

  validateTerritoryState(data: unknown): boolean {
    const result = validateTerritoryState(data);
    if (!result.success) {
      this.logValidationError('TerritoryState', result.error);
      return false;
    }
    return true;
  }

  validateMission(data: unknown): boolean {
    const result = validateMission(data);
    if (!result.success) {
      this.logValidationError('Mission', result.error);
      return false;
    }
    return true;
  }

  validateAssetCard(data: unknown): boolean {
    const result = validateAssetCard(data);
    if (!result.success) {
      this.logValidationError('AssetCard', result.error);
      return false;
    }
    return true;
  }

  validateChatMessage(data: unknown): boolean {
    const result = validateChatMessage(data);
    if (!result.success) {
      this.logValidationError('ChatMessage', result.error);
      return false;
    }
    return true;
  }

  validateLobbyState(data: unknown): boolean {
    const result = validateLobbyState(data);
    if (!result.success) {
      this.logValidationError('LobbyState', result.error);
      return false;
    }
    return true;
  }

  validateCampaignState(data: unknown): boolean {
    const result = validateCampaignState(data);
    if (!result.success) {
      this.logValidationError('CampaignState', result.error);
      return false;
    }
    return true;
  }

  sanitizeInput<T>(data: unknown, schema: any): T | null {
    try {
      // This is a simplified implementation - in a real scenario,
      // you'd want more sophisticated sanitization logic
      if (typeof data === 'string') {
        return data.trim() as unknown as T;
      }
      if (typeof data === 'number') {
        return data as unknown as T;
      }
      if (typeof data === 'boolean') {
        return data as unknown as T;
      }
      return null;
    } catch (error) {
      console.warn('Input sanitization failed:', error);
      return null;
    }
  }

  getValidationErrors(): string[] {
    return [...this.validationErrors];
  }

  clearValidationErrors(): void {
    this.validationErrors = [];
  }

  private logValidationError(type: string, error?: string): void {
    const errorMessage = `Validation failed for ${type}: ${error || 'Unknown error'}`;
    this.validationErrors.push(errorMessage);
    console.warn(errorMessage);
  }
}