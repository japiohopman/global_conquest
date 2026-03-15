
import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { 
  GameState, PlayerId, GamePhase, TerritoryState, AssetCard, PlayerConfig, 
  Mission, MoveSuggestion, AiDifficulty, SetupRule, 
  CampaignState, TheatreId, CampaignMedal, CommanderPerk 
} from '../types';
import { ADJACENCIES, CONTINENTS, FULL_DECK, MISSION_LIST, PLAYER_COLORS } from '../constants';
import { soundEngine } from '../services/soundEngine';
import { npcData } from '../npc_characters';
import { getStrategicAdvice } from '../services/geminiService';
import { runAiTurn } from '../services/aiBrain';
import { THEATRES, CAMPAIGN_MISSIONS, INITIAL_MEDALS, INITIAL_PERKS } from '../campaign_logic';

const getRandomClip = (prefix: string, max: number = 3) => `${prefix}_${Math.floor(Math.random() * max) + 1}`;

interface BattleResult {
  aRolls: number[];
  dRolls: number[];
  aLoss: number;
  dLoss: number;
}

interface CommsState {
  speakerId: PlayerId | null;
  text: string;
  timestamp: number;
}

interface GameStore extends GameState {
  campaign: CampaignState;
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
  messages: ChatMessage[];
  
  // Multiplayer
  socket: Socket | null;
  isMultiplayer: boolean;
  roomId: string | null;
  lastActionSource: 'local' | 'remote';
  connectMultiplayer: (url: string, roomId: string) => void;
  disconnectMultiplayer: () => void;
  syncState: (payload: Partial<GameStore>) => void;
  sendChatMessage: (text: string) => void;
  
  // Campaign Actions
  initCampaignGame: (theatreId: TheatreId, totalCommanders?: number) => void;
  unlockPerk: (perkId: string) => void;
  togglePerk: (perkId: string) => void;
  awardMedal: (medalId: string) => void;
  
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

const STORAGE_KEY = 'global_conquest_campaign_save';

const loadCampaign = (): CampaignState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Campaign load failed:", e);
    }
  }
  return {
    currentTheatreId: 'SKIRMISH',
    unlockedTheatres: ['SKIRMISH'],
    commandPoints: 0,
    medals: INITIAL_MEDALS,
    perks: INITIAL_PERKS,
    npcGrudges: {}
  };
};

const saveCampaign = (state: CampaignState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  campaign: loadCampaign(),
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
  messages: [],
  socket: null,
  isMultiplayer: false,
  roomId: null,
  lastActionSource: 'local' as const,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  connectMultiplayer: (url, roomId) => {
    console.log('Attempting connection to:', url);
    // Ensure we don't have multiple connections
    const existingSocket = get().socket;
    if (existingSocket) existingSocket.disconnect();

    const socket = io(url, {
      transports: ['websocket', 'polling'], // Allow polling if websocket is blocked
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    
    socket.on('connect', () => {
      console.log('Connected to multiplayer server');
      socket.emit('join-room', roomId);
      set({ isMultiplayer: true, socket, roomId });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      get().addLog(`CONNECTION ERROR: ${err.message}`);
      set({ isMultiplayer: false, socket: null, roomId: null });
    });

    socket.on('remote-action', (action: any) => {
      console.log('Received remote action:', action);
      // Apply remote action without re-emitting
      if (action.type === 'UPDATE_STATE') {
        set({ ...action.payload, lastActionSource: 'remote' as const });
      }
    });

    socket.on('incoming-chat', (msg: ChatMessage) => {
      set(s => ({ messages: [...s.messages, msg].slice(-50) })); // Keep last 50
      soundEngine.play('INTEL');
    });

    socket.on('init', (state: any) => {
      console.log('Received initial state:', state);
      if (state && state.isGameStarted) {
        set({ ...state, lastActionSource: 'remote' as const });
      }
    });

    socket.on('disconnect', () => {
      set({ isMultiplayer: false, socket: null });
    });
  },

  disconnectMultiplayer: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isMultiplayer: false, roomId: null, messages: [] });
    }
  },

  sendChatMessage: (text) => {
    const { socket, isMultiplayer, roomId, players, currentPlayerIndex } = get();
    if (!isMultiplayer || !socket || !roomId) return;

    const me = players[currentPlayerIndex];
    if (!me) return;

    const msg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: me.id,
      senderName: me.name,
      senderColor: me.color,
      text,
      timestamp: Date.now()
    };

    socket.emit('chat-message', { roomId, message: msg });
    set(s => ({ messages: [...s.messages, msg].slice(-50) }));
  },

  syncState: (payload) => {
    const { socket, isMultiplayer, roomId } = get();
    if (isMultiplayer && socket && roomId) {
      socket.emit('action', { roomId, action: { type: 'UPDATE_STATE', payload } });
    }
  },

  awardMedal: (id) => {
    const campaign = { ...get().campaign };
    const medal = campaign.medals.find(m => m.id === id);
    if (medal && !medal.isEarned) {
      medal.isEarned = true;
      campaign.commandPoints += medal.points;
      set({ campaign });
      saveCampaign(campaign);
      get().addLog(`MEDAL EARNED: ${medal.name}. +${medal.points} CP.`);
      soundEngine.play('VICTORY');
    }
  },

  unlockPerk: (id) => {
    const campaign = { ...get().campaign };
    const perk = campaign.perks.find(p => p.id === id);
    if (perk && !perk.isUnlocked && campaign.commandPoints >= perk.cost) {
      perk.isUnlocked = true;
      campaign.commandPoints -= perk.cost;
      set({ campaign });
      saveCampaign(campaign);
      soundEngine.play('CONFIRM');
    }
  },

  togglePerk: (id) => {
    const campaign = { ...get().campaign };
    campaign.perks = campaign.perks.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    );
    set({ campaign });
    saveCampaign(campaign);
  },

  initCampaignGame: (theatreId, totalCommanders) => {
    const theatre = THEATRES.find(t => t.id === theatreId)!;
    const campaign = get().campaign;
    
    // Auto-setup for Theatre
    const humans = [{ name: 'COMMANDER', color: PLAYER_COLORS[0], npcId: npcData[0].id }];
    const diff: AiDifficulty = theatreId === 'OVERRIDE' ? 'hard' : theatreId === 'LOCKDOWN' ? 'hard' : 'normal';
    
    // Use the provided totalCommanders or fallback to theatre default
    const count = totalCommanders || (theatre.rivalNpcIds.length + 1);
    // Pick a subset of rivals if count is smaller than default
    const selectedRivals = theatre.rivalNpcIds.slice(0, count - 1);

    // Core Init with NO random distribution first
    get().initGame(count, humans, diff, 'manual', selectedRivals);

    if (selectedRivals.length > 0) {
      const mainRivalId = `ai_0`;
      get().triggerComms(mainRivalId, `Welcome to the theatre of war.`, [{category: 'campaign_intro', file: getRandomClip('campaign_intro')}]);
    }
    
    set(state => {
      const territories = { ...state.territories };
      const allowedTerritoryIds = theatre.allowedContinents.flatMap(c => CONTINENTS[c]);
      
      // Neutralize the non-theatre world
      Object.keys(territories).forEach(tid => {
        if (!allowedTerritoryIds.includes(tid)) {
          territories[tid] = { ...territories[tid], owner: 'neutral', troops: 0 };
        }
      });
      
      // Distribute ONLY theatre territories to players
      const playerIds = state.players.map(p => p.id);
      const shuffledAllowed = [...allowedTerritoryIds].sort(() => Math.random() - 0.5);
      shuffledAllowed.forEach((tid, idx) => {
        const ownerId = playerIds[idx % playerIds.length];
        territories[tid] = { ...territories[tid], owner: ownerId, troops: 1 };
      });

      const updatedPlayers = [...state.players];
      const human = updatedPlayers.find(p => p.type === 'human');
      if (human) human.mission = CAMPAIGN_MISSIONS[theatre.primaryMissionId];

      // Re-calculate setup reinforcements based on used territories
      const playersInvolved = updatedPlayers.length;
      const startArmies = STARTING_ARMIES[playersInvolved] || 20;
      
      return { 
        territories, 
        players: updatedPlayers, 
        isCampaignMode: true, 
        missionOptions: null, 
        pendingMissionPlayerId: null,
        campaign: { ...campaign, currentTheatreId: theatreId },
        reinforcementsAvailable: startArmies - (Math.floor(shuffledAllowed.length / playersInvolved) || 1)
      };
    });

    // Apply Active Perks
    campaign.perks.filter(p => p.isActive).forEach(perk => {
      if (perk.id === 'p_drop') {
        set(state => {
          const humanId = state.players.find(p => p.type === 'human')?.id;
          const myTerrs = Object.values(state.territories).filter(t => t.owner === humanId && t.troops > 0);
          if (myTerrs.length > 0) {
            const random = myTerrs[Math.floor(Math.random() * myTerrs.length)];
            return {
              territories: {
                ...state.territories,
                [random.id]: { ...random, troops: random.troops + 5 }
              }
            };
          }
          return state;
        });
      }
    });
  },

  initGame: (total, humans, diff, setup, selectedNpcIds) => {
    soundEngine.play('CONFIRM');
    const players: PlayerConfig[] = [];
    const usedMissionIds = new Set<string>();
    
    const aiCount = total - humans.length;
    const allPlayerColors = new Set<string>();
    humans.forEach(h => allPlayerColors.add(h.color));
    
    // First pass: build players to know all colors
    const tempAiPlayers: any[] = [];
    for (let i = 0; i < aiCount; i++) {
      const npc = npcData.find(n => n.id === selectedNpcIds[i]) || npcData[i % npcData.length];
      allPlayerColors.add(npc.color);
      tempAiPlayers.push({ npc, id: `ai_${i}` });
    }

    // Second pass: assign missions
    for (let i = 0; i < aiCount; i++) {
      const { npc, id } = tempAiPlayers[i];
      const validMissions = MISSION_LIST.filter(m => {
        if (usedMissionIds.has(m.id)) return false;
        if (m.type === 'elimination') {
          // Cannot eliminate self, and target must be in game
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
        id: `h_${i}`, type: 'human', color: h.color, name: h.name.trim() || `OPERATOR ${i+1}`, 
        isEliminated: false, mission: {} as Mission, spriteIndex: npcProfile.spriteIndex, persona: npcProfile.persona,
        voiceKey: npcProfile.voiceKeyOverride || npcProfile.name.toLowerCase().replace(/\s/g, '_')
      });
    });

    const territories: Record<string, TerritoryState> = {};
    const territoryIds = Object.keys(ADJACENCIES);
    territoryIds.forEach((id) => {
      const continent = Object.entries(CONTINENTS).find(([_, ids]) => ids.includes(id))?.[0] || 'Unknown';
      territories[id] = { id, name: id.replace(/_/g, ' ').toUpperCase(), owner: 'neutral', troops: 0, continent };
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
      ...initialState, territories, players, reinforcementsAvailable: startArmiesPerPlayer, difficulty: diff, setupRule: setup,
      deck: [...FULL_DECK].sort(() => Math.random() - 0.5), playerHands, isGameStarted: true,
      pendingMissionPlayerId: players.find(p => p.type === 'human')?.id,
      missionOptions: MISSION_LIST.filter(m => {
        if (usedMissionIds.has(m.id)) return false;
        const human = players.find(p => p.type === 'human');
        if (m.type === 'elimination' && human) {
          return m.targetPlayerColor !== human.color && allPlayerColors.has(m.targetPlayerColor!);
        }
        return true;
      }).sort(() => Math.random() - 0.5).slice(0, 3),
      lastActionSource: 'local' as const
    };
    set(newState);
    get().syncState(newState);
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

  checkVictory: (playerId: PlayerId) => {
    const state = get();
    // NEVER CHECK VICTORY DURING SETUP - Prevent instant loss/win bugs
    if (state.phase === 'setup') return false;

    const player = state.players.find(p => p.id === playerId);
    if (!player || player.isEliminated) return false;
    
    // Territories that are intended to be playable in the current theatre
    const activeTerritories = (Object.values(state.territories) as TerritoryState[]).filter(t => t.continent !== 'Unknown');
    const playerTerritories = activeTerritories.filter(t => t.owner === playerId);
    
    const isTotalDomination = playerTerritories.length === activeTerritories.length;

    if (isTotalDomination) {
      if (state.isCampaignMode) {
        const campaign = { ...state.campaign };
        const currentTheatreIdx = THEATRES.findIndex(t => t.id === campaign.currentTheatreId);
        if (currentTheatreIdx < THEATRES.length - 1) {
          const nextTheatre = THEATRES[currentTheatreIdx + 1];
          if (!campaign.unlockedTheatres.includes(nextTheatre.id)) {
            campaign.unlockedTheatres.push(nextTheatre.id);
          }
        }
        campaign.commandPoints += 100;
        set({ campaign });
        saveCampaign(campaign);
      }
      return true;
    }
    
    const m = player.mission;
    if (!m || !m.id) return false;
    
    let missionComplete = false;
    switch (m.type) {
      case 'campaign_primary': missionComplete = playerTerritories.length >= Math.floor(activeTerritories.length * 0.75); break;
      case 'territory_count': missionComplete = playerTerritories.length >= (m.territoryCount || 24); break;
      case 'continent': {
        const ownedIds = new Set(playerTerritories.map(t => t.id));
        const ownedContinents = Object.entries(CONTINENTS)
          .filter(([_, ids]) => ids.every(id => ownedIds.has(id)))
          .map(([name]) => name);
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
        // Standard Risk Rule: If target is self or not in game, objective is 24 territories
        if (targetPlayer && targetPlayer.id !== player.id) {
          missionComplete = targetPlayer.isEliminated;
        } else {
          missionComplete = playerTerritories.length >= 24;
        }
        break;
      }
    }

    if (missionComplete && state.isCampaignMode) {
        const campaign = { ...state.campaign };
        campaign.commandPoints += 50; 
        set({ campaign });
        saveCampaign(campaign);
    }

    return missionComplete;
  },

  nextPhase: () => {
    const state = get();
    const currentPlayer = state.players[state.currentPlayerIndex];
    
    // Guard against checking victory before game logic actually starts
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
        get().syncState(update);
      } else {
        const nextPlayerId = state.players[nextIdx].id;
        const usedByNext = Object.values(state.territories).filter(t => t.owner === nextPlayerId).reduce((s,t) => s + t.troops, 0);
        const update = { currentPlayerIndex: nextIdx, reinforcementsAvailable: Math.max(0, startArmies - usedByNext), lastActionSource: 'local' as const };
        set(update);
        get().syncState(update);
      }
    } else if (state.phase === 'reinforce') {
      const update = { phase: 'attack' as const, lastActionSource: 'local' as const };
      set(update);
      get().syncState(update);
    } else if (state.phase === 'attack') {
      const update = { phase: 'fortify' as const, lastActionSource: 'local' as const };
      set(update);
      get().syncState(update);
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
      get().syncState(update);
      soundEngine.play('TURN_START');
    }
  },

  handleTerritoryClick: async (id) => {
    const state = get();
    if (state.winner || state.pendingInvasion || state.isAiProcessing) return;
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (currentPlayer.type === 'ai') return;
    
    const t = state.territories[id];
    // Block clicks on non-playable territories
    if (!t || t.continent === 'Unknown') return;

    if (state.phase === 'setup') {
        const activeTerrs = Object.values(state.territories).filter(ter => ter.continent !== 'Unknown');
        const allClaimed = activeTerrs.every(ter => ter.owner !== 'neutral');
        
        if (!allClaimed && t.owner === 'neutral') {
          soundEngine.play('DEPLOY');
          get().triggerComms(currentPlayer.id, `Claiming Sector.`, [{category: 'claiming', file: getRandomClip('claiming')}, {category: 'territories', file: t.id}]);
          const update = { reinforcementsAvailable: state.reinforcementsAvailable - 1, territories: { ...state.territories, [id]: { ...t, owner: currentPlayer.id, troops: 1 } }, lastActionSource: 'local' as const };
          set(update);
          get().syncState(update);
          get().nextPhase();
        } else if (allClaimed && t.owner === currentPlayer.id && state.reinforcementsAvailable > 0) {
          soundEngine.play('DEPLOY');
          if (Math.random() < 0.33) {
            get().triggerComms(currentPlayer.id, `Bolstering defenses.`, [{category: 'reinforce', file: getRandomClip('reinforce')}]);
          }
          const update = { reinforcementsAvailable: state.reinforcementsAvailable - 1, territories: { ...state.territories, [id]: { ...t, troops: t.troops + 1 } }, lastActionSource: 'local' as const };
          set(update);
          get().syncState(update);
          get().nextPhase();
        }
    } else if (state.phase === 'reinforce' && t.owner === currentPlayer.id && state.reinforcementsAvailable > 0) {
      soundEngine.play('DEPLOY');
      if (Math.random() < 0.33) {
        get().triggerComms(currentPlayer.id, `Reinforcing sector.`, [{category: 'reinforce', file: getRandomClip('reinforce')}]);
      }
      const update = { reinforcementsAvailable: state.reinforcementsAvailable - 1, territories: { ...state.territories, [id]: { ...t, troops: t.troops + 1 } }, lastActionSource: 'local' as const };
      set(update);
      get().syncState(update);
    } else if (state.phase === 'attack') {
      if (state.selectedId && t.owner !== currentPlayer.id && state.adjacencies[state.selectedId]?.includes(id) && t.troops > 0) {
        set({ targetId: id });
        soundEngine.play('ASSAULT');
        const defenderId = t.owner;
        if (defenderId !== 'neutral') {
          get().triggerComms(defenderId, `Defending territory.`, [{category: 'defend', file: getRandomClip('defend')}]);
        }
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

  executeAttack: (aDiceCount, dDiceCount) => {
    const state = get();
    if (!state.selectedId || !state.targetId) return;
    const attacker = state.territories[state.selectedId];
    const defender = state.territories[state.targetId];
    if (!attacker || !defender) return;
    
    const aRolls = Array.from({ length: aDiceCount }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a);
    const dRolls = Array.from({ length: dDiceCount }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a);
    
    let aLoss = 0, dLoss = 0;
    for (let i = 0; i < Math.min(aRolls.length, dRolls.length); i++) {
      if (aRolls[i] > dRolls[i]) dLoss++; else aLoss++;
    }

    if (dLoss > aLoss) soundEngine.play('BATTLE_WIN');
    else if (aLoss > dLoss) soundEngine.play('BATTLE_LOSS');
    
    set((prev) => {
      const updated = { ...prev.territories };
      const attackerTroops = Math.max(1, attacker.troops - aLoss);
      const defenderTroops = Math.max(0, defender.troops - dLoss);
      updated[state.selectedId!] = { ...attacker, troops: attackerTroops };
      updated[state.targetId!] = { ...defender, troops: defenderTroops };
      
      if (defenderTroops === 0) {
        soundEngine.play('CAPTURE');
        const activePlayer = state.players[state.currentPlayerIndex];
        const oldOwnerId = defender.owner;

        if (activePlayer.type === 'ai') {
            const move = attackerTroops - 1;
            updated[state.targetId!] = { ...updated[state.targetId!], owner: activePlayer.id, troops: move };
            updated[state.selectedId!] = { ...updated[state.selectedId!], troops: 1 };
            const activeTerrs = Object.values(updated).filter(t => t.continent !== 'Unknown');
            const defenderExists = activeTerrs.some(t => t.owner === oldOwnerId && t.troops > 0);
            if (!defenderExists && state.isCampaignMode && oldOwnerId !== 'neutral') {
              get().triggerComms(oldOwnerId, `I have been defeated.`, [{category: 'campaign_defeat', file: getRandomClip('campaign_defeat')}]);
            }
            const updatedPlayers = prev.players.map(p => p.id === oldOwnerId ? { ...p, isEliminated: !defenderExists } : p);
            const update = { territories: updated, players: updatedPlayers, lastBattleResult: { aRolls, dRolls, aLoss, dLoss }, targetId: null, selectedId: null, capturedThisTurn: true, isAwaitingHumanDefense: false, lastActionSource: 'local' as const };
            get().syncState(update);
            return update;
        }
        const update = { territories: updated, lastBattleResult: { aRolls, dRolls, aLoss, dLoss }, pendingInvasion: { from: state.selectedId!, to: state.targetId!, min: aDiceCount }, isAwaitingHumanDefense: false, lastActionSource: 'local' as const };
        get().syncState(update);
        return update;
      }
      const update = { territories: updated, lastBattleResult: { aRolls, dRolls, aLoss, dLoss }, isAwaitingHumanDefense: false, lastActionSource: 'local' as const };
      get().syncState(update);
      return update;
    });
  },

  clearBattleResult: () => set({ lastBattleResult: null }),
  closeBattle: () => set({ selectedId: null, targetId: null, lastBattleResult: null, isAwaitingHumanDefense: false }),

  finalizeInvasion: (count) => {
    const state = get();
    if (!state.pendingInvasion) return;
    const { from, to } = state.pendingInvasion;
    const currentPlayer = state.players[state.currentPlayerIndex];

    set((prev) => {
      const updated = { ...prev.territories };
      const fromT = updated[from];
      const actualCount = Math.max(state.pendingInvasion!.min, Math.min(count, fromT.troops - 1));
      const oldOwnerId = updated[to].owner;
      updated[from] = { ...fromT, troops: fromT.troops - actualCount };
      updated[to] = { ...updated[to], owner: currentPlayer.id, troops: actualCount };
      
      const activeTerrs = Object.values(updated).filter(t => t.continent !== 'Unknown');
      const defenderExists = activeTerrs.some(t => t.owner === oldOwnerId && t.troops > 0);
      if (!defenderExists && oldOwnerId !== 'neutral') {
          soundEngine.play('PLAYER_ELIMINATED');
          if (state.isCampaignMode) {
            get().triggerComms(oldOwnerId, `I have been defeated.`, [{category: 'campaign_defeat', file: getRandomClip('campaign_defeat')}]);
          }
      }
      const updatedPlayers = prev.players.map(p => p.id === oldOwnerId ? { ...p, isEliminated: !defenderExists } : p);
      const update = { territories: updated, players: updatedPlayers, pendingInvasion: null, selectedId: null, targetId: null, capturedThisTurn: true, lastActionSource: 'local' as const };
      get().syncState(update);
      return update;
    });
    get().triggerComms(currentPlayer.id, "Area secured.", [{category: 'iconic', file: getRandomClip('iconic', 3)}]);
  },

  processAiTurn: async () => {
    if (get().isAiProcessing) return;
    set({ isAiProcessing: true });
    await runAiTurn(get, {
      addLog: get().addLog, triggerComms: get().triggerComms, nextPhase: get().nextPhase,
      setTerritories: (t) => set({ territories: t }), setReinforcements: (c) => set({ reinforcementsAvailable: c }),
      tradeInCards: get().tradeInCards, setSelectedCards: (ids) => set({ selectedCards: ids }),
      setSelectedId: (id) => set({ selectedId: id }), 
      setTargetId: (id) => {
        set({ targetId: id });
        if (id) {
          const t = get().territories[id];
          if (t && t.owner !== 'neutral') {
            get().triggerComms(t.owner, `Defending territory.`, [{category: 'defend', file: getRandomClip('defend')}]);
          }
        }
      },
      setAwaitingDefense: (v) => set({ isAwaitingHumanDefense: v }), executeAttack: get().executeAttack,
      clearBattleResult: () => set({ lastBattleResult: null }), closeBattle: () => set({ selectedId: null, targetId: null })
    });
    set({ isAiProcessing: false });
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

  executePerk: (perkId, targetTerritoryId) => {
    const state = get();
    const perk = state.campaign.perks.find(p => p.id === perkId);
    if (!perk || !perk.isUnlocked) return;

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (currentPlayer.type !== 'human') return;

    let update: Partial<GameStore> = {};
    let logMsg = "";

    switch (perkId) {
      case 'p_drop': // Orbital Drop: +5 troops
        if (targetTerritoryId) {
          const t = state.territories[targetTerritoryId];
          if (t.owner === currentPlayer.id) {
            update = { 
              territories: { ...state.territories, [targetTerritoryId]: { ...t, troops: t.troops + 5 } }
            };
            logMsg = `ORBITAL DROP SUCCESSFUL: +5 TROOPS IN ${t.name}.`;
            soundEngine.play('ORBITAL_DROP');
          }
        }
        break;
      case 'p_strike': // Airstrike: -2 enemy troops
        if (targetTerritoryId) {
          const t = state.territories[targetTerritoryId];
          if (t.owner !== currentPlayer.id && t.troops > 1) {
            update = { 
              territories: { ...state.territories, [targetTerritoryId]: { ...t, troops: Math.max(1, t.troops - 2) } }
            };
            logMsg = `AIRSTRIKE CONFIRMED: -2 TROOPS IN ${t.name}.`;
            soundEngine.play('AIRSTRIKE');
          }
        }
        break;
      // Add more active perks here
    }

    if (logMsg) {
      const campaign = { ...state.campaign, perks: state.campaign.perks.map(p => p.id === perkId ? { ...p, isActive: false } : p) };
      set({ ...update, campaign });
      get().addLog(logMsg);
      get().syncState(update);
    }
  },

  addLog: (msg) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    set((state) => ({ logs: [`[${time}] ${msg}`, ...state.logs].slice(0, 20) }));
    soundEngine.play('INTEL');
  },

  resetGame: () => set({ ...initialState, isGameStarted: false, campaign: loadCampaign(), lastActionSource: 'local' as const }),
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
    get().syncState(update);
    soundEngine.play('CARD_TRADE');
  },
  toggleCardSelection: (cardId) => set((state) => ({ selectedCards: state.selectedCards.includes(cardId) ? state.selectedCards.filter(id => id !== cardId) : [...state.selectedCards, cardId].slice(0, 3) }))
}));
