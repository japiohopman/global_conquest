import { 
  GameState, PlayerId, TerritoryState, GamePhase, 
  BattleResult, PlayerConfig, Mission, AssetCard 
} from './types';
import { CONTINENTS } from './constants';

export const CONTINENT_BONUSES: Record<string, number> = {
  'North America': 5, 'South America': 2, 'Europe': 5, 'Africa': 2, 'Asia': 7, 'Australia': 2
};

export const calculateTurnReinforcements = (playerId: PlayerId, territories: Record<string, TerritoryState>) => {
  const playerTerrs = Object.values(territories).filter(t => t.owner === playerId && t.troops > 0);
  let bonus = Math.max(3, Math.floor(playerTerrs.length / 3));
  Object.entries(CONTINENTS).forEach(([name, ids]) => {
    if (ids.every(id => territories[id]?.owner === playerId)) {
      bonus += CONTINENT_BONUSES[name] || 0;
    }
  });
  return bonus;
};

export interface GameCommand {
  type: 'CLAIM_TERRITORY' | 'REINFORCE' | 'ATTACK' | 'FORTIFY' | 'NEXT_PHASE' | 'TRADE_CARDS' | 'FINALIZE_INVASION';
  playerId: PlayerId;
  payload: any;
}

export function validateCommand(state: GameState, command: GameCommand): boolean {
  const currentPlayer = state.players[state.currentPlayerIndex];
  if (currentPlayer.id !== command.playerId) return false;

  switch (command.type) {
    case 'CLAIM_TERRITORY':
      return state.phase === 'setup' && state.territories[command.payload.id]?.owner === 'neutral';
    case 'REINFORCE':
      return (state.phase === 'setup' || state.phase === 'reinforce') && 
             state.territories[command.payload.id]?.owner === command.playerId &&
             state.reinforcementsAvailable > 0;
    case 'ATTACK':
      const atk = state.territories[command.payload.from];
      const dfn = state.territories[command.payload.to];
      return state.phase === 'attack' && atk?.owner === command.playerId && 
             dfn?.owner !== command.playerId && atk.troops > 1;
    case 'NEXT_PHASE':
      return true; // Simple for now
    default:
      return true;
  }
}

export function applyCommand(state: GameState, command: GameCommand): GameState {
  const newState = { ...state, territories: { ...state.territories } };
  const currentPlayer = state.players[state.currentPlayerIndex];
  
  switch (command.type) {
    case 'CLAIM_TERRITORY': {
      const { id } = command.payload;
      newState.territories[id] = { ...state.territories[id], owner: command.playerId, troops: 1 };
      newState.reinforcementsAvailable = state.reinforcementsAvailable - 1;
      
      // Auto-advance turn in setup
      let nextIdx = (state.currentPlayerIndex + 1) % state.players.length;
      while (state.players[nextIdx].isEliminated) nextIdx = (nextIdx + 1) % state.players.length;
      newState.currentPlayerIndex = nextIdx;
      
      // Check if setup is done
      const allClaimed = Object.values(newState.territories).filter(t => t.continent !== 'Unknown').every(t => t.owner !== 'neutral');
      if (allClaimed && nextIdx === 0) {
        newState.phase = 'reinforce';
        newState.reinforcementsAvailable = calculateTurnReinforcements(state.players[0].id, newState.territories);
      }
      break;
    }
    case 'REINFORCE': {
      const { id } = command.payload;
      newState.territories[id] = { ...state.territories[id], troops: state.territories[id].troops + 1 };
      newState.reinforcementsAvailable = state.reinforcementsAvailable - 1;
      
      if (state.phase === 'setup') {
        let nextIdx = (state.currentPlayerIndex + 1) % state.players.length;
        while (state.players[nextIdx].isEliminated) nextIdx = (nextIdx + 1) % state.players.length;
        newState.currentPlayerIndex = nextIdx;
        if (newState.reinforcementsAvailable === 0 && nextIdx === 0) {
          newState.phase = 'reinforce';
          newState.reinforcementsAvailable = calculateTurnReinforcements(state.players[0].id, newState.territories);
        }
      }
      break;
    }
    case 'NEXT_PHASE': {
      if (state.phase === 'reinforce') newState.phase = 'attack';
      else if (state.phase === 'attack') newState.phase = 'fortify';
      else if (state.phase === 'fortify') {
        let nextIdx = (state.currentPlayerIndex + 1) % state.players.length;
        while (state.players[nextIdx].isEliminated) nextIdx = (nextIdx + 1) % state.players.length;
        newState.currentPlayerIndex = nextIdx;
        newState.phase = 'reinforce';
        newState.turnNumber = state.turnNumber + (nextIdx === 0 ? 1 : 0);
        newState.reinforcementsAvailable = calculateTurnReinforcements(state.players[nextIdx].id, newState.territories);
      }
      break;
    }
  }
  return newState;
}
