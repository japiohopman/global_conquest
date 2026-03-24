import { StateCreator } from 'zustand';
import { GameStore, BattleResult } from '../types';
import { soundEngine } from '../../services/soundEngine';
import { PlayerId } from '../../types';

export interface CombatSlice {
  lastBattleResult: BattleResult | null;
  pendingInvasion: { from: string, to: string, min: number } | null;
  executeAttack: (aDiceCount: number, dDiceCount: number) => void;
  clearBattleResult: () => void;
  closeBattle: () => void;
  finalizeInvasion: (count: number) => void;
  executePerk: (perkId: string, targetTerritoryId?: string) => void;
}

const getRandomClip = (prefix: string, max: number = 3) => `${prefix}_${Math.floor(Math.random() * max) + 1}`;

export const createCombatSlice: StateCreator<
  GameStore,
  [],
  [],
  CombatSlice
> = (set, get) => ({
  lastBattleResult: null,
  pendingInvasion: null,

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
            get().syncState(update as Partial<GameStore>);
            return update;
        }
        const update = { territories: updated, lastBattleResult: { aRolls, dRolls, aLoss, dLoss }, pendingInvasion: { from: state.selectedId!, to: state.targetId!, min: aDiceCount }, isAwaitingHumanDefense: false, lastActionSource: 'local' as const };
        get().syncState(update as Partial<GameStore>);
        return update;
      }
      const update = { territories: updated, lastBattleResult: { aRolls, dRolls, aLoss, dLoss }, isAwaitingHumanDefense: false, lastActionSource: 'local' as const };
      get().syncState(update as Partial<GameStore>);
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
      get().syncState(update as Partial<GameStore>);
      return update;
    });
    get().triggerComms(currentPlayer.id, "Area secured.", [{category: 'iconic', file: getRandomClip('iconic', 3)}]);
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
      case 'p_drop':
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
      case 'p_strike':
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
    }

    if (logMsg) {
      const campaign = { ...state.campaign, perks: state.campaign.perks.map(p => p.id === perkId ? { ...p, isActive: false } : p) };
      set({ ...update, campaign } as Partial<GameStore>);
      get().addLog(logMsg);
      get().syncState(update as Partial<GameStore>);
    }
  }
});
