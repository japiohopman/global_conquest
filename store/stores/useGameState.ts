import { create } from 'zustand';
import {
  GameState, PlayerId, GamePhase, TerritoryState, AssetCard, PlayerConfig,
  Mission, MoveSuggestion, AiDifficulty, SetupRule, CommanderPerk, BattleResult
} from '../../types';
import { ADJACENCIES, CONTINENTS, FULL_DECK, MISSION_LIST, PLAYER_COLORS } from '../../constants';
import { soundEngine } from '../../services/soundEngine';
import { npcData } from '../../npc_characters';
import { getStrategicAdvice } from '../../services/geminiService';
import { runAiTurn } from '../../services/aiBrain';
import { withErrorHandling } from '../../services/utils';

interface CommsState {
  speakerId: PlayerId | null;
  text: string;
  timestamp: number;
}

interface GameStateStore extends GameState {
  adjacencies: Record<string, string[]>;
  isGameStarted: boolean;
  selectedId: string | null;
  targetId: string | null;
  selectedCards: string[];
  winner: PlayerId | null;
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

const STARTING_ARMIES: Record<number, number> = { 2: 40, 3: 35, 4: 30, 5: 25, 6: 20 };
const CONTINENT_BONUSES: Record<string, number> = {
  'North America': 5, 'South America': 2, 'Europe': 5, 'Africa': 2, 'Asia': 7, 'Australia': 2
};

const calculateTurnReinforcements = (playerId: PlayerId, territories: Record<string, TerritoryState>) => {
  const playerTerrs = Object.values(territories).filter(t => t.owner === playerId && t.troops > 0);
  let bonus = Math.max(3, Math.floor(playerTerrs.length / 3));
  Object.entries(CONTINENTS).forEach(([name, ids]) => {
    if (ids.every(id => territories[id]?.owner === playerId)) bonus += CONTINENT_BONUSES[name] || 0;
  });
  return bonus;
};

const initialState = {
  territories: {},
  adjacencies: ADJACENCIES,
  players: [],
  currentPlayerIndex: 0,
  phase: 'setup' as GamePhase,
  turnNumber: 1,
  reinforcementsAvailable: 0,
  difficulty: 'normal' as AiDifficulty,
  setupRule: 'manual' as SetupRule,
  deck: [],
  playerHands: {},
  tradeInCount: 0,
  capturedThisTurn: false,
  isGameStarted: false,
  isCampaignMode: false,
  selectedId: null,
  targetId: null,
  selectedCards: [],
  winner: null,
  logs: ["SATELLITE LINK ESTABLISHED..."],
  lastBattleResult: null,
  pendingInvasion: null,
  isAiProcessing: false,
  isAwaitingHumanDefense: false,
  missionOptions: null,
  pendingMissionPlayerId: null,
  activeComms: null,
  strategicAdvice: null,
  isFetchingAdvice: false,
};

export const useGameState = create<GameStateStore>((set, get) => ({
  ...initialState,

  initGame: (total, humans, diff, setup, selectedNpcIds) => {
    const players: PlayerConfig[] = [];
    const territories: Record<string, TerritoryState> = {};

    // Create human players
    humans.forEach((h, i) => {
      const npc = npcData.find(n => n.id === h.npcId);
      players.push({
        id: `h_${i}`,
        name: h.name,
        color: h.color,
        type: 'human',
        spriteIndex: npc?.spriteIndex || 0,
        isEliminated: false,
        mission: {} as Mission,
        voiceKey: npc?.voiceKeyOverride || npc?.name.toLowerCase().replace(/\s/g, '_') || 'default',
        isReady: false,
        perks: []
      });
    });

    // Create AI players
    for (let i = humans.length; i < total; i++) {
      const npcId = selectedNpcIds[i - humans.length];
      const npc = npcData.find(n => n.id === npcId)!;
      players.push({
        id: `ai_${i}`,
        name: npc.name,
        color: npc.color,
        type: 'ai',
        spriteIndex: npc.spriteIndex,
        isEliminated: false,
        mission: {} as Mission,
        voiceKey: npc.voiceKeyOverride || npc.name.toLowerCase().replace(/\s/g, '_'),
        isReady: false,
        perks: []
      });
    }

    // Initialize territories
    Object.keys(ADJACENCIES).forEach(id => {
      territories[id] = {
        id,
        name: id, // This should be looked up from a territory data structure
        owner: 'neutral',
        troops: 0,
        continent: 'Unknown' // This should be looked up from territory data
      };
    });

    // Random territory assignment
    const terrIds = Object.keys(territories);
    const shuffled = [...terrIds].sort(() => Math.random() - 0.5);

    players.forEach((p, i) => {
      const count = Math.floor(terrIds.length / players.length);
      const start = i * count;
      const end = i === players.length - 1 ? terrIds.length : (i + 1) * count;

      shuffled.slice(start, end).forEach(id => {
        territories[id] = {
          ...territories[id],
          owner: p.id,
          troops: 1
        };
      });
    });

    // Distribute remaining armies
    const startingArmies = STARTING_ARMIES[total] || 20;
    players.forEach(p => {
      let remaining = startingArmies - Object.values(territories).filter(t => t.owner === p.id).length;
      while (remaining > 0) {
        const ownedTerrs = Object.entries(territories).filter(([_, t]) => t.owner === p.id);
        if (ownedTerrs.length === 0) break;

        const [id] = ownedTerrs[Math.floor(Math.random() * ownedTerrs.length)];
        territories[id].troops++;
        remaining--;
      }
    });

    set({
      players,
      territories,
      difficulty: diff,
      setupRule: setup,
      deck: [...FULL_DECK],
      playerHands: Object.fromEntries(players.map(p => [p.id, []])),
      phase: 'setup',
      currentPlayerIndex: 0,
      turnNumber: 1,
      reinforcementsAvailable: 0,
      tradeInCount: 0,
      capturedThisTurn: false,
      isGameStarted: true,
      isCampaignMode: false,
      selectedId: null,
      targetId: null,
      selectedCards: [],
      winner: null,
      logs: ["SATELLITE LINK ESTABLISHED...", `DEPLOYMENT COMPLETE: ${total} COMMANDERS INITIALIZED`],
      lastBattleResult: null,
      pendingInvasion: null,
      isAiProcessing: false,
      isAwaitingHumanDefense: false,
      missionOptions: null,
      pendingMissionPlayerId: null,
      activeComms: null,
      strategicAdvice: null,
      isFetchingAdvice: false,
    });

    get().addLog(`GLOBAL CONQUEST INITIALIZED - ${total} COMMANDERS`);
  },

  selectMission: (mission) => {
    const { pendingMissionPlayerId, players } = get();
    if (!pendingMissionPlayerId) return;

    const player = players.find(p => p.id === pendingMissionPlayerId);
    if (!player) return;

    set(s => ({
      players: s.players.map(p =>
        p.id === pendingMissionPlayerId ? { ...p, mission } : p
      ),
      missionOptions: null,
      pendingMissionPlayerId: null
    }));

    get().addLog(`${player.name} selected mission: ${mission.description}`);
  },

  resetGame: () => {
    set(initialState);
  },

  nextPhase: () => {
    const { phase, currentPlayerIndex, players, territories, turnNumber } = get();

    if (phase === 'setup') {
      // Check if all players have missions
      const playersWithoutMissions = players.filter(p => !p.mission);
      if (playersWithoutMissions.length > 0) {
        // Offer mission selection to first player without mission
        const player = playersWithoutMissions[0];
        const availableMissions = MISSION_LIST.filter(m =>
          !players.some(p => p.mission?.id === m.id)
        );
        set({
          missionOptions: availableMissions.slice(0, 3),
          pendingMissionPlayerId: player.id
        });
        return;
      }

      // All players have missions, start reinforce phase
      set({
        phase: 'reinforce',
        reinforcementsAvailable: calculateTurnReinforcements(players[0].id, territories),
        missionOptions: null,
        pendingMissionPlayerId: null
      });
      get().addLog(`DEPLOYMENT PHASE COMPLETE - ${players[0].name} begins turn 1`);
      return;
    }

    if (phase === 'reinforce') {
      set({ phase: 'attack', reinforcementsAvailable: 0 });
      return;
    }

    if (phase === 'attack') {
      set({ phase: 'fortify', capturedThisTurn: false });
      return;
    }

    if (phase === 'fortify') {
      // Move to next player's turn
      const nextIndex = (currentPlayerIndex + 1) % players.length;
      const nextPlayer = players[nextIndex];

      set({
        currentPlayerIndex: nextIndex,
        phase: 'reinforce',
        turnNumber: nextIndex === 0 ? turnNumber + 1 : turnNumber,
        reinforcementsAvailable: calculateTurnReinforcements(nextPlayer.id, territories),
        selectedId: null,
        targetId: null,
        selectedCards: [],
        capturedThisTurn: false
      });

      get().addLog(`TURN ${nextIndex === 0 ? turnNumber + 1 : turnNumber} - ${nextPlayer.name}'s command`);
      return;
    }
  },

  handleTerritoryClick: async (id) => {
    const { phase, selectedId, territories, players, currentPlayerIndex, reinforcementsAvailable } = get();
    const territory = territories[id];
    const currentPlayer = players[currentPlayerIndex];

    if (phase === 'reinforce' && territory.owner === currentPlayer.id && reinforcementsAvailable > 0) {
      set(s => ({
        territories: {
          ...s.territories,
          [id]: { ...s.territories[id], troops: s.territories[id].troops + 1 }
        },
        reinforcementsAvailable: s.reinforcementsAvailable - 1
      }));
      soundEngine.play('DEPLOY');
      return;
    }

    if (phase === 'attack') {
      if (!selectedId) {
        // Select attacking territory
        if (territory.owner === currentPlayer.id && territory.troops > 1) {
          set({ selectedId: id });
          soundEngine.play('UI_CLICK');
        }
      } else if (selectedId === id) {
        // Deselect
        set({ selectedId: null, targetId: null });
        soundEngine.play('CANCEL');
      } else {
        // Select target
        const selectedTerr = territories[selectedId];
        if (territory.owner !== currentPlayer.id &&
            ADJACENCIES[selectedId]?.includes(id) &&
            selectedTerr.troops > 1) {
          set({ targetId: id });
          soundEngine.play('UI_HOVER');
        }
      }
      return;
    }

    if (phase === 'fortify') {
      if (!selectedId) {
        // Select source territory
        if (territory.owner === currentPlayer.id && territory.troops > 1) {
          set({ selectedId: id });
          soundEngine.play('UI_CLICK');
        }
      } else if (selectedId === id) {
        // Deselect
        set({ selectedId: null, targetId: null });
        soundEngine.play('CANCEL');
      } else {
        // Select destination
        const selectedTerr = territories[selectedId];
        if (territory.owner === currentPlayer.id &&
            ADJACENCIES[selectedId]?.includes(id)) {
          set({ targetId: id });
          soundEngine.play('UI_HOVER');
        }
      }
      return;
    }
  },

  executeAttack: (aDiceCount, dDiceCount) => {
    const { selectedId, targetId, territories, players, currentPlayerIndex } = get();
    if (!selectedId || !targetId) return;

    const attacker = territories[selectedId];
    const defender = territories[targetId];
    const currentPlayer = players[currentPlayerIndex];
    const defenderPlayer = players.find(p => p.id === defender.owner);

    // Roll dice
    const aRolls = Array.from({ length: aDiceCount }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a);
    const dRolls = Array.from({ length: dDiceCount }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a);

    let aLoss = 0, dLoss = 0;
    const comparisons = Math.min(aRolls.length, dRolls.length);

    for (let i = 0; i < comparisons; i++) {
      if (aRolls[i] > dRolls[i]) dLoss++;
      else aLoss++;
    }

    // Apply losses
    set(s => ({
      territories: {
        ...s.territories,
        [selectedId]: { ...s.territories[selectedId], troops: Math.max(1, s.territories[selectedId].troops - aLoss) },
        [targetId]: { ...s.territories[targetId], troops: Math.max(0, s.territories[targetId].troops - dLoss) }
      },
      lastBattleResult: { aRolls, dRolls, aLoss, dLoss }
    }));

    // Check for territory capture
    const updatedDefender = get().territories[targetId];
    if (updatedDefender.troops === 0) {
      set(s => ({
        territories: {
          ...s.territories,
          [targetId]: { ...s.territories[targetId], owner: currentPlayer.id, troops: 1 }
        },
        pendingInvasion: { from: selectedId, to: targetId, min: 1 },
        capturedThisTurn: true
      }));

      get().addLog(`${currentPlayer.name} captured ${targetId} from ${defenderPlayer?.name || 'neutral'}`);
      soundEngine.play('CAPTURE');
    } else {
      soundEngine.play('ASSAULT');
    }

    // Check victory
    const winner = get().checkVictory(currentPlayer.id);
    if (winner) {
      set({ winner: currentPlayer.id });
      get().addLog(`VICTORY: ${currentPlayer.name} has conquered the world!`);
      soundEngine.play('VICTORY');
    }
  },

  clearBattleResult: () => {
    set({ lastBattleResult: null });
  },

  closeBattle: () => {
    set({ selectedId: null, targetId: null, lastBattleResult: null });
  },

  finalizeInvasion: (count) => {
    const { pendingInvasion, selectedId, targetId, territories } = get();
    if (!pendingInvasion) return;

    const fromTerr = territories[pendingInvasion.from];
    const toTerr = territories[pendingInvasion.to];

    set(s => ({
      territories: {
        ...s.territories,
        [pendingInvasion.from]: { ...s.territories[pendingInvasion.from], troops: Math.max(1, fromTerr.troops - count) },
        [pendingInvasion.to]: { ...s.territories[pendingInvasion.to], troops: count }
      },
      pendingInvasion: null,
      selectedId: null,
      targetId: null
    }));

    soundEngine.play('DEPLOY');
  },

  tradeInCards: () => {
    const { selectedCards, playerHands, players, currentPlayerIndex, tradeInCount } = get();
    if (selectedCards.length !== 3) return;

    const currentPlayer = players[currentPlayerIndex];
    const hand = playerHands[currentPlayer.id] || [];
    const tradeValue = 4 + (tradeInCount * 2);

    // Remove traded cards from hand
    const newHand = hand.filter(c => !selectedCards.includes(c.id));

    // Add new troops
    set(s => ({
      playerHands: {
        ...s.playerHands,
        [currentPlayer.id]: newHand
      },
      reinforcementsAvailable: s.reinforcementsAvailable + tradeValue,
      tradeInCount: s.tradeInCount + 1,
      selectedCards: []
    }));

    get().addLog(`${currentPlayer.name} traded cards for ${tradeValue} reinforcements`);
    soundEngine.play('CARD_TRADE');
  },

  toggleCardSelection: (cardId) => {
    set(s => ({
      selectedCards: s.selectedCards.includes(cardId)
        ? s.selectedCards.filter(id => id !== cardId)
        : [...s.selectedCards, cardId].slice(0, 3)
    }));
  },

  addLog: (msg) => {
    set(s => ({ logs: [...s.logs, msg].slice(-100) }));
  },

  processAiTurn: async () => {
    const { players, currentPlayerIndex, territories, difficulty } = get();
    const currentPlayer = players[currentPlayerIndex];

    if (currentPlayer.type !== 'ai') return;

    set({ isAiProcessing: true });

    try {
      const actions = {
        addLog: get().addLog,
        triggerComms: get().triggerComms,
        nextPhase: get().nextPhase,
        setTerritories: (update: Record<string, TerritoryState>) => set(s => ({ territories: { ...s.territories, ...update } })),
        setReinforcements: (count: number) => set({ reinforcementsAvailable: count }),
        tradeInCards: get().tradeInCards,
        setSelectedCards: (ids: string[]) => set({ selectedCards: ids }),
        setSelectedId: (id: string | null) => set({ selectedId: id }),
        setTargetId: (id: string | null) => set({ targetId: id }),
        setAwaitingDefense: (val: boolean) => set({ isAwaitingHumanDefense: val }),
        executeAttack: get().executeAttack,
        clearBattleResult: get().clearBattleResult,
        closeBattle: get().closeBattle,
      };
      await runAiTurn(get, actions);
      get().nextPhase();
    } catch (error) {
      console.error('AI turn failed:', error);
      get().addLog(`AI ERROR: ${currentPlayer.name} turn failed`);
    } finally {
      set({ isAiProcessing: false });
    }
  },

  checkVictory: (playerId) => {
    const { territories, players } = get();
    const totalTerritories = Object.keys(territories).length;
    const ownedTerritories = Object.values(territories).filter(t => t.owner === playerId).length;
    return ownedTerritories === totalTerritories;
  },

  triggerComms: async (playerId, text, clips) => {
    const { players } = get();
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    set({
      activeComms: {
        speakerId: playerId,
        text,
        timestamp: Date.now()
      }
    });

    // Play voice clips
    for (const clip of clips) {
      await soundEngine.speak(player.name.toLowerCase().replace(/\s/g, '_'), [clip]);
    }

    // Clear comms after delay
    setTimeout(() => {
      set({ activeComms: null });
    }, 4000);
  },

  fetchAdvice: async () => {
    const { territories, players, currentPlayerIndex } = get();
    const currentPlayer = players[currentPlayerIndex];

    set({ isFetchingAdvice: true });

    const advice = await withErrorHandling(
      async () => {
        const result = await getStrategicAdvice(get());
        set({ strategicAdvice: result });
        return result;
      },
      undefined,
      'Failed to fetch strategic advice'
    );

    if (!advice) {
      get().addLog('STRATEGIC ANALYSIS UNAVAILABLE');
    }

    set({ isFetchingAdvice: false });
  },

  executePerk: (perkId, targetTerritoryId) => {
    const { players, currentPlayerIndex, territories } = get();
    const currentPlayer = players[currentPlayerIndex];
    const perk = currentPlayer.perks?.find(p => p.id === perkId);

    if (!perk || !perk.isActive) return;

    // Mark perk as used (deactivate it)
    set(s => ({
      players: s.players.map(p =>
        p.id === currentPlayer.id
          ? { ...p, perks: p.perks?.map(pr => pr.id === perkId ? { ...pr, isActive: false } : pr) }
          : p
      )
    }));

    // Apply perk effect based on perk id
    if (perkId === 'p_drop' && targetTerritoryId) {
      // Orbital Drop: Deploy +5 troops to a friendly sector
      set(s => ({
        territories: {
          ...s.territories,
          [targetTerritoryId]: {
            ...s.territories[targetTerritoryId],
            troops: s.territories[targetTerritoryId].troops + 5
          }
        }
      }));
      get().addLog(`${currentPlayer.name} used Orbital Drop on ${territories[targetTerritoryId].name}`);
    } else if (perkId === 'p_strike' && targetTerritoryId) {
      // Airstrike: Remove 2 troops from an enemy sector
      const targetTerr = territories[targetTerritoryId];
      if (targetTerr.owner !== currentPlayer.id && targetTerr.troops > 2) {
        set(s => ({
          territories: {
            ...s.territories,
            [targetTerritoryId]: {
              ...s.territories[targetTerritoryId],
              troops: Math.max(1, s.territories[targetTerritoryId].troops - 2)
            }
          }
        }));
        get().addLog(`${currentPlayer.name} used Airstrike on ${targetTerr.name}`);
      }
    }
    // Other perks (Code Cracker, Strategic Foresight) would need additional implementation
  },
}));