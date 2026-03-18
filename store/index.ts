import { create } from 'zustand';
import { useGameState } from './stores/useGameState';
import { useCampaignState } from './stores/useCampaignState';
import { useMultiplayerState } from './stores/useMultiplayerState';
import { useUIState } from './stores/useUIState';
import {
  GameState, PlayerId, GamePhase, TerritoryState, AssetCard, PlayerConfig,
  Mission, MoveSuggestion, AiDifficulty, SetupRule, CommanderPerk, BattleResult,
  CampaignState, TheatreId, ChatMessage, RoomInfo, LobbyState
} from '../types';

// Re-export individual stores for direct use
export { useGameState, useCampaignState, useMultiplayerState, useUIState };

interface CommsState {
  speakerId: PlayerId | null;
  text: string;
  timestamp: number;
}

// Combined store interface
interface GameStore {
  // Game State
  territories: Record<string, TerritoryState>;
  adjacencies: Record<string, string[]>;
  players: PlayerConfig[];
  currentPlayerIndex: number;
  phase: GamePhase;
  turnNumber: number;
  reinforcementsAvailable: number;
  difficulty: AiDifficulty;
  setupRule: SetupRule;
  deck: AssetCard[];
  playerHands: Record<string, AssetCard[]>;
  tradeInCount: number;
  capturedThisTurn: boolean;
  isGameStarted: boolean;
  isCampaignMode: boolean;
  selectedId: string | null;
  targetId: string | null;
  selectedCards: string[];
  winner: PlayerId | null;
  lastBattleResult: BattleResult | null;
  pendingInvasion: { from: string, to: string, min: number } | null;
  isAiProcessing: boolean;
  isAwaitingHumanDefense: boolean;
  missionOptions: Mission[] | null;
  pendingMissionPlayerId: PlayerId | null;
  activeComms: CommsState | null;
  strategicAdvice: MoveSuggestion | null;
  isFetchingAdvice: boolean;

  // Campaign State
  campaign: CampaignState;

  // Multiplayer State
  socket: any;
  isMultiplayer: boolean;
  roomId: string | null;
  lastActionSource: 'local' | 'remote';
  messages: ChatMessage[];
  availableRooms: RoomInfo[];
  isFetchingRooms: boolean;
  localPlayerId: PlayerId | null;
  slotIndex: number | null;
  lobby: LobbyState | null;

  // UI State
  logs: string[];

  // Combined actions
  initGame: (total: number, humans: { name: string, color: string, npcId?: string }[], diff: AiDifficulty, setup: SetupRule, selectedNpcIds: string[]) => void;
  selectMission: (mission: Mission) => void;
  resetGame: () => void;
  nextPhase: () => void;
  handleTerritoryClick: (id: string) => Promise<void>;
  executeAttack: (aDiceCount: number, dDiceCount: number) => void;
  clearBattleResult: () => void;
  closeBattle: () => void;
  finalizeInvasion: (count: number) => void;
  tradeInCards: () => void;
  toggleCardSelection: (cardId: string) => void;
  processAiTurn: () => Promise<void>;
  checkVictory: (playerId: PlayerId) => boolean;
  executePerk: (perkId: string, targetTerritoryId?: string) => void;

  initCampaignGame: (theatreId: TheatreId, totalCommanders?: number) => void;
  unlockPerk: (perkId: string) => void;
  togglePerk: (perkId: string) => void;
  awardMedal: (medalId: string) => void;

  connectMultiplayer: (url: string, roomId: string) => void;
  disconnectMultiplayer: () => void;
  syncState: (payload: Partial<GameStore>) => void;
  sendChatMessage: (text: string) => void;
  fetchRooms: () => Promise<void>;
  updateLobby: (lobby: LobbyState) => void;
  selectLobbyCharacter: (npcId: string) => void;
  toggleReady: () => void;
  toggleAiSlot: (slotIndex: number) => void;
  startMultiplayerGame: () => void;

  addLog: (msg: string) => void;
  triggerComms: (playerId: PlayerId, text: string, clips: { category: string, file: string }[]) => Promise<void>;
  fetchAdvice: () => Promise<void>;
}

// Combined store that maintains backward compatibility
export const useGameStore = create<GameStore>((set, get) => ({
  // Initialize with combined state
  ...useGameState.getState(),
  ...useCampaignState.getState(),
  ...useMultiplayerState.getState(),
  ...useUIState.getState(),

  // Combined actions that delegate to appropriate stores
  initGame: (...args) => useGameState.getState().initGame(...args),
  selectMission: (...args) => useGameState.getState().selectMission(...args),
  resetGame: (...args) => useGameState.getState().resetGame(...args),
  nextPhase: (...args) => useGameState.getState().nextPhase(...args),
  handleTerritoryClick: (...args) => useGameState.getState().handleTerritoryClick(...args),
  executeAttack: (...args) => useGameState.getState().executeAttack(...args),
  clearBattleResult: (...args) => useGameState.getState().clearBattleResult(...args),
  closeBattle: (...args) => useGameState.getState().closeBattle(...args),
  finalizeInvasion: (...args) => useGameState.getState().finalizeInvasion(...args),
  tradeInCards: (...args) => useGameState.getState().tradeInCards(...args),
  toggleCardSelection: (...args) => useGameState.getState().toggleCardSelection(...args),
  processAiTurn: (...args) => useGameState.getState().processAiTurn(...args),
  checkVictory: (...args) => useGameState.getState().checkVictory(...args),
  executePerk: (...args) => useGameState.getState().executePerk(...args),

  initCampaignGame: (...args) => useCampaignState.getState().initCampaignGame(...args),
  unlockPerk: (...args) => useCampaignState.getState().unlockPerk(...args),
  togglePerk: (...args) => useCampaignState.getState().togglePerk(...args),
  awardMedal: (...args) => useCampaignState.getState().awardMedal(...args),

  connectMultiplayer: (...args) => useMultiplayerState.getState().connectMultiplayer(...args),
  disconnectMultiplayer: (...args) => useMultiplayerState.getState().disconnectMultiplayer(...args),
  syncState: (...args) => useMultiplayerState.getState().syncState(...args),
  sendChatMessage: (...args) => useMultiplayerState.getState().sendChatMessage(...args),
  fetchRooms: (...args) => useMultiplayerState.getState().fetchRooms(...args),
  updateLobby: (...args) => useMultiplayerState.getState().updateLobby(...args),
  selectLobbyCharacter: (...args) => useMultiplayerState.getState().selectLobbyCharacter(...args),
  toggleReady: (...args) => useMultiplayerState.getState().toggleReady(...args),
  toggleAiSlot: (...args) => useMultiplayerState.getState().toggleAiSlot(...args),
  startMultiplayerGame: (...args) => useMultiplayerState.getState().startMultiplayerGame(...args),

  addLog: (...args) => useUIState.getState().addLog(...args),
  triggerComms: (...args) => useUIState.getState().triggerComms(...args),
  fetchAdvice: (...args) => useUIState.getState().fetchAdvice(...args),
}));