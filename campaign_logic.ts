
import { Theatre, CampaignMedal, CommanderPerk, Mission, TheatreId } from './types';

export const THEATRES: Theatre[] = [
  {
    id: 'SKIRMISH',
    name: 'Theatre I: The Border Skirmish',
    description: 'A "regional conflict" in the South and East. Stabilize the perimeter.',
    allowedContinents: ['South America', 'Australia'],
    rivalNpcIds: ['npc_0', 'npc_5', 'npc_1'], // Chief Dealer, Desert Crown, Rising General
    primaryMissionId: 'cp1',
    unlockedAtPoints: 0
  },
  {
    id: 'RESOURCES',
    name: 'Theatre II: The Resource Rush',
    description: 'Strategic resource extraction in the West and Africa.',
    allowedContinents: ['Africa', 'North America'],
    rivalNpcIds: ['npc_5', 'npc_6', 'npc_8'], // Desert Crown, Union Chancellor, Silicon Emperor
    primaryMissionId: 'cp2',
    unlockedAtPoints: 50
  },
  {
    id: 'IRON_CURTAIN',
    name: 'Theatre III: The Iron Curtain',
    description: 'The Old World stand-off. Every border is a tripwire.',
    allowedContinents: ['Europe', 'Asia'],
    rivalNpcIds: ['npc_4', 'npc_3', 'npc_6'], // Shadow Czar, Red Emperor, Union Chancellor
    primaryMissionId: 'cp3',
    unlockedAtPoints: 150
  },
  {
    id: 'LOCKDOWN',
    name: 'Theatre IV: Global Lockdown',
    description: 'No sidelines left. Total war across the global matrix.',
    allowedContinents: ['North America', 'South America', 'Europe', 'Africa', 'Asia', 'Australia'],
    rivalNpcIds: ['npc_0', 'npc_8', 'npc_4'], // Chaos Trio
    primaryMissionId: 'cp4',
    unlockedAtPoints: 300
  },
  {
    id: 'OVERRIDE',
    name: 'Theatre V: Neural Override',
    description: 'The war learns. AI gains tactical superiority and persistent prediction.',
    allowedContinents: ['North America', 'South America', 'Europe', 'Africa', 'Asia', 'Australia'],
    rivalNpcIds: ['npc_0', 'npc_1', 'npc_2', 'npc_3', 'npc_4', 'npc_5', 'npc_6', 'npc_7', 'npc_8'],
    primaryMissionId: 'cp5',
    unlockedAtPoints: 600
  }
];

export const CAMPAIGN_MISSIONS: Record<string, Mission> = {
  'cp1': { id: 'cp1', type: 'campaign_primary', description: 'Eliminate 2 rival Commanders or control 12 territories.' },
  'cp2': { id: 'cp2', type: 'campaign_primary', description: 'Secure both North America and Africa simultaneously.' },
  'cp3': { id: 'cp3', type: 'campaign_primary', description: 'Maintain control of 3 European capitals for 10 consecutive turns.' },
  'cp4': { id: 'cp4', type: 'campaign_primary', description: 'Eliminate all rival AI Commanders.' },
  'cp5': { id: 'cp5', type: 'campaign_primary', description: 'World Domination. Leave no neutral or enemy presence.' }
};

export const INITIAL_MEDALS: CampaignMedal[] = [
  { id: 'm_blitz', name: 'Blitzkrieg', description: 'Conquer 10 territories in a single turn.', requirement: 'conquest_10_turn', isEarned: false, points: 50 },
  { id: 'm_cover', name: 'Deep Cover', description: 'Hold a secret mission for 20 turns before completion.', requirement: 'hold_mission_20', isEarned: false, points: 75 },
  { id: 'm_intel', name: 'Intelligence Superiority', description: 'Win using only Gemini-recommended moves.', requirement: 'gemini_only_win', isEarned: false, points: 100 },
  { id: 'm_bear', name: 'Bear Rider', description: 'Win as Shadow Czar without losing a Russian territory.', requirement: 'shadow_czar_russia', isEarned: false, points: 150 }
];

export const INITIAL_PERKS: CommanderPerk[] = [
  { id: 'p_drop', name: 'Orbital Drop', description: 'Deploy +5 troops to a friendly sector.', cost: 50, isUnlocked: false, isActive: false },
  { id: 'p_strike', name: 'Airstrike', description: 'Remove 2 troops from an enemy sector.', cost: 100, isUnlocked: false, isActive: false },
  { id: 'p_crack', name: 'Code Cracker', description: 'Reveal one enemy secret mission at start.', cost: 100, isUnlocked: false, isActive: false },
  { id: 'p_sight', name: 'Strategic Foresight', description: 'Preview the next global crisis event early.', cost: 150, isUnlocked: false, isActive: false }
];
