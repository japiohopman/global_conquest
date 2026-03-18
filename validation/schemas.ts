import { z } from 'zod';

// Basic validation schemas
export const PlayerIdSchema = z.string().min(1);

export const ColorSchema = z.string().regex(/^#[0-9A-F]{6}$/i);

export const AiDifficultySchema = z.enum(['easy', 'normal', 'hard']);

export const SetupRuleSchema = z.enum(['manual', 'random']);

export const GamePhaseSchema = z.enum([
  'setup', 'reinforce', 'attack', 'fortify', 'waiting', 'must_trade'
]);

export const AssetTypeSchema = z.enum(['infantry', 'cavalry', 'artillery', 'wild']);

// Complex object schemas
export const AssetCardSchema = z.object({
  id: z.string().min(1),
  type: AssetTypeSchema,
  territoryId: z.string().optional()
});

export const MissionTypeSchema = z.enum(['continent', 'elimination', 'territory_count', 'campaign_primary']);

export const MissionSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  type: MissionTypeSchema,
  targetContinents: z.array(z.string()).optional(),
  extraContinentsCount: z.number().int().min(0).optional(),
  targetPlayerColor: ColorSchema.optional(),
  territoryCount: z.number().int().min(0).optional(),
  targetTerritoryId: z.string().optional(),
  durationRequired: z.number().int().min(0).optional()
});

export const TerritoryStateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  owner: PlayerIdSchema,
  troops: z.number().int().min(0),
  continent: z.string().min(1)
});

export const PlayerConfigSchema = z.object({
  id: PlayerIdSchema,
  type: z.enum(['human', 'ai']),
  color: ColorSchema,
  name: z.string().min(1),
  isEliminated: z.boolean(),
  mission: MissionSchema,
  spriteIndex: z.number().int().min(0).optional(),
  persona: z.string().optional(),
  voiceKey: z.string().min(1),
  isReady: z.boolean().optional(),
  perks: z.array(z.any()).optional() // Will be refined later
});

// Battle and game state schemas
export const BattleResultSchema = z.object({
  aRolls: z.array(z.number().int().min(1).max(6)),
  dRolls: z.array(z.number().int().min(1).max(6)),
  aLoss: z.number().int().min(0),
  dLoss: z.number().int().min(0)
});

export const MoveSuggestionSchema = z.object({
  thoughtProcess: z.string(),
  recommendedAction: z.string(),
  targetTerritoryId: z.string().optional(),
  predictedThreatId: z.string().optional(),
  confidence: z.number().min(0).max(1)
});

// Campaign schemas
export const TheatreIdSchema = z.enum([
  'SKIRMISH', 'RESOURCES', 'IRON_CURTAIN', 'LOCKDOWN', 'OVERRIDE'
]);

export const TheatreSchema = z.object({
  id: TheatreIdSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  allowedContinents: z.array(z.string()),
  rivalNpcIds: z.array(z.string()),
  primaryMissionId: z.string(),
  unlockedAtPoints: z.number().int().min(0)
});

export const CampaignMedalSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  requirement: z.string().min(1),
  isEarned: z.boolean(),
  points: z.number().int().min(0)
});

export const CommanderPerkSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  cost: z.number().int().min(0),
  isUnlocked: z.boolean(),
  isActive: z.boolean()
});

export const CampaignStateSchema = z.object({
  currentTheatreId: TheatreIdSchema,
  unlockedTheatres: z.array(TheatreIdSchema),
  commandPoints: z.number().int().min(0),
  medals: z.array(CampaignMedalSchema),
  perks: z.array(CommanderPerkSchema),
  npcGrudges: z.record(z.string(), z.number())
});

// Game state schema
export const GameStateSchema = z.object({
  territories: z.record(z.string(), TerritoryStateSchema),
  players: z.array(PlayerConfigSchema),
  currentPlayerIndex: z.number().int().min(0),
  phase: GamePhaseSchema,
  turnNumber: z.number().int().min(0),
  reinforcementsAvailable: z.number().int().min(0),
  difficulty: AiDifficultySchema,
  setupRule: SetupRuleSchema,
  deck: z.array(AssetCardSchema),
  playerHands: z.record(PlayerIdSchema, z.array(AssetCardSchema)),
  tradeInCount: z.number().int().min(0),
  capturedThisTurn: z.boolean(),
  isGameStarted: z.boolean(),
  isCampaignMode: z.boolean()
});

// Chat and multiplayer schemas
export const ChatMessageSchema = z.object({
  id: z.string().min(1),
  senderId: PlayerIdSchema,
  senderName: z.string().min(1),
  senderColor: ColorSchema,
  text: z.string(),
  timestamp: z.number()
});

export const RoomInfoSchema = z.object({
  id: z.string().min(1),
  playerCount: z.number().int().min(0),
  isStarted: z.boolean()
});

export const LobbyPlayerSchema = z.object({
  slotIndex: z.number().int().min(0),
  socketId: z.string().nullable(),
  name: z.string().min(1),
  npcId: z.string().nullable(),
  isReady: z.boolean(),
  isHost: z.boolean(),
  type: z.enum(['human', 'ai'])
});

export const LobbyStateSchema = z.object({
  players: z.array(LobbyPlayerSchema),
  difficulty: AiDifficultySchema,
  setupRule: SetupRuleSchema
});

// Risk analysis schemas
export const RiskItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  likelihood: z.number().min(0).max(1),
  impact: z.number().min(0).max(1)
});

// Type inference helpers
export type PlayerId = z.infer<typeof PlayerIdSchema>;
export type Color = z.infer<typeof ColorSchema>;
export type AiDifficulty = z.infer<typeof AiDifficultySchema>;
export type SetupRule = z.infer<typeof SetupRuleSchema>;
export type GamePhase = z.infer<typeof GamePhaseSchema>;
export type AssetType = z.infer<typeof AssetTypeSchema>;
export type AssetCard = z.infer<typeof AssetCardSchema>;
export type MissionType = z.infer<typeof MissionTypeSchema>;
export type Mission = z.infer<typeof MissionSchema>;
export type TerritoryState = z.infer<typeof TerritoryStateSchema>;
export type PlayerConfig = z.infer<typeof PlayerConfigSchema>;
export type BattleResult = z.infer<typeof BattleResultSchema>;
export type MoveSuggestion = z.infer<typeof MoveSuggestionSchema>;
export type TheatreId = z.infer<typeof TheatreIdSchema>;
export type Theatre = z.infer<typeof TheatreSchema>;
export type CampaignMedal = z.infer<typeof CampaignMedalSchema>;
export type CommanderPerk = z.infer<typeof CommanderPerkSchema>;
export type CampaignState = z.infer<typeof CampaignStateSchema>;
export type GameState = z.infer<typeof GameStateSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type RoomInfo = z.infer<typeof RoomInfoSchema>;
export type LobbyPlayer = z.infer<typeof LobbyPlayerSchema>;
export type LobbyState = z.infer<typeof LobbyStateSchema>;
export type RiskItem = z.infer<typeof RiskItemSchema>;