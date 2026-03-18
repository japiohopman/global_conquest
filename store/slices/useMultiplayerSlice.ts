import { StateCreator } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { GameStore } from '../types';
import { LobbyState, ChatMessage, RoomInfo, PlayerConfig, Mission, TerritoryState, AssetCard, PlayerId, GameState } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import { npcData } from '../../npc_characters';
import { ADJACENCIES, CONTINENTS, FULL_DECK } from '../../constants';

const STARTING_ARMIES: Record<number, number> = { 2: 40, 3: 35, 4: 30, 5: 25, 6: 20 };

export interface MultiplayerSlice {
  socket: Socket | null;
  isMultiplayer: boolean;
  roomId: string | null;
  lastActionSource: 'local' | 'remote';
  messages: ChatMessage[];
  availableRooms: RoomInfo[];
  isFetchingRooms: boolean;
  localPlayerId: PlayerId | null;
  slotIndex: number | null;
  lobby: LobbyState | null;

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
}

export const createMultiplayerSlice: StateCreator<
  GameStore,
  [],
  [],
  MultiplayerSlice
> = (set, get) => ({
  socket: null,
  isMultiplayer: false,
  roomId: null,
  lastActionSource: 'local',
  messages: [],
  availableRooms: [],
  isFetchingRooms: false,
  localPlayerId: null,
  slotIndex: null,
  lobby: null,

  connectMultiplayer: (url, roomId) => {
    console.log('Attempting connection to:', url);
    const existingSocket = get().socket;
    if (existingSocket) existingSocket.disconnect();

    const socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    
    socket.on('connect', () => {
      console.log('Connected to multiplayer server as', socket.id);
      socket.emit('join-room', roomId);
      set({ isMultiplayer: true, socket, roomId });
    });

    socket.on('lobby-update', (lobby: LobbyState) => {
      const mySlot = lobby.players.find(p => p.socketId === socket.id);
      if (mySlot) {
        set({ slotIndex: mySlot.slotIndex, localPlayerId: `h_${mySlot.slotIndex}` as PlayerId });
      }
      set({ lobby });
    });

    socket.on('state-update', (newState: GameState) => {
      console.log('Received authoritative state update from server');
      set({ ...newState, lastActionSource: 'remote' as const });
    });

    socket.on('game-started', (state: Partial<GameStore>) => {
      const { socket, roomId, isMultiplayer, localPlayerId, slotIndex, lobby, ...remoteState } = state;
      set({ ...remoteState, isGameStarted: true, lastActionSource: 'remote' as const });
      soundEngine.play('CONFIRM');
    });

    socket.on('connect_error', (err) => {
      get().addLog(`CONNECTION ERROR: ${err.message}`);
      set({ isMultiplayer: false, socket: null, roomId: null });
    });

    socket.on('remote-action', (action: { type: string, payload: Partial<GameStore> }) => {
      if (action.type === 'UPDATE_STATE') {
        const { socket, roomId, isMultiplayer, localPlayerId, slotIndex, ...remoteState } = action.payload;
        set({ ...remoteState, lastActionSource: 'remote' as const });
      }
    });

    socket.on('incoming-chat', (msg: ChatMessage) => {
      set(s => ({ messages: [...s.messages, msg].slice(-50) }));
      soundEngine.play('INTEL');
    });

    socket.on('init', (data: { state: Partial<GameStore>, messages: ChatMessage[] }) => {
      const newState: Partial<GameStore> = { messages: data.messages };
      if (data.state && data.state.isGameStarted) {
        const { socket, roomId, isMultiplayer, localPlayerId, slotIndex, ...remoteState } = data.state;
        Object.assign(newState, remoteState);
      }
      set({ ...newState, lastActionSource: 'remote' as const });
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

  fetchRooms: async () => {
    set({ isFetchingRooms: true });
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || window.location.origin;
      const res = await fetch(`${baseUrl}/api/rooms`);
      if (res.ok) {
        const rooms = await res.json();
        set({ availableRooms: rooms });
      }
    } catch (e) {
      console.error("Failed to fetch rooms:", e);
    } finally {
      set({ isFetchingRooms: false });
    }
  },

  updateLobby: (lobby) => {
    const { socket, roomId } = get();
    if (socket && roomId) {
      socket.emit('update-lobby', { roomId, lobby });
    }
    set({ lobby });
  },

  selectLobbyCharacter: (npcId) => {
    const { lobby, slotIndex, updateLobby } = get();
    if (!lobby || slotIndex === null) return;
    
    const taken = lobby.players.some(p => p.npcId === npcId && p.slotIndex !== slotIndex);
    if (taken) {
      soundEngine.play('ERROR');
      return;
    }

    const newPlayers = lobby.players.map(p => 
      p.slotIndex === slotIndex ? { ...p, npcId } : p
    );
    updateLobby({ ...lobby, players: newPlayers });
    soundEngine.play('UI_CLICK');
  },

  toggleReady: () => {
    const { lobby, slotIndex, updateLobby } = get();
    if (!lobby || slotIndex === null) return;

    const myPlayer = lobby.players.find(p => p.slotIndex === slotIndex);
    if (!myPlayer || !myPlayer.npcId) {
      soundEngine.play('ERROR');
      return;
    }

    const newPlayers = lobby.players.map(p => 
      p.slotIndex === slotIndex ? { ...p, isReady: !p.isReady } : p
    );
    updateLobby({ ...lobby, players: newPlayers });
    soundEngine.play('CONFIRM');
  },

  toggleAiSlot: (slotIndex) => {
    const { lobby, updateLobby } = get();
    if (!lobby) return;

    const newPlayers = lobby.players.map(p => {
      if (p.slotIndex === slotIndex) {
        if (p.type === 'human' && p.socketId === null) {
          const takenNpcIds = lobby.players.map(lp => lp.npcId).filter(id => !!id);
          const availableNpc = npcData.find(n => !takenNpcIds.includes(n.id));
          return {
            ...p,
            type: 'ai' as const,
            npcId: availableNpc?.id || null,
            name: availableNpc ? `BOT ${availableNpc.name.toUpperCase()}` : 'BOT COMMANDER',
            isReady: true
          };
        } else if (p.type === 'ai') {
          return {
            ...p,
            type: 'human' as const,
            npcId: null,
            name: `COMMANDER ${p.slotIndex + 1}`,
            isReady: false
          };
        }
      }
      return p;
    });

    updateLobby({ ...lobby, players: newPlayers });
    soundEngine.play('UI_CLICK');
  },

  startMultiplayerGame: () => {
    const { lobby, socket, roomId } = get();
    if (!lobby || !socket || !roomId) return;

    const activeLobbyPlayers = lobby.players.filter(p => p.npcId !== null && (p.socketId !== null || p.type === 'ai'));
    if (activeLobbyPlayers.length < 2) {
      soundEngine.play('ERROR');
      return;
    }

    const players: PlayerConfig[] = activeLobbyPlayers.map(p => {
      const npcProfile = npcData.find(n => n.id === p.npcId)!;
      return { 
        id: (p.type === 'human' ? `h_${p.slotIndex}` : `ai_${p.slotIndex}`) as PlayerId, 
        type: p.type, 
        color: npcProfile.color, 
        name: p.name, 
        isEliminated: false, 
        mission: {} as Mission, 
        spriteIndex: npcProfile.spriteIndex, 
        persona: npcProfile.persona,
        voiceKey: npcProfile.voiceKeyOverride || npcProfile.name.toLowerCase().replace(/\s/g, '_')
      };
    });

    const territoryIds = Object.keys(ADJACENCIES);
    const territories: Record<string, TerritoryState> = {};
    territoryIds.forEach((id) => {
      const continent = Object.entries(CONTINENTS).find(([_, ids]) => ids.includes(id))?.[0] || 'Unknown';
      territories[id] = { id, name: id.replace(/_/g, ' ').toUpperCase(), owner: 'neutral' as PlayerId, troops: 0, continent };
    });

    const shuffledTerrs = [...territoryIds].sort(() => Math.random() - 0.5);
    shuffledTerrs.forEach((id, idx) => {
      const owner = players[idx % players.length];
      territories[id].owner = owner.id;
      territories[id].troops = 1;
    });

    const total = players.length;
    const startArmiesPerPlayer = STARTING_ARMIES[total] || 20;
    const playerHands: Record<PlayerId, AssetCard[]> = {};
    players.forEach(p => playerHands[p.id] = []);

    // We can't use get() to spread the whole initialState here easily without importing it,
    // but we can pass the important bits.
    const gameState = {
      territories, players, reinforcementsAvailable: startArmiesPerPlayer, 
      difficulty: lobby.difficulty, setupRule: lobby.setupRule,
      deck: [...FULL_DECK].sort(() => Math.random() - 0.5), playerHands, isGameStarted: true,
      phase: 'setup' as const,
      turnNumber: 1,
      tradeInCount: 0,
      capturedThisTurn: false,
    };

    socket.emit('start-game', { roomId, gameState });
  },

  syncState: (payload) => {
    const { socket, isMultiplayer, roomId } = get();
    if (isMultiplayer && socket && roomId) {
      socket.emit('action', { roomId, action: { type: 'UPDATE_STATE', payload } });
    }
  },

  sendCommand: (command) => {
    const { socket, isMultiplayer, roomId } = get();
    if (isMultiplayer && socket && roomId) {
      socket.emit('game-command', { roomId, command });
    }
  },
});
