import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, RoomInfo, LobbyState } from '../../types';

interface MultiplayerStateStore {
  socket: Socket | null;
  isMultiplayer: boolean;
  roomId: string | null;
  lastActionSource: 'local' | 'remote';
  messages: ChatMessage[];
  availableRooms: RoomInfo[];
  isFetchingRooms: boolean;
  localPlayerId: string | null;
  slotIndex: number | null;
  lobby: LobbyState | null;

  // Multiplayer Actions
  connectMultiplayer: (url: string, roomId: string) => void;
  disconnectMultiplayer: () => void;
  syncState: (payload: Partial<any>) => void;
  sendChatMessage: (text: string) => void;
  fetchRooms: () => Promise<void>;
  updateLobby: (lobby: LobbyState) => void;
  selectLobbyCharacter: (npcId: string) => void;
  toggleReady: () => void;
  toggleAiSlot: (slotIndex: number) => void;
  startMultiplayerGame: () => void;
}

export const useMultiplayerState = create<MultiplayerStateStore>((set, get) => ({
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
    // Ensure we don't have multiple connections
    const existingSocket = get().socket;
    if (existingSocket) existingSocket.disconnect();

    const socket = io(url, {
      transports: ['websocket', 'polling'], // Allow polling if websocket is blocked
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on('connect', () => {
      console.log('Connected to multiplayer server as', socket.id);
      socket.emit('join-room', roomId);
      set({ isMultiplayer: true, socket, roomId });
    });

    socket.on('lobby-update', (lobby: LobbyState) => {
      console.log('Received lobby update');
      const mySlot = lobby.players.find(p => p.socketId === socket.id);
      if (mySlot) {
        set({ slotIndex: mySlot.slotIndex, localPlayerId: `h_${mySlot.slotIndex}` });
      }
      set({ lobby });
    });

    socket.on('game-started', (state: any) => {
      console.log('Multiplayer game initiated by host');
      const { socket, roomId, isMultiplayer, localPlayerId, slotIndex, lobby, ...remoteState } = state;
      set({ ...remoteState, isGameStarted: true, lastActionSource: 'remote' as const });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      set({ isMultiplayer: false, socket: null, roomId: null });
    });

    socket.on('remote-action', (action: any) => {
      // Apply remote action WITHOUT overwriting local-only state
      if (action.type === 'UPDATE_STATE') {
        const { socket, roomId, isMultiplayer, localPlayerId, slotIndex, ...remoteState } = action.payload;
        set({ ...remoteState, lastActionSource: 'remote' as const });
      }
    });

    socket.on('incoming-chat', (msg: ChatMessage) => {
      set(s => ({ messages: [...s.messages, msg].slice(-50) }));
    });

    socket.on('init', (data: { state: any, messages: any[] }) => {
      console.log('Received room initialization data');
      const newState: any = { messages: data.messages };

      if (data.state && data.state.isGameStarted) {
        // Protect local state during initialization
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

  syncState: (payload) => {
    const { socket, roomId } = get();
    if (socket && roomId) {
      socket.emit('sync-state', { roomId, state: payload });
    }
  },

  sendChatMessage: (text) => {
    const { socket, isMultiplayer, roomId, lobby } = get();
    if (!isMultiplayer || !socket || !roomId || !lobby) return;

    const mySlot = lobby.players.find(p => p.socketId === socket.id);
    if (!mySlot) return;

    const msg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: `h_${mySlot.slotIndex}`,
      senderName: mySlot.name,
      senderColor: '#ffffff', // Will be updated by game state
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
    const { socket, roomId, slotIndex } = get();
    if (socket && roomId && slotIndex !== null) {
      socket.emit('select-character', { roomId, slotIndex, npcId });
    }
  },

  toggleReady: () => {
    const { socket, roomId, slotIndex } = get();
    if (socket && roomId && slotIndex !== null) {
      socket.emit('toggle-ready', { roomId, slotIndex });
    }
  },

  toggleAiSlot: (slotIndex) => {
    const { socket, roomId } = get();
    if (socket && roomId) {
      socket.emit('toggle-ai-slot', { roomId, slotIndex });
    }
  },

  startMultiplayerGame: () => {
    const { socket, roomId } = get();
    if (socket && roomId) {
      socket.emit('start-game', { roomId });
    }
  },
}));