import { create } from 'zustand';
import { MoveSuggestion } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface CommsState {
  speakerId: string | null;
  text: string;
  timestamp: number;
}

interface UIStateStore {
  logs: string[];
  activeComms: CommsState | null;
  strategicAdvice: MoveSuggestion | null;
  isFetchingAdvice: boolean;

  // UI Actions
  addLog: (msg: string) => void;
  triggerComms: (playerId: string, text: string, clips: { category: string, file: string }[]) => Promise<void>;
  fetchAdvice: () => Promise<void>;
  clearAdvice: () => void;
}

export const useUIState = create<UIStateStore>((set, get) => ({
  logs: ["SATELLITE LINK ESTABLISHED..."],
  activeComms: null,
  strategicAdvice: null,
  isFetchingAdvice: false,

  addLog: (msg) => {
    set(s => ({ logs: [...s.logs, msg].slice(-100) }));
  },

  triggerComms: async (playerId, text, clips) => {
    set({
      activeComms: {
        speakerId: playerId,
        text,
        timestamp: Date.now()
      }
    });

    // Play voice clips
    for (const clip of clips) {
      await soundEngine.speak(playerId.toLowerCase().replace(/\s/g, '_'), [clip]);
    }

    // Clear comms after delay
    setTimeout(() => {
      set({ activeComms: null });
    }, 4000);
  },

  fetchAdvice: async () => {
    // This will be implemented to call the game state's fetchAdvice
    // For now, just set loading state
    set({ isFetchingAdvice: true });
    // The actual implementation will be in a combined store or hook
  },

  clearAdvice: () => {
    set({ strategicAdvice: null });
  },
}));