import { Socket } from 'socket.io-client';
import {
  GameState, PlayerId, GamePhase, AssetCard, PlayerConfig,
  Mission, MoveSuggestion, AiDifficulty, SetupRule,
  CampaignState, TheatreId, ChatMessage, RoomInfo, LobbyState
} from '../types';

export interface BattleResult {
  aRolls: number[];
  dRolls: number[];
  aLoss: number;
  dLoss: number;
}

export interface CommsState {
  speakerId: PlayerId | null;
  text: string;
  timestamp: number;
}

export interface GameStore extends GameState {
  campaign: CampaignState;
  adjacencies: Record<string, string[]>;
  isGameStarted: boolean;
  selectedCards: string[];
  logs: string[];
  lastBattleResult: BattleResult | null;
  pendingInvasion: { from: string, to: string, min: number } | null;
  isAiProcessing: boolean;
  isAwaitingHumanDefense: boolean;
  missionOptions: Mission[] | null;
  pendingMissionPlayerId: PlayerId | null;
  activeComms: CommsState | null;
  strategicAdvice: MoveSuggestion | null;
  isFetchingAdvice: boolean;
  messages: ChatMessage[];
  availableRooms: RoomInfo[];
  isFetchingRooms: boolean;
  localPlayerId: PlayerId | null;
  slotIndex: number | null;
  lobby: LobbyState | null;
  
  // Multiplayer
  socket: Socket | null;
  isMultiplayer: boolean;
  roomId: string | null;
  lastActionSource: 'local' | 'remote';
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
  sendCommand: (command: any) => void;
  
  // Campaign Actions
  initCampaignGame: (theatreId: TheatreId, totalCommanders?: number) => void;
  unlockPerk: (perkId: string) => void;
  togglePerk: (perkId: string) => void;
  awardMedal: (medalId: string) => void;
  saveCampaign: (state: CampaignState) => void;
  loadCampaign: () => CampaignState;
  
  // Core Actions
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
  addLog: (msg: string) => void;
  processAiTurn: () => Promise<void>;
  checkVictory: (playerId: PlayerId) => boolean;
  triggerComms: (playerId: PlayerId, text: string, clips: { category: string, file: string }[]) => Promise<void>;
  fetchAdvice: () => Promise<void>;
  executePerk: (perkId: string, targetTerritoryId?: string) => void;
}
