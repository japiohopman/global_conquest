import { useGameState } from '../stores/useGameState';
import { useCampaignState } from '../stores/useCampaignState';
import { useMultiplayerState } from '../stores/useMultiplayerState';
import { useUIState } from '../stores/useUIState';
import { CONTINENTS } from '../../constants';
import { withErrorHandling } from '../../services/utils';
import { getMemoizedTerritoryStats, getMemoizedContinentControl } from '../../services/utils/memoization';
import { loadingManager } from '../../services/utils/loadingManager';
import React from 'react';

// Game State Hooks
export const useCurrentPlayer = () => {
  const { players, currentPlayerIndex } = useGameState();
  return players[currentPlayerIndex];
};

export const useCurrentPhase = () => {
  return useGameState(state => state.phase);
};

export const useTerritories = () => {
  return useGameState(state => state.territories);
};

export const useSelectedTerritory = () => {
  const { territories, selectedId } = useGameState();
  return selectedId ? territories[selectedId] : null;
};

export const useTargetTerritory = () => {
  const { territories, targetId } = useGameState();
  return targetId ? territories[targetId] : null;
};

export const useReinforcements = () => {
  return useGameState(state => state.reinforcementsAvailable);
};

export const usePlayers = () => {
  return useGameState(state => state.players);
};

export const useGamePhase = () => {
  return useGameState(state => state.phase);
};

export const useTurnNumber = () => {
  return useGameState(state => state.turnNumber);
};

export const useIsGameStarted = () => {
  return useGameState(state => state.isGameStarted);
};

export const useIsCampaignMode = () => {
  return useGameState(state => state.isCampaignMode);
};

export const useLastBattleResult = () => {
  return useGameState(state => state.lastBattleResult);
};

export const usePendingInvasion = () => {
  return useGameState(state => state.pendingInvasion);
};

export const useIsAiProcessing = () => {
  return useGameState(state => state.isAiProcessing);
};

export const useIsAwaitingHumanDefense = () => {
  return useGameState(state => state.isAwaitingHumanDefense);
};

// Campaign State Hooks
export const useCurrentTheatre = () => {
  const { campaign } = useCampaignState();
  return campaign.currentTheatreId;
};

export const useUnlockedTheatres = () => {
  const { campaign } = useCampaignState();
  return campaign.unlockedTheatres;
};

export const useCommandPoints = () => {
  const { campaign } = useCampaignState();
  return campaign.commandPoints;
};

export const useCampaignMedals = () => {
  const { campaign } = useCampaignState();
  return campaign.medals;
};

export const useCommanderPerks = () => {
  const { campaign } = useCampaignState();
  return campaign.perks;
};

// Multiplayer State Hooks
export const useIsMultiplayer = () => {
  return useMultiplayerState(state => state.isMultiplayer);
};

export const useRoomId = () => {
  return useMultiplayerState(state => state.roomId);
};

export const useLocalPlayerId = () => {
  return useMultiplayerState(state => state.localPlayerId);
};

export const useSlotIndex = () => {
  return useMultiplayerState(state => state.slotIndex);
};

export const useLobby = () => {
  return useMultiplayerState(state => state.lobby);
};

export const useAvailableRooms = () => {
  return useMultiplayerState(state => state.availableRooms);
};

export const useIsFetchingRooms = () => {
  return useMultiplayerState(state => state.isFetchingRooms);
};

export const useMessages = () => {
  return useMultiplayerState(state => state.messages);
};

// UI State Hooks
export const useActiveComms = () => {
  return useUIState(state => state.activeComms);
};

export const useStrategicAdvice = () => {
  return useUIState(state => state.strategicAdvice);
};

export const useIsFetchingAdvice = () => {
  return useUIState(state => state.isFetchingAdvice);
};

export const useLogs = () => {
  return useUIState(state => state.logs);
};

// Combined hooks for common use cases
export const usePlayerTerritories = (playerId: string) => {
  const territories = useTerritories();
  return Object.values(territories).filter(t => t.owner === playerId);
};

export const useContinentControl = (playerId: string) => {
  const territories = useTerritories();
  const continentControl: Record<string, boolean> = {};

  for (const [continentName, territoryIds] of Object.entries(CONTINENTS)) {
    const continentTerritories = territoryIds.map((id: string) => territories[id]);
    const ownedCount = continentTerritories.filter(t => t.owner === playerId).length;
    continentControl[continentName] = ownedCount === territoryIds.length;
  }

  return continentControl;
};

// Memoized calculation hooks
export const useMemoizedPlayerStats = (playerId: string) => {
  const territories = useTerritories();

  return React.useMemo(() => {
    return getMemoizedTerritoryStats(territories, playerId);
  }, [territories, playerId]);
};

export const useMemoizedContinentControl = (playerId: string) => {
  const territories = useTerritories();

  return React.useMemo(() => {
    return getMemoizedContinentControl(territories, CONTINENTS, playerId);
  }, [territories, playerId]);
};

// Loading state hooks
export const useLoadingState = () => {
  const [loadings, setLoadings] = React.useState(loadingManager.getActiveLoadings());

  React.useEffect(() => {
    const unsubscribe = loadingManager.subscribe(setLoadings);
    return unsubscribe;
  }, []);

  return {
    loadings,
    isLoading: (id?: string) => loadingManager.isLoading(id),
    hasActiveLoadings: loadings.length > 0
  };
};

export const useGameActions = () => {
  const gameState = useGameState();
  return {
    selectMission: gameState.selectMission,
    resetGame: gameState.resetGame,
    nextPhase: gameState.nextPhase,
    handleTerritoryClick: gameState.handleTerritoryClick,
    executeAttack: gameState.executeAttack,
    clearBattleResult: gameState.clearBattleResult,
    closeBattle: gameState.closeBattle,
    finalizeInvasion: gameState.finalizeInvasion,
    tradeInCards: gameState.tradeInCards,
    toggleCardSelection: gameState.toggleCardSelection,
    addLog: gameState.addLog,
    processAiTurn: gameState.processAiTurn,
    triggerComms: gameState.triggerComms,
    fetchAdvice: gameState.fetchAdvice,
    executePerk: gameState.executePerk,
  };
};

export const useCampaignActions = () => {
  const campaignState = useCampaignState();
  return {
    initCampaignGame: campaignState.initCampaignGame,
    unlockPerk: campaignState.unlockPerk,
    togglePerk: campaignState.togglePerk,
    awardMedal: campaignState.awardMedal,
  };
};

export const useMultiplayerActions = () => {
  const multiplayerState = useMultiplayerState();
  return {
    connectMultiplayer: multiplayerState.connectMultiplayer,
    disconnectMultiplayer: multiplayerState.disconnectMultiplayer,
    syncState: multiplayerState.syncState,
    sendChatMessage: multiplayerState.sendChatMessage,
    fetchRooms: multiplayerState.fetchRooms,
    updateLobby: multiplayerState.updateLobby,
    selectLobbyCharacter: multiplayerState.selectLobbyCharacter,
    toggleReady: multiplayerState.toggleReady,
    toggleAiSlot: multiplayerState.toggleAiSlot,
    startMultiplayerGame: multiplayerState.startMultiplayerGame,
  };
};