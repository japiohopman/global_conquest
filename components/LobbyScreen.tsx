import React, { useState } from 'react';
import { useGameStore } from '../store';
import { npcData, NPC } from '../npc_characters';
import { soundEngine } from '../services/soundEngine';
import { Users, ShieldAlert } from 'lucide-react';
import { Avatar } from './Avatar';
import GlobeIntro from './GlobeIntro';
import { LobbyPlayer } from '../types';

const PlayerSlot: React.FC<{
  idx: number;
  player: LobbyPlayer | undefined;
  npc: NPC | null;
  isVacant: boolean;
  isAi: boolean;
  isHost: boolean;
  slotIndex: number;
  onToggleAi: (idx: number) => void;
  canAddAi: boolean;
}> = React.memo(({ idx, player, npc, isVacant, isAi, isHost, slotIndex, onToggleAi, canAddAi }) => (
  <div className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${slotIndex === idx ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.2)]' : 'bg-black/40 border-white/5'}`}>
    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-900 border border-white/10">
      {npc ? <Avatar spriteIndex={npc.spriteIndex} type="head" className="w-full h-full" noBorder /> : <div className="w-full h-full flex items-center justify-center opacity-20"><Users className="w-6 h-6" /></div>}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center">
        <span className="text-sm bangers tracking-widest uppercase truncate">{player ? player.name : `VACANT SLOT ${idx + 1}`}</span>
        {player?.isHost && <span className="text-[8px] font-black text-amber-500 border border-amber-500/30 px-1.5 py-0.5 rounded uppercase">Host</span>}
        {isAi && <span className="text-[8px] font-black text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded uppercase">AI</span>}
      </div>
      <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest truncate">
        {npc ? npc.name : isVacant ? 'Waiting for connection...' : 'Configuring...'}
      </div>
    </div>
    
    {isHost && isVacant && idx !== slotIndex && (
      <button 
        onClick={() => onToggleAi(idx)} 
        disabled={!canAddAi}
        className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {canAddAi ? 'Add AI' : 'No NPCs'}
      </button>
    )}
    {isHost && isAi && (
      <button onClick={() => onToggleAi(idx)} className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-[8px] font-black text-red-500 uppercase tracking-widest transition-all">Remove</button>
    )}
    
    {player && !isVacant && (
      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${player.isReady ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]' : 'bg-zinc-800'}`} />
    )}
  </div>
));

const CharacterSelector: React.FC<{
  lobby: any;
  slotIndex: number;
  myPlayer: LobbyPlayer;
  onSelectCharacter: (npcId: string) => void;
}> = React.memo(({ lobby, slotIndex, myPlayer, onSelectCharacter }) => (
  <div className="lg:col-span-8 space-y-6">
    <div className="flex justify-between items-end">
      <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] block">Select Your Intelligence</label>
      <span className="text-[8px] font-mono text-zinc-600 uppercase">Synchronized via Neural Link</span>
    </div>

    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide">
      {npcData.map(n => {
        const selectedBy = lobby.players.find((p: LobbyPlayer) => p.npcId === n.id);
        const isTaken = !!selectedBy && selectedBy.slotIndex !== slotIndex;
        const isMe = selectedBy?.slotIndex === slotIndex;

        return (
          <div 
            key={n.id}
            onClick={() => !isTaken && !myPlayer.isReady && onSelectCharacter(n.id)}
            className={`group relative p-2 border-2 rounded-[2rem] transition-all cursor-pointer overflow-hidden ${isMe ? 'border-indigo-500 bg-indigo-500/20 scale-105' : isTaken ? 'border-red-900/30 opacity-40 grayscale cursor-not-allowed' : 'border-zinc-800 hover:border-zinc-600 bg-black/40'}`}
          >
            <div className="relative aspect-square rounded-[1.5rem] overflow-hidden mb-2">
              <Avatar spriteIndex={n.spriteIndex} type="victory" className="w-full h-full scale-110" noBorder />
              {isTaken && (
                <div className="absolute inset-0 bg-red-950/60 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-[10px] bangers text-white uppercase tracking-widest text-center px-2">Assigned to {selectedBy.name}</span>
                </div>
              )}
            </div>
            <div className="text-center pb-1">
              <span className="text-[11px] bangers uppercase text-white truncate block">{n.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
));

const LobbyControls: React.FC<{
  myPlayer: LobbyPlayer;
  isHost: boolean;
  allReady: boolean;
  onToggleReady: () => void;
  onStartGame: () => void;
  isStartingGame: boolean;
}> = React.memo(({ myPlayer, isHost, allReady, onToggleReady, onStartGame, isStartingGame }) => (
  <div className="pt-8 space-y-4">
    <button 
      onClick={onToggleReady}
      disabled={!myPlayer.npcId}
      className={`w-full py-6 rounded-2xl bangers text-3xl italic uppercase tracking-tighter transition-all border-b-8 ${myPlayer.isReady ? 'bg-emerald-600 border-emerald-900 text-white' : 'bg-indigo-600 border-indigo-900 text-white hover:bg-indigo-500'} active:border-0 active:translate-y-2 disabled:opacity-30 disabled:grayscale`}
    >
      {myPlayer.isReady ? 'Ready for Deployment' : 'Lock In Command'}
    </button>

    {isHost && (
      <button 
        onClick={onStartGame}
        disabled={!allReady || isStartingGame}
        className="w-full py-6 bg-white text-black rounded-2xl bangers text-3xl italic uppercase tracking-tighter transition-all border-b-8 border-zinc-400 hover:bg-zinc-100 active:border-0 active:translate-y-2 disabled:opacity-10 disabled:grayscale shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
      >
        {isStartingGame ? 'Initializing...' : 'Initiate Global Conflict'}
      </button>
    )}
  </div>
));

export const LobbyScreen: React.FC = () => {
  const lobby = useGameStore(s => s.lobby);
  const slotIndex = useGameStore(s => s.slotIndex);
  const selectCharacter = useGameStore(s => s.selectLobbyCharacter);
  const toggleReady = useGameStore(s => s.toggleReady);
  const toggleAi = useGameStore(s => s.toggleAiSlot);
  const startGame = useGameStore(s => s.startMultiplayerGame);
  
  const [isAddingAi, setIsAddingAi] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  
  if (!lobby || slotIndex === null) return null;

  const myPlayer = lobby.players.find(p => p.slotIndex === slotIndex)!;
  const isHost = myPlayer.isHost;
  const activePlayers = lobby.players.filter(p => p.npcId !== null && (p.socketId !== null || p.type === 'ai'));
  const allHumansReady = lobby.players.filter(p => p.type === 'human' && p.npcId !== null).every(p => p.isReady);
  const allReady = activePlayers.length >= 2 && allHumansReady;
  
  const takenNpcIds = lobby.players.map(p => p.npcId).filter(id => !!id);
  const canAddAi = takenNpcIds.length < npcData.length;

  const handleToggleAi = async (idx: number) => {
    if (!canAddAi) {
      soundEngine.play('ERROR');
      return;
    }
    setIsAddingAi(true);
    try {
      await toggleAi(idx);
    } catch (error) {
      console.error('Failed to toggle AI:', error);
      soundEngine.play('ERROR');
    } finally {
      setIsAddingAi(false);
    }
  };

  const handleStartGame = async () => {
    setIsStartingGame(true);
    try {
      await startGame();
    } catch (error) {
      console.error('Failed to start game:', error);
      soundEngine.play('ERROR');
      setIsStartingGame(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-[#050508] text-white flex flex-col items-center justify-center p-8 overflow-hidden animate-in fade-in duration-700">
      <GlobeIntro />
      
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Player Slots */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.6em]">Command Registry</span>
            <h2 className="text-5xl bangers text-white uppercase italic tracking-tighter">Tactical Lobby</h2>
          </div>

          <div className="space-y-3">
            {[0, 1, 2, 3, 4, 5].map(idx => {
              const p = lobby.players.find(lp => lp.slotIndex === idx);
              const npc = p?.npcId ? npcData.find(n => n.id === p.npcId) : null;
              const isVacant = !p || (p.socketId === null && p.type === 'human');
              const isAi = p?.type === 'ai';
              
              return (
                <PlayerSlot
                  key={idx}
                  idx={idx}
                  player={p}
                  npc={npc}
                  isVacant={isVacant}
                  isAi={isAi}
                  isHost={isHost}
                  slotIndex={slotIndex}
                  onToggleAi={handleToggleAi}
                  canAddAi={canAddAi}
                />
              );
            })}
          </div>

          <LobbyControls
            myPlayer={myPlayer}
            isHost={isHost}
            allReady={allReady}
            onToggleReady={toggleReady}
            onStartGame={handleStartGame}
            isStartingGame={isStartingGame}
          />
        </div>

        <CharacterSelector
          lobby={lobby}
          slotIndex={slotIndex}
          myPlayer={myPlayer}
          onSelectCharacter={selectCharacter}
        />
      </div>
    </div>
  );
};
