// Loading state management utilities
export interface LoadingState {
  id: string;
  message: string;
  progress?: number; // 0-100
  startTime: number;
}

export class LoadingManager {
  private static instance: LoadingManager;
  private activeLoadings: Map<string, LoadingState> = new Map();
  private listeners: Set<(loadings: LoadingState[]) => void> = new Set();

  static getInstance(): LoadingManager {
    if (!LoadingManager.instance) {
      LoadingManager.instance = new LoadingManager();
    }
    return LoadingManager.instance;
  }

  startLoading(id: string, message: string): void {
    const loadingState: LoadingState = {
      id,
      message,
      startTime: Date.now()
    };

    this.activeLoadings.set(id, loadingState);
    this.notifyListeners();
  }

  updateProgress(id: string, progress: number, message?: string): void {
    const loading = this.activeLoadings.get(id);
    if (loading) {
      loading.progress = Math.max(0, Math.min(100, progress));
      if (message) loading.message = message;
      this.notifyListeners();
    }
  }

  endLoading(id: string): void {
    this.activeLoadings.delete(id);
    this.notifyListeners();
  }

  getActiveLoadings(): LoadingState[] {
    return Array.from(this.activeLoadings.values());
  }

  isLoading(id?: string): boolean {
    if (id) {
      return this.activeLoadings.has(id);
    }
    return this.activeLoadings.size > 0;
  }

  subscribe(listener: (loadings: LoadingState[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const loadings = this.getActiveLoadings();
    this.listeners.forEach(listener => {
      try {
        listener(loadings);
      } catch (error) {
        console.error('Error in loading listener:', error);
      }
    });
  }
}

export const loadingManager = LoadingManager.getInstance();

// Async operation wrapper with loading state
export async function withLoading<T>(
  id: string,
  message: string,
  operation: (updateProgress?: (progress: number, message?: string) => void) => Promise<T>
): Promise<T> {
  loadingManager.startLoading(id, message);

  try {
    const result = await operation((progress, message) => {
      loadingManager.updateProgress(id, progress, message);
    });

    loadingManager.endLoading(id);
    return result;
  } catch (error) {
    loadingManager.endLoading(id);
    throw error;
  }
}

// React hook for loading states
export function useLoadingStates() {
  const [loadings, setLoadings] = React.useState<LoadingState[]>([]);

  React.useEffect(() => {
    const unsubscribe = loadingManager.subscribe(setLoadings);
    return unsubscribe;
  }, []);

  return {
    loadings,
    isLoading: (id?: string) => loadingManager.isLoading(id),
    startLoading: (id: string, message: string) => loadingManager.startLoading(id, message),
    updateProgress: (id: string, progress: number, message?: string) =>
      loadingManager.updateProgress(id, progress, message),
    endLoading: (id: string) => loadingManager.endLoading(id)
  };
}

// Import React for the hook (this would normally be at the top)
import React from 'react';