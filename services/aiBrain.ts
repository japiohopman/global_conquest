
import { TerritoryState, PlayerConfig, PlayerId, AiDifficulty } from "../types";
import { npcData, NPC } from "../npc_characters";
import { ADJACENCIES } from "../constants";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const getRandomClip = (prefix: string, max: number = 3) => `${prefix}_${Math.floor(Math.random() * max) + 1}`;

export interface AiActions {
  addLog: (msg: string) => void;
  triggerComms: (playerId: string, text: string, clips: any[]) => Promise<void>;
  nextPhase: () => void;
  setTerritories: (update: Record<string, TerritoryState>) => void;
  setReinforcements: (count: number) => void;
  tradeInCards: () => void;
  setSelectedCards: (ids: string[]) => void;
  setSelectedId: (id: string | null) => void;
  setTargetId: (id: string | null) => void;
  setAwaitingDefense: (val: boolean) => void;
  executeAttack: (aDiceCount: number, dDiceCount: number) => void;
  clearBattleResult: () => void;
  closeBattle: () => void;
}

const waitForComms = async (getState: () => any) => {
  while (getState().activeComms) {
    await sleep(200);
  }
};

export const runAiTurn = async (
  getState: () => any,
  actions: AiActions
) => {
  const state = getState();
  const aiPlayer = state.players[state.currentPlayerIndex];
  const npcProfile = (npcData.find(n => n.name.toUpperCase() === aiPlayer.name) || npcData[0]) as NPC;
  const difficulty = state.difficulty as AiDifficulty;
  
  actions.addLog(`AI INTELLIGENCE: ${aiPlayer.name} SYNCHRONIZING...`);

  try {
    if (state.phase === 'setup') {
      await sleep(1000); 
      const territoriesArr = (Object.values(getState().territories) as TerritoryState[]);
      const neutralOnes = territoriesArr.filter(t => t.owner === 'neutral');
      
      if (neutralOnes.length > 0) {
        let target = neutralOnes[Math.floor(Math.random() * neutralOnes.length)];
        if (difficulty === 'hard' || (difficulty === 'normal' && npcProfile.expansion > 0.7)) {
          const priorities = ['indonesia', 'brazil', 'alaska', 'egypt', 'new_guinea'];
          const match = neutralOnes.find(n => priorities.includes(n.id));
          if (match) target = match;
        }

        const prefixFile = getRandomClip('claiming', 5);
        await actions.triggerComms(aiPlayer.id, `Taking ${target.name}.`, [{category: 'claiming', file: prefixFile}, {category: 'territories', file: target.id}]);
        await waitForComms(getState);
        
        actions.setTerritories({ 
          ...getState().territories, 
          [target.id]: { ...target, owner: aiPlayer.id, troops: 1 } 
        });
        actions.setReinforcements(getState().reinforcementsAvailable - 1);
      } else {
        const myTerrs = territoriesArr.filter(t => t.owner === aiPlayer.id);
        const target = myTerrs[Math.floor(Math.random() * myTerrs.length)];
        
        if (Math.random() < 0.33) {
          await actions.triggerComms(aiPlayer.id, `Bolstering ${target.name}.`, [{category: 'reinforce', file: getRandomClip('reinforce')}, {category: 'territories', file: target.id}]);
          await waitForComms(getState);
        }

        actions.setTerritories({
          ...getState().territories,
          [target.id]: { ...target, troops: target.troops + 1 }
        });
        actions.setReinforcements(getState().reinforcementsAvailable - 1);
      }
      await sleep(800);
      actions.nextPhase();
      return;
    }

    const hand = state.playerHands[aiPlayer.id] || [];
    if (hand.length >= 3) {
      actions.setSelectedCards(hand.slice(0, 3).map((c: any) => c.id));
      await sleep(1000);
      const quotes = npcProfile.quotes.iconic;
      const text = quotes[Math.floor(Math.random() * quotes.length)];
      actions.addLog(`STRATEGIC ASSET RECOVERY: ${aiPlayer.name} trading sets.`);
      await actions.triggerComms(aiPlayer.id, text, [{category: 'iconic', file: getRandomClip('iconic', quotes.length)}]);
      await waitForComms(getState);
      actions.tradeInCards();
      await sleep(1000);
    }

    await sleep(1000);
    let reinforcements = getState().reinforcementsAvailable;
    if (reinforcements > 0) {
      const myTerrs = (Object.values(getState().territories) as TerritoryState[]).filter(t => t.owner === aiPlayer.id);
      const adjacencies = ADJACENCIES;
      const borders = myTerrs.filter(t => adjacencies[t.id]?.some((nid: string) => (getState().territories[nid] as TerritoryState).owner !== aiPlayer.id));
      
      // Prioritize borders that lead to mission objectives
      const mission = aiPlayer.mission;
      const missionBorders = borders.filter(t => {
        if (mission.type === 'continent') {
          return adjacencies[t.id]?.some(nid => (getState().territories[nid] as TerritoryState).continent === mission.targetContinents?.[0]);
        } else if (mission.type === 'elimination') {
          const targetPlayer = getState().players.find((p: any) => p.color === mission.targetPlayerColor);
          return targetPlayer && adjacencies[t.id]?.some(nid => (getState().territories[nid] as TerritoryState).owner === targetPlayer.id);
        }
        return false;
      });

      const primaryTarget = missionBorders.length > 0 ? missionBorders[0] : (borders.length > 0 ? borders[0] : myTerrs[0]);
      
      if (Math.random() < 0.33) {
        const reinforcePrefix = getRandomClip('reinforce');
        await actions.triggerComms(aiPlayer.id, `Bolstering ${primaryTarget.name}.`, [{category: 'reinforce', file: reinforcePrefix}, {category: 'territories', file: primaryTarget.id}]);
        await waitForComms(getState);
      }

      const rTerrs = { ...getState().territories };
      while (reinforcements > 0) {
        const weight = difficulty === 'hard' ? 0.9 : difficulty === 'normal' ? 0.6 : 0.2;
        let t;
        if (Math.random() < weight && borders.length > 0) {
            // If we have mission borders, prioritize them even more during distribution
            if (missionBorders.length > 0 && Math.random() < 0.7) {
                t = missionBorders[Math.floor(Math.random() * missionBorders.length)];
            } else {
                t = borders[Math.floor(Math.random() * borders.length)];
            }
        } else {
            t = myTerrs[Math.floor(Math.random() * myTerrs.length)];
        }
        rTerrs[t.id] = { ...rTerrs[t.id], troops: rTerrs[t.id].troops + 1 };
        reinforcements--;
      }
      actions.setTerritories(rTerrs);
      actions.setReinforcements(0);
    }
    await sleep(800);
    actions.nextPhase();

    let attacksPerformed = 0;
    const aggressionModifier = difficulty === 'hard' ? 1.0 : difficulty === 'normal' ? npcProfile.aggression : 0.3;
    const maxAttacks = Math.ceil(8 * aggressionModifier);

    while (attacksPerformed < maxAttacks) {
      if (getState().winner) break;
      const territories = getState().territories;
      const myTerrs = (Object.values(territories) as TerritoryState[]).filter(t => t.owner === aiPlayer.id && t.troops > 1);
      
      let bestAttack: { from: string, to: string, ratio: number } | null = null;
      myTerrs.forEach(from => {
        ADJACENCIES[from.id]?.forEach((toId: string) => {
          const to = territories[toId] as TerritoryState;
          if (to.owner !== aiPlayer.id) {
            let ratio = from.troops / to.troops;
            
            // Mission awareness weights
            const mission = aiPlayer.mission;
            if (mission.type === 'continent' && mission.targetContinents?.includes(to.continent)) {
              ratio *= 1.5; // Prioritize mission continents
            } else if (mission.type === 'elimination') {
              const targetPlayer = getState().players.find((p: any) => p.color === mission.targetPlayerColor);
              if (targetPlayer && to.owner === targetPlayer.id) {
                ratio *= 1.8; // High priority for elimination target
              }
            } else if (mission.type === 'territory_count') {
              ratio *= 1.1; // Slightly more aggressive to gain numbers
            }

            const baseThreshold = difficulty === 'easy' ? 2.5 : difficulty === 'normal' ? 1.8 : 1.2;
            const threshold = baseThreshold - (aggressionModifier * 0.5); 
            if (ratio > threshold && (!bestAttack || ratio > bestAttack.ratio)) {
              bestAttack = { from: from.id, to: toId, ratio };
            }
          }
        });
      });
      
      if (!bestAttack) break;
      
      const targetTerr = territories[bestAttack.to];
      const targetPlayer = getState().players.find((p: PlayerConfig) => p.id === targetTerr.owner);
      
      const attackPrefix = getRandomClip('attacking', 5);
      await actions.triggerComms(aiPlayer.id, `Invading ${targetTerr.name}.`, [{category: 'attacking', file: attackPrefix}, {category: 'territories', file: targetTerr.id}]);
      await waitForComms(getState);
      
      actions.setSelectedId(bestAttack.from);
      actions.setTargetId(bestAttack.to);
      await sleep(1000); 
      
      if (targetPlayer?.type === 'human') {
        while (getState().targetId && !getState().winner) {
          const atk = getState().territories[getState().selectedId!];
          const dfn = getState().territories[getState().targetId!];
          if (atk && dfn && atk.troops > 1 && dfn.troops > 0) {
            actions.setAwaitingDefense(true);
            while (getState().isAwaitingHumanDefense) { 
              await sleep(200); 
              if (!getState().isGameStarted || getState().winner) break; 
            }
            await sleep(2000); 
            await waitForComms(getState);
            actions.clearBattleResult();
          } else break;
        }
      } else {
        while (getState().targetId && !getState().winner) {
          const atk = getState().territories[getState().selectedId!];
          const dfn = getState().territories[getState().targetId!];
          if (atk && dfn && atk.troops > 1 && dfn.troops > 0) {
            actions.executeAttack(Math.min(3, atk.troops - 1), Math.min(2, dfn.troops));
            await sleep(1800); 
            await waitForComms(getState); 
            actions.clearBattleResult();
          } else {
            break;
          }
        }
      }
      actions.closeBattle();
      attacksPerformed++;
      await sleep(800);
    }
    actions.nextPhase();
    await sleep(800);

    const finalTerrs = (Object.values(getState().territories) as TerritoryState[]);
    const interior = finalTerrs.find(t => t.owner === aiPlayer.id && t.troops > 1 && ADJACENCIES[t.id]?.every((nid: string) => (getState().territories[nid] as TerritoryState).owner === aiPlayer.id));
    if (interior) {
      const borderTarget = ADJACENCIES[interior.id]?.find((nid: string) => {
        const n = getState().territories[nid] as TerritoryState;
        return n.owner === aiPlayer.id && ADJACENCIES[n.id]?.some((nnid: string) => (getState().territories[nnid] as TerritoryState).owner !== aiPlayer.id);
      });
      if (borderTarget) {
        const updated = { ...getState().territories };
        updated[interior.id] = { ...updated[interior.id], troops: 1 };
        updated[borderTarget] = { ...updated[borderTarget], troops: updated[borderTarget].troops + (interior.troops - 1) };
        actions.setTerritories(updated);
      }
    }
    await sleep(800);
    actions.nextPhase();
  } catch (err) {
    console.error("AI CRITICAL ENGINE FAILURE:", err);
    actions.nextPhase();
  }
};
