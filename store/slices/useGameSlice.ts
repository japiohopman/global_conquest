import { StateCreator } from 'zustand';
import { GameStore, BattleResult, CommsState } from '../types';
import { 
  GamePhase, PlayerId, TerritoryState, PlayerConfig, 
  AssetCard, Mission, AiDifficulty, SetupRule, MoveSuggestion 
} from '../../types';
import { ADJACENCIES, CONTINENTS, MISSION_LIST, FULL_DECK } from '../../constants';
import { soundEngine } from '../../services/soundEngine';
import { npcData } from '../../npc_characters';
import { runAiTurn } from '../../services/aiBrain';
import { getStrategicAdvice } from '../../services/geminiService';
import { ServiceRegistry } from '../../services/registry';
import { IValidationService } from '../../services/core/interfaces';

const STARTING_ARMIES: Record<number, number> = { 2: 40, 3: 35, 4: 30, 5: 25, 6: 20 };
const CONTINENT_BONUSES: Record<string, number> = {
  'North America': 5, 'South America': 2, 'Europe': 5, 'Africa': 2, 'Asia': 7, 'Australia': 2
};

const getRandomClip = (prefix: string, max: number = 3) => `${prefix}_${Math.floor(Math.random() * max) + 1}`;

const calculateTurnReinforcements = (playerId: PlayerId, territories: Record<string, TerritoryState>) => {
  const playerTerrs = Object.values(territories).filter(t => t.owner === playerId && t.troops > 0);
  let bonus = Math.max(3, Math.floor(playerTerrs.length / 3));
  Object.entries(CONTINENTS).forEach(([name, ids]) => {
    if (ids.every(id => territories[id]?.owner === playerId)) bonus += CONTINENT_BONUSES[name] || 0;
  });
  return bonus;
};

export interface GameSlice {
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
  isGameStarted: boolean;
  isCampaignMode: boolean;
  selectedId: string | null;
  targetId: string | null;
  selectedCards: string[];
  winner: PlayerId | null;
  logs: string[];
  isAiProcessing: boolean;
  isAwaitingHumanDefense: boolean;
  missionOptions: Mission[] | null;
  pendingMissionPlayerId: PlayerId | null;
  activeComms: CommsState | null;
  strategicAdvice: MoveSuggestion | null;
  isFetchingAdvice: boolean;
  adjacencies: Record<string, string[]>;

  initGame: (total: number, humans: { name: string, color: string, npcId?: string }[], diff: AiDifficulty, setup: SetupRule, selectedNpcIds: string[]) => void;
  selectMission: (mission: Mission) => void;
  resetGame: () => void;
  nextPhase: () => void;
  handleTerritoryClick: (id: string) => Promise<void>;
  addLog: (msg: string) => void;
  processAiTurn: () => Promise<void>;
  checkVictory: (playerId: PlayerId) => boolean;
  triggerComms: (playerId: PlayerId, text: string, clips: { category: string, file: string }[]) => Promise<void>;
  fetchAdvice: () => Promise<void>;
  tradeInCards: () => void;
  toggleCardSelection: (cardId: string) => void;
}

export const createGameSlice: StateCreator<
  GameStore,
  [],
  [],
  GameSlice
> = (set, get) => ({
  territories: {},
  players: [],
  currentPlayerIndex: 0,
  phase: 'setup',
  turnNumber: 1,
  reinforcementsAvailable: 0,
  difficulty: 'normal',
  setupRule: 'manual',
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
  isAiProcessing: false,
  isAwaitingHumanDefense: false,
  missionOptions: null,
  pendingMissionPlayerId: null,
  activeComms: null,
  strategicAdvice: null,
  isFetchingAdvice: false,
  adjacencies: ADJACENCIES,

  initGame: (total, humans, diff, setup, selectedNpcIds) => {
    const validationService = ServiceRegistry.getService<IValidationService>('ValidationService');
    const validHumans = humans.filter(h => h.name && h.name.trim().length > 0 && h.color && /^#[0-9A-F]{6}$/i.test(h.color));

    soundEngine.play('CONFIRM');
    const players: PlayerConfig[] = [];
    const usedMissionIds = new Set<string>();

    const aiCount = total - validHumans.length;
    const allPlayerColors = new Set<string>();
    validHumans.forEach(h => allPlayerColors.add(h.color));
    
    const tempAiPlayers: { npc: typeof npcData[0], id: string }[] = [];
    for (let i = 0; i < aiCount; i++) {
      const npc = npcData.find(n => n.id === selectedNpcIds[i]) || npcData[i % npcData.length];
      allPlayerColors.add(npc.color);
      tempAiPlayers.push({ npc, id: `ai_${i}` });
    }

    for (let i = 0; i < aiCount; i++) {
      const { npc, id } = tempAiPlayers[i];
      const validMissions = MISSION_LIST.filter(m => {
        if (usedMissionIds.has(m.id)) return false;
        if (m.type === 'elimination') {
          return m.targetPlayerColor !== npc.color && allPlayerColors.has(m.targetPlayerColor!);
        }
        return true;
      });

      const aiMission = (validMissions.length > 0 ? validMissions : MISSION_LIST.filter(m => m.type !== 'elimination'))
        .sort(() => Math.random() - 0.5).pop()!;
      
      usedMissionIds.add(aiMission.id);
      players.push({ 
        id, type: 'ai', color: npc.color, name: npc.name.toUpperCase(), 
        isEliminated: false, mission: aiMission, spriteIndex: npc.spriteIndex, persona: npc.persona,
        voiceKey: npc.voiceKeyOverride || npc.name.toLowerCase().replace(/\s/g, '_')
      });
    }

    humans.forEach((h, i) => {
      const npcProfile = npcData.find(n => n.id === h.npcId)!;
      players.push({ 
        id: `h_${i}` as PlayerId, type: 'human', color: h.color, name: h.name.trim() || `OPERATOR ${i+1}`, 
        isEliminated: false, mission: {} as Mission, spriteIndex: npcProfile.spriteIndex, persona: npcProfile.persona,
        voiceKey: npcProfile.voiceKeyOverride || npcProfile.name.toLowerCase().replace(/\s/g, '_')
      });
    });

    const territories: Record<string, TerritoryState> = {};
    const territoryIds = Object.keys(ADJACENCIES);
    territoryIds.forEach((id) => {
      const continent = Object.entries(CONTINENTS).find(([_, ids]) => ids.includes(id))?.[0] || 'Unknown';
      territories[id] = { id, name: id.replace(/_/g, ' ').toUpperCase(), owner: 'neutral' as PlayerId, troops: 0, continent };
    });

    if (setup === 'random') {
      const shuffledTerrs = [...territoryIds].sort(() => Math.random() - 0.5);
      shuffledTerrs.forEach((id, idx) => {
        const owner = players[idx % players.length];
        territories[id].owner = owner.id;
        territories[id].troops = 1;
      });
    }

    const startArmiesPerPlayer = STARTING_ARMIES[total] || 20;
    const playerHands: Record<PlayerId, AssetCard[]> = {};
    players.forEach(p => playerHands[p.id] = []);
    
    const newState = {
      territories, players, reinforcementsAvailable: startArmiesPerPlayer, difficulty: diff, setupRule: setup,
      deck: [...FULL_DECK].sort(() => Math.random() - 0.5), playerHands, isGameStarted: true,
      phase: 'setup' as GamePhase,
      turnNumber: 1,
      tradeInCount: 0,
      capturedThisTurn: false,
      isCampaignMode: false,
      selectedId: null,
      targetId: null,
      selectedCards: [],
      winner: null,
      logs: ["SATELLITE LINK ESTABLISHED..."],
      isAiProcessing: false,
      isAwaitingHumanDefense: false,
      missionOptions: MISSION_LIST.filter(m => {
        if (usedMissionIds.has(m.id)) return false;
        const human = players.find(p => p.type === 'human');
        if (m.type === 'elimination' && human) {
          return m.targetPlayerColor !== human.color && allPlayerColors.has(m.targetPlayerColor!);
        }
        return true;
      }).sort(() => Math.random() - 0.5).slice(0, 3),
      pendingMissionPlayerId: players.find(p => p.type === 'human')?.id || null,
      lastActionSource: 'local' as const
    };
    set(newState);

    if (!validationService.validateGameState(newState)) {
      console.error('Generated game state failed validation');
    }

    get().syncState(newState as Partial<GameStore>);
  },

  selectMission: (mission) => {
    const { pendingMissionPlayerId } = get();
    set((state) => ({
      players: state.players.map((p) => p.id === pendingMissionPlayerId ? { ...p, mission } : p),
      missionOptions: null,
      pendingMissionPlayerId: null,
    }));
    soundEngine.play('CONFIRM');
    get().addLog(`DIRECTIVE ASSIGNED: ${mission.description}`);
  },

  resetGame: () => set((state) => ({ 
    territories: {}, players: [], currentPlayerIndex: 0, phase: 'setup', turnNumber: 1, reinforcementsAvailable: 0,
    deck: [], playerHands: {}, tradeInCount: 0, capturedThisTurn: false, isGameStarted: false, 
    campaign: get().loadCampaign(), lastActionSource: 'local' as const 
  })),

  nextPhase: () => {
    const state = get();
    const currentPlayer = state.players[state.currentPlayerIndex];
    
    if (state.phase !== 'setup' && get().checkVictory(currentPlayer.id)) {
      set({ winner: currentPlayer.id });
      get().triggerComms(currentPlayer.id, `Victory is ours!`, [{category: 'victory', file: getRandomClip('victory')}]);
      return;
    }
    
    set({ selectedId: null, targetId: null });
    
    if (state.phase === 'setup') {
      let nextIdx = (state.currentPlayerIndex + 1) % state.players.length;
      while (state.players[nextIdx].isEliminated) nextIdx = (nextIdx + 1) % state.players.length;
      const startArmies = STARTING_ARMIES[state.players.length] || 20;
      const activeTerritories = Object.values(state.territories).filter(t => t.continent !== 'Unknown');
      const totalUsed = activeTerritories.reduce((s, t) => s + (t.owner === 'neutral' ? 0 : t.troops), 0);
      const totalAvailable = state.players.filter(p => !p.isEliminated).length * startArmies;
      
      if (totalUsed >= totalAvailable && nextIdx === 0) {
        const update = { currentPlayerIndex: 0, phase: 'reinforce' as const, reinforcementsAvailable: calculateTurnReinforcements(state.players[0].id, state.territories), lastActionSource: 'local' as const };
        set(update);
        get().syncState(update as Partial<GameStore>);
      } else {
        const nextPlayerId = state.players[nextIdx].id;
        const usedByNext = Object.values(state.territories).filter(t => t.owner === nextPlayerId).reduce((s,t) => s + t.troops, 0);
        const update = { currentPlayerIndex: nextIdx, reinforcementsAvailable: Math.max(0, startArmies - usedByNext), lastActionSource: 'local' as const };
        set(update);
        get().syncState(update as Partial<GameStore>);
      }
    } else if (state.phase === 'reinforce') {
      const update = { phase: 'attack' as const, lastActionSource: 'local' as const };
      set(update);
      get().syncState(update as Partial<GameStore>);
    } else if (state.phase === 'attack') {
      const update = { phase: 'fortify' as const, lastActionSource: 'local' as const };
      set(update);
      get().syncState(update as Partial<GameStore>);
    } else {
      let newHands = { ...state.playerHands };
      let newDeck = [ ...state.deck ];
      if (state.capturedThisTurn && newDeck.length > 0) {
          const card = newDeck.pop()!;
          newHands[currentPlayer.id] = [ ...newHands[currentPlayer.id], card ];
          get().addLog(`${currentPlayer.name} EXTRACTED INTEL.`);
          soundEngine.play('CARD_DRAW');
      }
      let nextIdx = (state.currentPlayerIndex + 1) % state.players.length;
      while (state.players[nextIdx].isEliminated) nextIdx = (nextIdx + 1) % state.players.length;
      const update = { 
        currentPlayerIndex: nextIdx, phase: 'reinforce' as const, capturedThisTurn: false, 
        reinforcementsAvailable: calculateTurnReinforcements(state.players[nextIdx].id, state.territories),
        playerHands: newHands, deck: newDeck, turnNumber: state.turnNumber + (nextIdx === 0 ? 1 : 0),
        lastActionSource: 'local' as const
      };
      set(update);
      get().syncState(update as Partial<GameStore>);
      soundEngine.play('TURN_START');
    }
  },

  handleTerritoryClick: async (id) => {
    const state = get();
    if (state.winner || state.pendingInvasion || state.isAiProcessing) return;
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (currentPlayer.id !== state.localPlayerId) return; // Not my turn or not me
    
    const t = state.territories[id];
    if (!t || t.continent === 'Unknown') return;

    if (state.isMultiplayer) {
      if (state.phase === 'setup') {
        const activeTerrs = Object.values(state.territories).filter(ter => ter.continent !== 'Unknown');
        const allClaimed = activeTerrs.every(ter => ter.owner !== 'neutral');
        if (!allClaimed && t.owner === 'neutral') {
          get().sendCommand({ type: 'CLAIM_TERRITORY', playerId: state.localPlayerId, payload: { id } });
        } else if (allClaimed && t.owner === state.localPlayerId && state.reinforcementsAvailable > 0) {
          get().sendCommand({ type: 'REINFORCE', playerId: state.localPlayerId, payload: { id } });
        }
      } else if (state.phase === 'reinforce' && t.owner === state.localPlayerId && state.reinforcementsAvailable > 0) {
        get().sendCommand({ type: 'REINFORCE', playerId: state.localPlayerId, payload: { id } });
      }
      // Add more multiplayer command triggers here (ATTACK, FORTIFY)
      // For now, I'll keep the local logic below for non-multiplayer
      if (state.phase !== 'setup' && state.phase !== 'reinforce') {
        // Fallback to local logic for other phases during transition
      } else {
        return; // Multiplayer handled for these phases
      }
    }

    if (state.phase === 'setup') {
        const activeTerrs = Object.values(state.territories).filter(ter => ter.continent !== 'Unknown');
        const allClaimed = activeTerrs.every(ter => ter.owner !== 'neutral');
        
        if (!allClaimed && t.owner === 'neutral') {
          soundEngine.play('DEPLOY');
          get().triggerComms(currentPlayer.id, `Claiming Sector.`, [{category: 'claiming', file: getRandomClip('claiming')}, {category: 'territories', file: t.id}]);
          const update = { reinforcementsAvailable: state.reinforcementsAvailable - 1, territories: { ...state.territories, [id]: { ...t, owner: currentPlayer.id, troops: 1 } }, lastActionSource: 'local' as const };
          set(update);
          get().syncState(update as Partial<GameStore>);
          get().nextPhase();
        } else if (allClaimed && t.owner === currentPlayer.id && state.reinforcementsAvailable > 0) {
          soundEngine.play('DEPLOY');
          const update = { reinforcementsAvailable: state.reinforcementsAvailable - 1, territories: { ...state.territories, [id]: { ...t, troops: t.troops + 1 } }, lastActionSource: 'local' as const };
          set(update);
          get().syncState(update as Partial<GameStore>);
          get().nextPhase();
        }
    } else if (state.phase === 'reinforce' && t.owner === currentPlayer.id && state.reinforcementsAvailable > 0) {
      soundEngine.play('DEPLOY');
      const update = { reinforcementsAvailable: state.reinforcementsAvailable - 1, territories: { ...state.territories, [id]: { ...t, troops: t.troops + 1 } }, lastActionSource: 'local' as const };
      set(update);
      get().syncState(update as Partial<GameStore>);
    } else if (state.phase === 'attack') {
      if (state.selectedId && t.owner !== currentPlayer.id && state.adjacencies[state.selectedId]?.includes(id) && t.troops > 0) {
        set({ targetId: id });
        soundEngine.play('ASSAULT');
      } else if (t.owner === currentPlayer.id && t.troops > 1) {
        set({ selectedId: id });
        soundEngine.play('UI_CLICK');
      }
    } else if (state.phase === 'fortify') {
        if (state.selectedId && t.owner === currentPlayer.id && id !== state.selectedId && state.adjacencies[state.selectedId]?.includes(id) && state.territories[state.selectedId].troops > 1) {
            soundEngine.play('REINFORCE');
            set((prev) => ({ territories: { ...prev.territories, [prev.selectedId!]: { ...prev.territories[prev.selectedId!], troops: prev.territories[prev.selectedId!].troops - 1 }, [id]: { ...prev.territories[id], troops: prev.territories[id].troops + 1 } } }));
        } else if (t.owner === currentPlayer.id) {
          set({ selectedId: id });
          soundEngine.play('UI_CLICK');
        }
    }
  },

  addLog: (msg) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    set((state) => ({ logs: [`[${time}] ${msg}`, ...state.logs].slice(0, 20) }));
    soundEngine.play('INTEL');
  },

  processAiTurn: async () => {
    if (get().isAiProcessing) return;
    set({ isAiProcessing: true });
    await runAiTurn(get, {
      addLog: get().addLog, triggerComms: get().triggerComms, nextPhase: get().nextPhase,
      setTerritories: (t) => set({ territories: t }), setReinforcements: (c) => set({ reinforcementsAvailable: c }),
      tradeInCards: get().tradeInCards, setSelectedCards: (ids) => set({ selectedCards: ids }),
      setSelectedId: (id) => set({ selectedId: id }), setTargetId: (id) => set({ targetId: id }),
      setAwaitingDefense: (v) => set({ isAwaitingHumanDefense: v }), executeAttack: get().executeAttack,
      clearBattleResult: get().clearBattleResult, closeBattle: get().closeBattle
    });
    set({ isAiProcessing: false });
  },

  checkVictory: (playerId) => {
    const state = get();
    if (state.phase === 'setup') return false;
    const player = state.players.find(p => p.id === playerId);
    if (!player || player.isEliminated) return false;
    
    const activeTerritories = (Object.values(state.territories) as TerritoryState[]).filter(t => t.continent !== 'Unknown');
    const playerTerritories = activeTerritories.filter(t => t.owner === playerId);
    
    if (playerTerritories.length === activeTerritories.length) return true;
    
    const m = player.mission;
    if (!m || !m.id) return false;
    
    let missionComplete = false;
    switch (m.type) {
      case 'campaign_primary': missionComplete = playerTerritories.length >= Math.floor(activeTerritories.length * 0.75); break;
      case 'territory_count': missionComplete = playerTerritories.length >= (m.territoryCount || 24); break;
      case 'continent': {
        const ownedIds = new Set(playerTerritories.map(t => t.id));
        const ownedContinents = Object.entries(CONTINENTS).filter(([_, ids]) => ids.every(id => ownedIds.has(id))).map(([name]) => name);
        const targetsComplete = m.targetContinents?.every(target => ownedContinents.includes(target)) || false;
        if (!targetsComplete) break;
        if (m.extraContinentsCount) {
          const otherContinents = ownedContinents.filter(c => !m.targetContinents?.includes(c));
          missionComplete = otherContinents.length >= m.extraContinentsCount;
        } else missionComplete = true;
        break;
      }
      case 'elimination': {
        const targetPlayer = state.players.find(p => p.color === m.targetPlayerColor);
        if (targetPlayer && targetPlayer.id !== player.id) missionComplete = targetPlayer.isEliminated;
        else missionComplete = playerTerritories.length >= 24;
        break;
      }
    }
    return missionComplete;
  },

  triggerComms: async (playerId, text, clips) => {
    const player = get().players.find(p => p.id === playerId);
    if (!player) return;
    set({ activeComms: { speakerId: playerId, text, timestamp: Date.now() } });
    await soundEngine.speak(player.voiceKey, clips);
    if (get().activeComms?.speakerId === playerId) set({ activeComms: null });
  },

  fetchAdvice: async () => {
    if (get().isFetchingAdvice) return;
    set({ isFetchingAdvice: true, strategicAdvice: null });
    try {
      const advice = await getStrategicAdvice(get());
      set({ strategicAdvice: advice });
    } catch (e) {
      get().addLog("SIGNAL INTERFERENCE: Advisory link failed.");
    } finally {
      set({ isFetchingAdvice: false });
    }
  },

  tradeInCards: () => {
    const state = get();
    const steps = [4, 6, 8, 10, 12, 15];
    const bonus = state.tradeInCount < steps.length ? steps[state.tradeInCount] : 15 + (state.tradeInCount - 5) * 5;
    const update = { 
        reinforcementsAvailable: state.reinforcementsAvailable + bonus, 
        tradeInCount: state.tradeInCount + 1, selectedCards: [], 
        playerHands: { 
            ...state.playerHands, 
            [state.players[state.currentPlayerIndex].id]: state.playerHands[state.players[state.currentPlayerIndex].id].filter(c => !state.selectedCards.includes(c.id)) 
        },
        lastActionSource: 'local' as const
    };
    set(update);
    get().syncState(update as Partial<GameStore>);
    soundEngine.play('CARD_TRADE');
  },

  toggleCardSelection: (cardId) => set((state) => ({ selectedCards: state.selectedCards.includes(cardId) ? state.selectedCards.filter(id => id !== cardId) : [...state.selectedCards, cardId].slice(0, 3) }))
});
