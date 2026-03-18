import { z } from 'zod';
import * as schemas from './schemas';

// Validation result type
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Generic validation function
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): ValidationResult<T> {
  try {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      const errorMessage = result.error.issues
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      return {
        success: false,
        error: context ? `${context}: ${errorMessage}` : errorMessage
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Specific validation functions for common types
export function validateGameState(data: unknown): ValidationResult<schemas.GameState> {
  return validateData(schemas.GameStateSchema, data, 'GameState validation');
}

export function validatePlayerConfig(data: unknown): ValidationResult<schemas.PlayerConfig> {
  return validateData(schemas.PlayerConfigSchema, data, 'PlayerConfig validation');
}

export function validateTerritoryState(data: unknown): ValidationResult<schemas.TerritoryState> {
  return validateData(schemas.TerritoryStateSchema, data, 'TerritoryState validation');
}

export function validateMission(data: unknown): ValidationResult<schemas.Mission> {
  return validateData(schemas.MissionSchema, data, 'Mission validation');
}

export function validateAssetCard(data: unknown): ValidationResult<schemas.AssetCard> {
  return validateData(schemas.AssetCardSchema, data, 'AssetCard validation');
}

export function validateChatMessage(data: unknown): ValidationResult<schemas.ChatMessage> {
  return validateData(schemas.ChatMessageSchema, data, 'ChatMessage validation');
}

export function validateLobbyState(data: unknown): ValidationResult<schemas.LobbyState> {
  return validateData(schemas.LobbyStateSchema, data, 'LobbyState validation');
}

export function validateCampaignState(data: unknown): ValidationResult<schemas.CampaignState> {
  return validateData(schemas.CampaignStateSchema, data, 'CampaignState validation');
}

// Type guards for runtime type checking
export function isValidGameState(data: unknown): data is schemas.GameState {
  return validateGameState(data).success;
}

export function isValidPlayerConfig(data: unknown): data is schemas.PlayerConfig {
  return validatePlayerConfig(data).success;
}

export function isValidTerritoryState(data: unknown): data is schemas.TerritoryState {
  return validateTerritoryState(data).success;
}

export function isValidMission(data: unknown): data is schemas.Mission {
  return validateMission(data).success;
}

export function isValidAssetCard(data: unknown): data is schemas.AssetCard {
  return validateAssetCard(data).success;
}

export function isValidChatMessage(data: unknown): data is schemas.ChatMessage {
  return validateChatMessage(data).success;
}

export function isValidLobbyState(data: unknown): data is schemas.LobbyState {
  return validateLobbyState(data).success;
}

export function isValidCampaignState(data: unknown): data is schemas.CampaignState {
  return validateCampaignState(data).success;
}

// Validation helpers for arrays and records
export function validateArray<T>(
  schema: z.ZodSchema<T>,
  data: unknown[],
  context?: string
): ValidationResult<T[]> {
  try {
    const results = data.map(item => validateData(schema, item));
    const failures = results.filter(r => !r.success);

    if (failures.length === 0) {
      return {
        success: true,
        data: results.map(r => r.data!) as T[]
      };
    } else {
      const errorMessage = failures
        .map((f, i) => `Item ${i}: ${f.error}`)
        .join('; ');
      return {
        success: false,
        error: context ? `${context}: ${errorMessage}` : errorMessage
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Array validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export function validateRecord<T>(
  schema: z.ZodSchema<T>,
  data: Record<string, unknown>,
  context?: string
): ValidationResult<Record<string, T>> {
  try {
    const entries = Object.entries(data);
    const results = entries.map(([key, value]) => ({
      key,
      validation: validateData(schema, value)
    }));

    const failures = results.filter(r => !r.validation.success);

    if (failures.length === 0) {
      const validatedData = Object.fromEntries(
        results.map(({ key, validation }) => [key, validation.data!])
      ) as Record<string, T>;

      return { success: true, data: validatedData };
    } else {
      const errorMessage = failures
        .map(f => `${f.key}: ${f.validation.error}`)
        .join('; ');
      return {
        success: false,
        error: context ? `${context}: ${errorMessage}` : errorMessage
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Record validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Input sanitization helpers
export function sanitizeString(input: string, maxLength?: number): string {
  let sanitized = input.trim();
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  return sanitized;
}

export function sanitizeNumber(input: unknown, min?: number, max?: number): number | null {
  const num = typeof input === 'string' ? parseFloat(input) : Number(input);
  if (isNaN(num)) return null;
  if (min !== undefined && num < min) return min;
  if (max !== undefined && num > max) return max;
  return num;
}

// Validation error formatting
export function formatValidationError(error: string): string {
  return `Validation failed: ${error}`;
}

// Batch validation for multiple items
export function validateBatch<T>(
  items: unknown[],
  validator: (item: unknown) => ValidationResult<T>,
  context?: string
): { valid: T[]; invalid: { index: number; error: string }[] } {
  const valid: T[] = [];
  const invalid: { index: number; error: string }[] = [];

  items.forEach((item, index) => {
    const result = validator(item);
    if (result.success && result.data !== undefined) {
      valid.push(result.data);
    } else {
      invalid.push({ index, error: result.error || 'Unknown validation error' });
    }
  });

  if (context && invalid.length > 0) {
    console.warn(`${context}: ${invalid.length} invalid items found`);
  }

  return { valid, invalid };
}