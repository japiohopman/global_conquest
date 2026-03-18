// Memoization utilities for expensive calculations
export class MemoizedCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private maxAge: number;

  constructor(maxAge: number = 30000) { // 30 seconds default
    this.maxAge = maxAge;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: T): void {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global caches for common expensive operations
export const territoryCalculationsCache = new MemoizedCache();
export const aiDecisionCache = new MemoizedCache();
export const pathfindingCache = new MemoizedCache();

// Memoized territory ownership calculations
export function getMemoizedTerritoryStats(territories: Record<string, any>, playerId: string) {
  const cacheKey = `territory_stats_${playerId}_${Object.keys(territories).length}`;

  return territoryCalculationsCache.get(cacheKey) || (() => {
    const playerTerritories = Object.values(territories).filter((t: any) => t.owner === playerId);
    const totalTroops = playerTerritories.reduce((sum: number, t: any) => sum + t.troops, 0);
    const territoryCount = playerTerritories.length;

    const result = { totalTroops, territoryCount, territories: playerTerritories };
    territoryCalculationsCache.set(cacheKey, result);
    return result;
  })();
}

// Memoized continent control calculation
export function getMemoizedContinentControl(
  territories: Record<string, any>,
  continents: Record<string, string[]>,
  playerId: string
) {
  const cacheKey = `continent_control_${playerId}_${Object.keys(territories).length}`;

  return territoryCalculationsCache.get(cacheKey) || (() => {
    const result: Record<string, boolean> = {};

    for (const [continentName, territoryIds] of Object.entries(continents)) {
      const ownedCount = territoryIds.filter(id => territories[id]?.owner === playerId).length;
      result[continentName] = ownedCount === territoryIds.length;
    }

    territoryCalculationsCache.set(cacheKey, result);
    return result;
  })();
}

// Memoized adjacency checks
export function getMemoizedAdjacencies(
  adjacencies: Record<string, string[]>,
  territoryId: string
) {
  const cacheKey = `adjacencies_${territoryId}`;

  return pathfindingCache.get(cacheKey) || (() => {
    const result = adjacencies[territoryId] || [];
    pathfindingCache.set(cacheKey, result);
    return result;
  })();
}

// React hook for memoized calculations
export function useMemoizedCalculation<T>(
  calculation: () => T,
  deps: React.DependencyList,
  cache?: MemoizedCache<T>
): T {
  const cacheKey = React.useMemo(() => {
    return deps.map(dep => JSON.stringify(dep)).join('|');
  }, deps);

  const [result, setResult] = React.useState<T>(() => calculation());

  React.useEffect(() => {
    if (cache) {
      const cached = cache.get(cacheKey);
      if (cached !== undefined) {
        setResult(cached);
        return;
      }
    }

    const newResult = calculation();
    setResult(newResult);

    if (cache) {
      cache.set(cacheKey, newResult);
    }
  }, [cacheKey, cache]);

  return result;
}

// Import React for hooks
import React from 'react';