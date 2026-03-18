import { useGameState } from './stores/useGameState';
import { useCampaignState } from './stores/useCampaignState';
import { useMultiplayerState } from './stores/useMultiplayerState';
import { useUIState } from './stores/useUIState';

// Custom hooks for specific functionality

// Game mechanics hooks
export const useGamePhase = () => useGameState(s => s.phase);
export const useCurrentPlayer = () => {
  const { players, currentPlayerIndex } = useGameState();
  return players[currentPlayerIndex];
};
export const useSelectedTerritories = () => useGameState(s => ({
  selectedId: s.selectedId,
  targetId: s.targetId
}));
export const useBattleState = () => useGameState(s => ({
  lastBattleResult: s.lastBattleResult,
  pendingInvasion: s.pendingInvasion
}));

// Campaign hooks
export const useCampaign = () => useCampaignState(s => s.campaign);
export const useCommandPoints = () => useCampaignState(s => s.campaign.commandPoints);
export const useCampaignMedals = () => useCampaignState(s => s.campaign.medals);

// Multiplayer hooks
export const useMultiplayer = () => useMultiplayerState(s => ({
  isMultiplayer: s.isMultiplayer,
  roomId: s.roomId,
  socket: s.socket
}));
export const useLobby = () => useMultiplayerState(s => s.lobby);
export const useChat = () => useMultiplayerState(s => ({
  messages: s.messages,
  sendChatMessage: s.sendChatMessage
}));
export const useRoomBrowser = () => useMultiplayerState(s => ({
  availableRooms: s.availableRooms,
  isFetchingRooms: s.isFetchingRooms,
  fetchRooms: s.fetchRooms
}));

// UI hooks
export const useLogs = () => useUIState(s => s.logs);
export const useComms = () => useUIState(s => s.activeComms);
export const useStrategicAdvice = () => useUIState(s => ({
  strategicAdvice: s.strategicAdvice,
  isFetchingAdvice: s.isFetchingAdvice
}));