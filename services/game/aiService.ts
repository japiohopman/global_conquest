import { IAIService, IService, IValidationService } from '../core/interfaces';
import { runAiTurn } from '../aiBrain';
import { getStrategicAdvice } from '../geminiService';
import { GameState, MoveSuggestion } from '../../validation';
import { ServiceRegistry } from '../registry';

export class AIService implements IAIService {
  readonly name = 'AIService';
  readonly version = '1.0.0';
  isInitialized = false;

  private validationService?: IValidationService;

  async initialize(): Promise<void> {
    this.validationService = ServiceRegistry.getService<IValidationService>('ValidationService');
    this.isInitialized = true;
  }

  async dispose(): Promise<void> {
    this.validationService = undefined;
    this.isInitialized = false;
  }

  async processTurn(gameState: unknown): Promise<MoveSuggestion> {
    if (!this.isInitialized) {
      throw new Error('AIService not initialized');
    }

    // Validate input
    if (!this.validationService?.validateGameState(gameState)) {
      throw new Error('Invalid game state provided to AI service');
    }

    const validGameState = gameState as GameState;

    try {
      // For now, return a basic suggestion since runAiTurn doesn't return data
      // In a full implementation, we'd need to modify runAiTurn to return analysis
      return {
        thoughtProcess: 'AI processing turn based on current game state',
        recommendedAction: 'fortify',
        confidence: 0.8
      };
    } catch (error) {
      console.error('AI turn processing failed:', error);
      return {
        thoughtProcess: 'Error occurred during AI processing',
        recommendedAction: 'fortify',
        confidence: 0.3
      };
    }
  }

  async getStrategicAdvice(gameState: unknown): Promise<MoveSuggestion> {
    if (!this.isInitialized) {
      throw new Error('AIService not initialized');
    }

    // Validate input
    if (!this.validationService?.validateGameState(gameState)) {
      throw new Error('Invalid game state provided to AI service');
    }

    const validGameState = gameState as GameState;

    try {
      const advice = await getStrategicAdvice(validGameState);

      return {
        thoughtProcess: advice.thoughtProcess || 'Strategic analysis complete',
        recommendedAction: advice.recommendedAction || 'analyze',
        targetTerritoryId: advice.targetTerritoryId,
        predictedThreatId: advice.predictedThreatId,
        confidence: advice.confidence || 0.7
      };
    } catch (error) {
      console.error('Strategic advice generation failed:', error);
      return {
        thoughtProcess: 'Unable to generate strategic advice',
        recommendedAction: 'analyze',
        confidence: 0.4
      };
    }
  }
}