import { StateCreator } from 'zustand';
import { GameStore } from '../types';
import { CampaignState, TheatreId, PlayerId, Mission, TerritoryState } from '../../types';
import { INITIAL_MEDALS, INITIAL_PERKS, THEATRES, CAMPAIGN_MISSIONS } from '../../campaign_logic';
import { npcData } from '../../npc_characters';
import { soundEngine } from '../../services/soundEngine';
import { CONTINENTS } from '../../constants';
import { ServiceRegistry } from '../../services/registry';
import { IStorageService } from '../../services/core/interfaces';

const STORAGE_KEY = 'campaign_save';

const getRandomClip = (prefix: string, max: number = 3) => `${prefix}_${Math.floor(Math.random() * max) + 1}`;

const STARTING_ARMIES: Record<number, number> = { 2: 40, 3: 35, 4: 30, 5: 25, 6: 20 };

export interface CampaignSlice {
  campaign: CampaignState;
  initCampaignGame: (theatreId: TheatreId, totalCommanders?: number) => void;
  unlockPerk: (perkId: string) => void;
  togglePerk: (perkId: string) => void;
  awardMedal: (medalId: string) => void;
  saveCampaign: (state: CampaignState) => void;
  loadCampaign: () => CampaignState;
}

export const createCampaignSlice: StateCreator<
  GameStore,
  [],
  [],
  CampaignSlice
> = (set, get) => ({
  campaign: {
    currentTheatreId: 'SKIRMISH',
    unlockedTheatres: ['SKIRMISH'],
    commandPoints: 0,
    medals: INITIAL_MEDALS,
    perks: INITIAL_PERKS,
    npcGrudges: {}
  },

  loadCampaign: () => {
    try {
      const storage = ServiceRegistry.getService<IStorageService>('StorageService');
      const saved = storage.get<CampaignState>(STORAGE_KEY);
      if (saved) return saved;
    } catch (e) {
      console.error("Campaign load failed via ServiceRegistry, falling back to direct localStorage:", e);
      const saved = localStorage.getItem('global_conquest_' + STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e2) {
          console.error("Direct localStorage parse failed:", e2);
        }
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
  },

  saveCampaign: (state: CampaignState) => {
    try {
      const storage = ServiceRegistry.getService<IStorageService>('StorageService');
      storage.set(STORAGE_KEY, state);
    } catch (e) {
      console.error("Campaign save failed via ServiceRegistry:", e);
      localStorage.setItem('global_conquest_' + STORAGE_KEY, JSON.stringify(state));
    }
  },

  awardMedal: (id) => {
    const campaign = { ...get().campaign };
    const medal = campaign.medals.find(m => m.id === id);
    if (medal && !medal.isEarned) {
      medal.isEarned = true;
      campaign.commandPoints += medal.points;
      set({ campaign });
      get().saveCampaign(campaign);
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
      get().saveCampaign(campaign);
      soundEngine.play('CONFIRM');
    }
  },

  togglePerk: (id) => {
    const campaign = { ...get().campaign };
    campaign.perks = campaign.perks.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    );
    set({ campaign });
    get().saveCampaign(campaign);
  },

  initCampaignGame: (theatreId, totalCommanders) => {
    const theatre = THEATRES.find(t => t.id === theatreId)!;
    const campaign = get().campaign;
    
    // Auto-setup for Theatre
    const humans = [{ name: 'COMMANDER', color: '#6366f1', npcId: npcData[0].id }];
    const diff = theatreId === 'OVERRIDE' ? 'hard' : theatreId === 'LOCKDOWN' ? 'hard' : 'normal';
    
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
          territories[tid] = { ...territories[tid], owner: 'neutral' as PlayerId, troops: 0 };
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
  }
});
