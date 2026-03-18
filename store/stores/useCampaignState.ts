import { create } from 'zustand';
import { CampaignState, TheatreId, CampaignMedal, CommanderPerk } from '../../types';
import { THEATRES, CAMPAIGN_MISSIONS, INITIAL_MEDALS, INITIAL_PERKS } from '../../campaign_logic';

interface CampaignStateStore {
  campaign: CampaignState;

  // Campaign Actions
  initCampaignGame: (theatreId: TheatreId, totalCommanders?: number) => void;
  unlockPerk: (perkId: string) => void;
  togglePerk: (perkId: string) => void;
  awardMedal: (medalId: string) => void;
}

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

export const useCampaignState = create<CampaignStateStore>((set, get) => ({
  campaign: loadCampaign(),

  initCampaignGame: (theatreId, totalCommanders = 2) => {
    const theatre = THEATRES.find(t => t.id === theatreId);
    if (!theatre) return;

    // Use game state initGame function (will be called from main store)
    // This just sets up campaign-specific state
    set(s => ({
      campaign: {
        ...s.campaign,
        currentTheatreId: theatreId
      }
    }));
  },

  unlockPerk: (perkId) => {
    set(s => ({
      campaign: {
        ...s.campaign,
        perks: s.campaign.perks.map(p =>
          p.id === perkId ? { ...p, unlocked: true } : p
        )
      }
    }));
    saveCampaign(get().campaign);
  },

  togglePerk: (perkId) => {
    set(s => ({
      campaign: {
        ...s.campaign,
        perks: s.campaign.perks.map(p =>
          p.id === perkId ? { ...p, isActive: !p.isActive } : p
        )
      }
    }));
    saveCampaign(get().campaign);
  },

  awardMedal: (medalId) => {
    set(s => ({
      campaign: {
        ...s.campaign,
        medals: s.campaign.medals.map(m =>
          m.id === medalId ? { ...m, isEarned: true } : m
        ),
        commandPoints: s.campaign.commandPoints + 1
      }
    }));
    saveCampaign(get().campaign);
  },
}));