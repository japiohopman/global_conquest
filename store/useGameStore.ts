import { create } from 'zustand';
import { GameStore } from './types';
import { createCampaignSlice } from './slices/useCampaignSlice';
import { createMultiplayerSlice } from './slices/useMultiplayerSlice';
import { createGameSlice } from './slices/useGameSlice';
import { createCombatSlice } from './slices/useCombatSlice';

export const useGameStore = create<GameStore>()((...a) => ({
  ...createCampaignSlice(...a),
  ...createMultiplayerSlice(...a),
  ...createGameSlice(...a),
  ...createCombatSlice(...a),
}));

// Initialize campaign from storage
useGameStore.getState().campaign = useGameStore.getState().loadCampaign();
