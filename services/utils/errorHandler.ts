// Error handling and logging utilities
export class GameError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'GameError';
  }
}

export const ErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  GAME_STATE_ERROR: 'GAME_STATE_ERROR',
  AI_ERROR: 'AI_ERROR',
  CAMPAIGN_ERROR: 'CAMPAIGN_ERROR',
  MULTIPLAYER_ERROR: 'MULTIPLAYER_ERROR',
} as const;

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: Array<{ error: Error; timestamp: number; context?: any }> = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  logError(error: Error, context?: any): void {
    const errorEntry = {
      error,
      timestamp: Date.now(),
      context
    };

    this.errorLog.push(errorEntry);
    console.error('[Game Error]', error.message, { context, stack: error.stack });

    // Keep only last 50 errors
    if (this.errorLog.length > 50) {
      this.errorLog = this.errorLog.slice(-50);
    }
  }

  getRecentErrors(count: number = 10): Array<{ error: Error; timestamp: number; context?: any }> {
    return this.errorLog.slice(-count);
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }
}

export const errorHandler = ErrorHandler.getInstance();

// Async operation wrapper with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  fallbackValue?: T,
  errorMessage?: string
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    const gameError = error instanceof GameError ? error : new GameError(
      errorMessage || (error as Error).message || 'Unknown error occurred',
      ErrorCodes.GAME_STATE_ERROR,
      { originalError: error }
    );

    errorHandler.logError(gameError);
    return fallbackValue;
  }
}

// Validation utilities
export const Validators = {
  isValidPlayerId: (id: string): boolean => {
    return typeof id === 'string' && id.length > 0;
  },

  isValidTerritoryId: (id: string): boolean => {
    return typeof id === 'string' && id.length > 0;
  },

  isValidTroopCount: (count: number): boolean => {
    return typeof count === 'number' && count >= 0 && Number.isInteger(count);
  },

  isValidColor: (color: string): boolean => {
    return typeof color === 'string' && /^#[0-9A-F]{6}$/i.test(color);
  }
};

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(label: string): () => number {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(label, duration);
      return duration;
    };
  }

  recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    const values = this.metrics.get(label)!;
    values.push(value);

    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getAverage(label: string): number {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) return 0;

    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  getMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const result: Record<string, { average: number; count: number; latest: number }> = {};

    for (const [label, values] of this.metrics.entries()) {
      result[label] = {
        average: this.getAverage(label),
        count: values.length,
        latest: values[values.length - 1] || 0
      };
    }

    return result;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();