
export type PlayerId = string; 

export type GamePhase = 'setup' | 'reinforce' | 'attack' | 'fortify' | 'waiting' | 'must_trade';

export type AssetType = 'infantry' | 'cavalry' | 'artillery' | 'wild';

export interface AssetCard {
  id: string;
  type: AssetType;
  territoryId?: string; 
}

export type MissionType = 'continent' | 'elimination' | 'territory_count' | 'campaign_primary';

export interface Mission {
  id: string;
  description: string;
  type: MissionType;
  targetContinents?: string[];
  extraContinentsCount?: number;
  targetPlayerColor?: string; 
  territoryCount?: number;
  targetTerritoryId?: string; // For campaign: "Control Egypt"
  durationRequired?: number; // For campaign: "Hold for 12 turns"
}

export interface TerritoryState {
  id: string;
  name: string;
  owner: PlayerId;
  troops: number;
  continent: string;
}

export interface PlayerConfig {
  id: string;
  type: 'human' | 'ai';
  color: string;
  name: string;
  isEliminated: boolean;
  mission: Mission;
  spriteIndex?: number; 
  persona?: string;
  voiceKey: string; 
}

export type AiDifficulty = 'easy' | 'normal' | 'hard';
export type SetupRule = 'manual' | 'random';

// --- Campaign Types ---

export type TheatreId = 'SKIRMISH' | 'RESOURCES' | 'IRON_CURTAIN' | 'LOCKDOWN' | 'OVERRIDE';

export interface Theatre {
  id: TheatreId;
  name: string;
  description: string;
  allowedContinents: string[];
  rivalNpcIds: string[];
  primaryMissionId: string;
  unlockedAtPoints: number;
}

export interface CampaignMedal {
  id: string;
  name: string;
  description: string;
  requirement: string;
  isEarned: boolean;
  points: number;
}

export interface CommanderPerk {
  id: string;
  name: string;
  description: string;
  cost: number;
  isUnlocked: boolean;
  isActive: boolean;
}

export interface CampaignState {
  currentTheatreId: TheatreId;
  unlockedTheatres: TheatreId[];
  commandPoints: number;
  medals: CampaignMedal[];
  perks: CommanderPerk[];
  npcGrudges: Record<string, number>; // Maps NPC name to a "Hate Score"
}

export interface GameState {
  territories: Record<string, TerritoryState>;
  players: PlayerConfig[];
  currentPlayerIndex: number;
  phase: GamePhase;
  turnNumber: number;
  reinforcementsAvailable: number;
  difficulty: AiDifficulty;
  setupRule: SetupRule;
  deck: AssetCard[];
  playerHands: Record<PlayerId, AssetCard[]>;
  tradeInCount: number;
  capturedThisTurn: boolean;
  isCampaignMode: boolean;
}

export interface RiskItem {
  id: string;
  label: string;
  likelihood: number;
  impact: number;
}

export interface MoveSuggestion {
  thoughtProcess: string;
  recommendedAction: string;
  targetTerritoryId?: string;
  predictedThreatId?: string;
  confidence: number;
}

export interface ChatMessage {
  id: string;
  senderId: PlayerId;
  senderName: string;
  senderColor: string;
  text: string;
  timestamp: number;
}

export interface RoomInfo {
  id: string;
  playerCount: number;
  isStarted: boolean;
}

export interface LobbyPlayer {
  slotIndex: number;
  socketId: string | null;
  name: string;
  npcId: string | null;
  isReady: boolean;
  isHost: boolean;
  type: 'human' | 'ai';
}

export interface LobbyState {
  players: LobbyPlayer[];
  difficulty: AiDifficulty;
  setupRule: SetupRule;
}
