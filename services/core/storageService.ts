import { IStorageService, IService } from './interfaces';

export class StorageService implements IStorageService {
  readonly name = 'StorageService';
  readonly version = '1.0.0';
  isInitialized = false;

  private prefix = 'global_conquest_';

  async initialize(): Promise<void> {
    // Test storage availability
    try {
      const testKey = `${this.prefix}test`;
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (error) {
      console.warn('localStorage not available:', error);
    }

    this.isInitialized = true;
  }

  async dispose(): Promise<void> {
    this.isInitialized = false;
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Failed to get item '${key}':`, error);
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set item '${key}':`, error);
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error(`Failed to remove item '${key}':`, error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  getKeys(): string[] {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.slice(this.prefix.length));
    } catch (error) {
      console.error('Failed to get keys:', error);
      return [];
    }
  }

  has(key: string): boolean {
    try {
      return localStorage.getItem(this.prefix + key) !== null;
    } catch (error) {
      return false;
    }
  }
}