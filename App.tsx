
import React, { useState, useEffect, useMemo, useRef } from 'react';
import WorldMap from './components/WorldMap';
import TacticalCard from './components/TacticalCard';
import MissionCard from './components/MissionCard';
import GlobeIntro from './components/GlobeIntro';
import TacticalDice from './components/TacticalDice';
import { PLAYER_COLORS } from './constants';
import { useGameStore } from './store/useGameStore';
import { soundEngine } from './services/soundEngine';
import { Mission, PlayerConfig, TerritoryState, AiDifficulty, SetupRule, TheatreId } from './types';
import { npcData, NPC } from './npc_characters';
import { TacticalIcon } from './components/TacticalIcons';
import { THEATRES } from './campaign_logic';
import { Tooltip } from './src/components/Tooltip';
import { Menu, Settings, X, ChevronLeft, ChevronRight, LayoutDashboard, Database, ShieldAlert, Zap, MessageSquare, Send, Globe, Users, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LobbyScreen: React.FC = () => {
  const lobby = useGameStore(s => s.lobby);
  const slotIndex = useGameStore(s => s.slotIndex);
  const selectCharacter = useGameStore(s => s.selectLobbyCharacter);
  const toggleReady = useGameStore(s => s.toggleReady);
  const toggleAi = useGameStore(s => s.toggleAiSlot);
  const startGame = useGameStore(s => s.startMultiplayerGame);
  
  if (!lobby || slotIndex === null) return null;

  const myPlayer = lobby.players.find(p => p.slotIndex === slotIndex)!;
  const isHost = myPlayer.isHost;
  const allReady = lobby.players.filter(p => p.npcId !== null).length >= 2 && lobby.players.filter(p => p.npcId !== null).every(p => p.isReady);

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
                <div key={idx} className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${slotIndex === idx ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.2)]' : 'bg-black/40 border-white/5'}`}>
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-900 border border-white/10">
                    {npc ? <Avatar spriteIndex={npc.spriteIndex} type="head" className="w-full h-full" noBorder /> : <div className="w-full h-full flex items-center justify-center opacity-20"><Users className="w-6 h-6" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-sm bangers tracking-widest uppercase truncate">{p ? p.name : `VACANT SLOT ${idx + 1}`}</span>
                      {p?.isHost && <span className="text-[8px] font-black text-amber-500 border border-amber-500/30 px-1.5 py-0.5 rounded uppercase">Host</span>}
                      {isAi && <span className="text-[8px] font-black text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded uppercase">AI</span>}
                    </div>
                    <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest truncate">
                      {npc ? npc.name : isVacant ? 'Waiting for connection...' : 'Configuring...'}
                    </div>
                  </div>
                  
                  {isHost && isVacant && idx !== slotIndex && (
                    <button onClick={() => toggleAi(idx)} className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all">Add AI</button>
                  )}
                  {isHost && isAi && (
                    <button onClick={() => toggleAi(idx)} className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-[8px] font-black text-red-500 uppercase tracking-widest transition-all">Remove</button>
                  )}
                  
                  {p && !isVacant && (
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${p.isReady ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]' : 'bg-zinc-800'}`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-8 space-y-4">
            <button 
              onClick={toggleReady}
              disabled={!myPlayer.npcId}
              className={`w-full py-6 rounded-2xl bangers text-3xl italic uppercase tracking-tighter transition-all border-b-8 ${myPlayer.isReady ? 'bg-emerald-600 border-emerald-900 text-white' : 'bg-indigo-600 border-indigo-900 text-white hover:bg-indigo-500'} active:border-0 active:translate-y-2 disabled:opacity-30 disabled:grayscale`}
            >
              {myPlayer.isReady ? 'Ready for Deployment' : 'Lock In Command'}
            </button>

            {isHost && (
              <button 
                onClick={startGame}
                disabled={!allReady}
                className="w-full py-6 bg-white text-black rounded-2xl bangers text-3xl italic uppercase tracking-tighter transition-all border-b-8 border-zinc-400 hover:bg-zinc-100 active:border-0 active:translate-y-2 disabled:opacity-10 disabled:grayscale shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
              >
                Initiate Global Conflict
              </button>
            )}
          </div>
        </div>

        {/* Right: Character Selection */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] block">Select Your Intelligence</label>
            <span className="text-[8px] font-mono text-zinc-600 uppercase">Synchronized via Neural Link</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide">
            {npcData.map(n => {
              const selectedBy = lobby.players.find(p => p.npcId === n.id);
              const isTaken = !!selectedBy && selectedBy.slotIndex !== slotIndex;
              const isMe = selectedBy?.slotIndex === slotIndex;

              return (
                <div 
                  key={n.id}
                  onClick={() => !isTaken && !myPlayer.isReady && selectCharacter(n.id)}
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
      </div>
    </div>
  );
};

const RoomBrowser: React.FC<{ onClose: () => void, onJoin: (id: string) => void }> = ({ onClose, onJoin }) => {
  const availableRooms = useGameStore(s => s.availableRooms);
  const isFetchingRooms = useGameStore(s => s.isFetchingRooms);
  const fetchRooms = useGameStore(s => s.fetchRooms);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-2xl bg-zinc-900 border border-indigo-500/30 p-10 rounded-[3rem] shadow-[0_0_100px_rgba(79,70,229,0.2)] flex flex-col gap-8 relative overflow-hidden">
         <button onClick={onClose} className="absolute top-8 right-8 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">X</button>
         
         <div className="flex flex-col gap-2">
           <div className="flex items-center gap-3">
             <Globe className="w-5 h-5 text-indigo-500 animate-pulse" />
             <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.6em]">Satellite Uplink</span>
           </div>
           <h2 className="text-5xl bangers text-white uppercase italic tracking-tighter">Active Conflict Zones</h2>
         </div>

         <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-3 scrollbar-hide">
            {availableRooms.length === 0 && !isFetchingRooms && (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-8 h-8 text-zinc-800" />
                </div>
                <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest leading-relaxed">No active signals detected.<br/>Initiate a new command or wait for deployments.</p>
              </div>
            )}
            
            {availableRooms.map(room => (
              <div key={room.id} className="group p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 hover:border-indigo-500/30 transition-all">
                 <div className="flex flex-col gap-1">
                    <span className="text-xl bangers text-white tracking-widest">{room.id}</span>
                    <div className="flex items-center gap-3">
                       <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-zinc-500" />
                          <span className="text-[10px] font-mono text-zinc-500">{room.playerCount} COMMANDERS</span>
                       </div>
                       <div className="w-1 h-1 rounded-full bg-zinc-800" />
                       <span className={`text-[10px] font-black uppercase italic ${room.isStarted ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {room.isStarted ? 'In Progress' : 'Awaiting Deployment'}
                       </span>
                    </div>
                 </div>
                 <button 
                   onClick={() => onJoin(room.id)}
                   className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white bangers text-lg rounded-xl transition-all shadow-lg group-hover:scale-105 active:scale-95"
                 >
                   Establish Link
                 </button>
              </div>
            ))}
         </div>

         <div className="flex justify-between items-center pt-6 border-t border-white/5">
            <button 
              onClick={() => fetchRooms()} 
              disabled={isFetchingRooms}
              className="flex items-center gap-2 text-[10px] font-black text-zinc-500 hover:text-indigo-400 transition-colors uppercase tracking-widest disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isFetchingRooms ? 'animate-spin' : ''}`} />
              Re-Scan Frequencies
            </button>
            <span className="text-[8px] font-mono text-zinc-700 uppercase">Neural Net v4.2.0</span>
         </div>
      </div>
    </div>
  );
};

const MultiplayerChat: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const messages = useGameStore(s => s.messages);
  const sendMessage = useGameStore(s => s.sendChatMessage);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  return (
    <motion.div 
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed top-24 right-6 bottom-32 w-80 bg-zinc-950/90 backdrop-blur-2xl border border-indigo-500/30 rounded-[2rem] flex flex-col z-[100] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
    >
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-indigo-500/10">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Comm Link</span>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-500 transition-colors">X</button>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-center px-8">
            <span className="text-[8px] font-mono text-zinc-600 uppercase leading-relaxed tracking-widest">Secure line established. Waiting for transmissions...</span>
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black uppercase tracking-tighter" style={{ color: m.senderColor }}>{m.senderName}</span>
              <span className="text-[6px] font-mono text-zinc-600">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className="text-xs text-zinc-300 font-medium leading-relaxed bg-white/5 p-2 rounded-lg rounded-tl-none border-l-2" style={{ borderLeftColor: m.senderColor }}>{m.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
        <input 
          type="text" 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="ENTER MESSAGE..." 
          className="flex-1 bg-zinc-900 border border-indigo-500/20 rounded-xl px-4 py-2 text-[10px] font-mono text-indigo-400 outline-none focus:border-indigo-500 transition-all"
        />
        <button type="submit" className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white hover:bg-indigo-500 transition-all shadow-lg active:scale-95">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
};

const HEADSHOT_URL = 'https://raw.githubusercontent.com/japiohopman/risk/main/enemy_npcs/sprite_sheet.png';
const PROFILE_URL = 'https://raw.githubusercontent.com/japiohopman/risk/main/enemy_npcs/side_profiles.png';
const DEFEATED_URL = 'https://raw.githubusercontent.com/japiohopman/risk/main/enemy_npcs/defeated.png';
const VICTORY_URL = 'https://raw.githubusercontent.com/japiohopman/risk/main/enemy_npcs/victory.png';
const CARD_BACK_URL = 'https://raw.githubusercontent.com/japiohopman/risk/main/the_back_of_a_board_game_card_.webp';

console.log('INITIATING GLOBAL CONQUEST: NEURAL LINK BACKEND IS:', import.meta.env.VITE_BACKEND_URL || 'LOCAL ORIGIN');

const loadedSheets = new Set<string>();

const ChromaKeyFilter = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <filter id="chroma-key-green">
      <feColorMatrix
        type="matrix"
        values="1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                1 -2.5 1 1 0"
      />
    </filter>
  </svg>
);

export const Avatar: React.FC<{ 
  player?: Partial<PlayerConfig>, 
  spriteIndex?: number, 
  color?: string, 
  className?: string, 
  type?: 'head' | 'profile' | 'defeated' | 'victory', 
  mirrored?: boolean, 
  noBorder?: boolean 
}> = ({ player, spriteIndex, color, className = "w-8 h-8", type = 'head', mirrored = false, noBorder = false }) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const effectiveSpriteIndex = spriteIndex !== undefined ? spriteIndex : player?.spriteIndex;
  const effectiveColor = color || player?.color || '#52525b';
  
  let url = HEADSHOT_URL;
  if (type === 'profile') url = PROFILE_URL;
  else if (type === 'defeated') url = DEFEATED_URL;
  else if (type === 'victory') url = VICTORY_URL;

  useEffect(() => {
    if (!containerRef.current) return;
    if (loadedSheets.has(url)) {
      setIsIntersecting(true);
      setIsLoaded(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.disconnect();
      }
    }, { rootMargin: '100px' });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [url]);

  useEffect(() => {
    if (!isIntersecting || isLoaded) return;
    const img = new Image();
    img.src = url;
    img.onload = () => {
      loadedSheets.add(url);
      setIsLoaded(true);
    };
  }, [isIntersecting, url, isLoaded]);

  if (effectiveSpriteIndex === undefined) {
    return (
      <div ref={containerRef} className={`${className} rounded-full border border-zinc-700 flex items-center justify-center bg-zinc-900 overflow-hidden relative shadow-inner`} style={{ borderColor: effectiveColor }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" className="w-1/2 h-1/2 opacity-60"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
    );
  }

  const col = effectiveSpriteIndex % 3;
  const row = Math.floor(effectiveSpriteIndex / 3);
  const xPercent = (col / 2) * 100;
  const yPercent = (row / 2) * 100;

  return (
    <div 
      ref={containerRef}
      className={`
        ${className} 
        ${type === 'head' ? 'rounded-full' : 'rounded-none'} 
        ${(type === 'victory' || noBorder) ? 'border-0 bg-transparent' : 'border-2 border-zinc-700 bg-zinc-950 shadow-lg'} 
        overflow-hidden relative transition-all duration-700
      `} 
      style={type === 'victory' || noBorder ? {} : { borderColor: effectiveColor }}
    >
       {!isLoaded && (
         <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center gap-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent animate-pulse" />
            <div className="text-[6px] font-black text-indigo-500/40 uppercase tracking-widest animate-pulse">Syncing...</div>
         </div>
       )}
       {isIntersecting && (
         <div 
          key={effectiveSpriteIndex} 
          className={`absolute inset-0 bg-no-repeat transition-opacity duration-1000 ${mirrored ? 'scale-x-[-1]' : ''} ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
          style={{ 
            backgroundImage: isLoaded ? `url(${url})` : 'none', 
            backgroundSize: '300% 300%', 
            backgroundPosition: `${xPercent}% ${yPercent}%`,
            filter: type === 'victory' ? 'url(#chroma-key-green)' : 'none'
          }} 
         />
       )}
       {type !== 'victory' && !noBorder && <div className="absolute inset-0 border-4 border-black/20 pointer-events-none" />}
    </div>
  );
};

const CampaignBriefing: React.FC<{ theatre: any, onInitiate: (count: number) => void, onCancel: () => void }> = ({ theatre, onInitiate, onCancel }) => {
  const [commanderCount, setCommanderCount] = useState(2);
  const maxCommanders = theatre.rivalNpcIds.length + 1;

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-4xl bg-zinc-900 border border-indigo-500/30 p-12 rounded-[3rem] shadow-[0_0_100px_rgba(79,70,229,0.2)] flex flex-col gap-8 relative overflow-hidden">
         <button onClick={onCancel} className="absolute top-8 right-8 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10">X</button>
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-pulse" />
         <div className="flex flex-col gap-2">
           <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.6em]">Neural Link Assessment</span>
           <h2 className="text-6xl bangers text-white uppercase italic tracking-tighter">{theatre.name}</h2>
         </div>
         <p className="text-zinc-400 text-lg leading-relaxed font-medium max-w-2xl">{theatre.description}</p>
         
         <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
            <div className="space-y-4">
               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Commanders in Theatre</span>
               <div className="flex gap-4">
                  {[2, 3, 4, 5, 6].filter(c => c <= maxCommanders).map(c => (
                    <button 
                      key={c} 
                      onClick={() => setCommanderCount(c)}
                      className={`w-12 h-12 rounded-xl bangers text-2xl flex items-center justify-center transition-all ${commanderCount === c ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
                    >
                      {c}
                    </button>
                  ))}
               </div>
            </div>
            <div className="space-y-4">
               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Identified Rivals</span>
               <div className="flex gap-2">
                  {theatre.rivalNpcIds.slice(0, commanderCount - 1).map((id: string) => {
                    const npc = npcData.find(n => n.id === id)!;
                    return <div key={id} title={npc.name}><Avatar spriteIndex={npc.spriteIndex} type="head" className="w-12 h-12 border-white/10" /></div>
                  })}
               </div>
            </div>
         </div>
  
         <button onClick={() => onInitiate(commanderCount)} className="mt-4 py-6 bg-indigo-600 hover:bg-indigo-500 text-white bangers text-3xl rounded-3xl transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] border-b-8 border-indigo-900 active:border-0 active:translate-y-2 uppercase tracking-tighter">Synchronize Command Core</button>
      </div>
    </div>
  );
};

const FlipMissionCard: React.FC<{ mission: Mission, onSelect: () => void }> = ({ mission, onSelect }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = () => {
    if (!isFlipped && !isProcessing) {
      setIsFlipped(true);
      setIsProcessing(true);
      soundEngine.play('INTEL');
      setTimeout(() => { onSelect(); }, 1100);
    }
  };

  return (
    <div onClick={handleClick} className={`relative w-56 h-80 cursor-pointer transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : 'hover:scale-105 hover:rotate-1'}`}>
      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.2)] border-4 border-white">
         <MissionCard mission={mission} />
      </div>
      <div className="absolute inset-0 [backface-visibility:hidden] bg-zinc-900 border-4 border-zinc-700 rounded-2xl flex flex-col items-center justify-center p-4 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden" style={{ backgroundImage: `url(${CARD_BACK_URL})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
         <div className="absolute inset-0 bg-black/50 pointer-events-none" />
         <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center bg-black/40 backdrop-blur-md">
               <TacticalIcon type="annexation" className="w-8 h-8 text-white/40 animate-pulse" />
            </div>
            <span className="text-[10px] bangers text-white uppercase tracking-[0.4em] block">Classified</span>
         </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const isGameStarted = useGameStore(s => s.isGameStarted);
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
  const players = useGameStore(s => s.players);
  const phase = useGameStore(s => s.phase);
  const isAiProcessing = useGameStore(s => s.isAiProcessing);
  const winner = useGameStore(s => s.winner);
  const missionOptions = useGameStore(s => s.missionOptions);
  const playerHands = useGameStore(s => s.playerHands);
  const territories = useGameStore(s => s.territories);
  const reinforcementsAvailable = useGameStore(s => s.reinforcementsAvailable);
  const selectedId = useGameStore(s => s.selectedId);
  const targetId = useGameStore(s => s.targetId);
  const lastBattleResult = useGameStore(s => s.lastBattleResult);
  const pendingInvasion = useGameStore(s => s.pendingInvasion);
  const selectedCards = useGameStore(s => s.selectedCards);
  const strategicAdvice = useGameStore(s => s.strategicAdvice);
  const isAwaitingHumanDefense = useGameStore(s => s.isAwaitingHumanDefense);
  const campaign = useGameStore(s => s.campaign);
  const isMultiplayer = useGameStore(s => s.isMultiplayer);
  const connectMultiplayer = useGameStore(s => s.connectMultiplayer);
  const disconnectMultiplayer = useGameStore(s => s.disconnectMultiplayer);

  const initGame = useGameStore(s => s.initGame);
  const initCampaignGame = useGameStore(s => s.initCampaignGame);
  const selectMission = useGameStore(s => s.selectMission);
  const resetGame = useGameStore(s => s.resetGame);
  const nextPhase = useGameStore(s => s.nextPhase);
  const handleTerritoryClick = useGameStore(s => s.handleTerritoryClick);
  const executeAttack = useGameStore(s => s.executeAttack);
  const closeBattle = useGameStore(s => s.closeBattle);
  const finalizeInvasion = useGameStore(s => s.finalizeInvasion);
  const tradeInCards = useGameStore(s => s.tradeInCards);
  const toggleCardSelection = useGameStore(s => s.toggleCardSelection);
  const processAiTurn = useGameStore(s => s.processAiTurn);
  const clearBattleResult = useGameStore(s => s.clearBattleResult);
  const executePerk = useGameStore(s => s.executePerk);

  const [mode, setMode] = useState<'HOME' | 'SKIRMISH_SETUP' | 'CAMPAIGN_HUB' | 'ACTIVE_GAME'>('HOME');
  const [selectedTheatreId, setSelectedTheatreId] = useState<TheatreId | null>(null);
  const [totalPlayers, setTotalPlayers] = useState(2);
  const [humanCount, setHumanCount] = useState(1);
  const [humans, setHumans] = useState([{ name: 'OPERATOR 1', color: npcData[0].color, npcId: npcData[0].id }]);
  const [selectedNpcs, setSelectedNpcs] = useState<string[]>([]);
  const [isCardOverlayOpen, setIsCardOverlayOpen] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(0.3);
  const [multiplayerRoomId, setMultiplayerRoomId] = useState('ALPHA-1');
  const [difficulty, setDifficulty] = useState<AiDifficulty>('normal');
  const [setupRule, setSetupRule] = useState<SetupRule>('random');
  const [rivalSearch, setRivalSearch] = useState('');
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [showTurnNotification, setShowTurnNotification] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [invasionCount, setInvasionCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);

  const neededNpcs = totalPlayers - humanCount;
  const humanNpcIds = humans.map(h => h.npcId).filter(id => !!id) as string[];
  const availableNpcs = npcData.filter(npc => !humanNpcIds.includes(npc.id));
  const filteredRivals = availableNpcs.filter(n => n.name.toLowerCase().includes(rivalSearch.toLowerCase()));

  useEffect(() => { if (isGameStarted) setMode('ACTIVE_GAME'); }, [isGameStarted]);
  useEffect(() => { if (isGameStarted && players[currentPlayerIndex]?.type === 'ai' && !isAiProcessing && !winner && !missionOptions) { processAiTurn(); } }, [currentPlayerIndex, isGameStarted, isAiProcessing, winner, missionOptions]);

  useEffect(() => {
    if (isGameStarted && players[currentPlayerIndex]?.type === 'human' && !winner && mode === 'ACTIVE_GAME') {
      setShowTurnNotification(true);
      const timer = setTimeout(() => setShowTurnNotification(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayerIndex, isGameStarted, winner, mode]);

  useEffect(() => {
    if (pendingInvasion) {
      setInvasionCount(pendingInvasion.min);
    }
  }, [pendingInvasion]);

  const initiateNeuralLink = async () => {
    soundEngine.play('UI_CLICK');
    await soundEngine.startBgm('SELECT');
    setMode('SKIRMISH_SETUP');
  };

  // Fixed isCombatActive logic to check both territories exist and have owners
  const isCombatActive = useMemo(() => {
    if (!selectedId || !targetId) return false;
    const atk = territories[selectedId];
    const dfn = territories[targetId];
    return !!(atk && dfn && atk.owner !== 'neutral' && dfn.owner !== 'neutral');
  }, [selectedId, targetId, territories]);

  if (mode === 'HOME') return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#050508] text-white font-sans overflow-hidden select-none relative">
      <ChromaKeyFilter /><GlobeIntro />
      <div className="z-10 flex flex-col items-center gap-6 sm:gap-12 max-w-4xl px-8 text-center animate-in fade-in zoom-in duration-1000">
         <div className="space-y-4 text-center">
            <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black italic tracking-tighter text-white uppercase leading-none drop-shadow-[0_20px_50px_rgba(79,70,229,0.3)]">GLOBAL<br/>CONQUEST</h1>
            <div className="flex items-center justify-center gap-4"><div className="h-px w-12 bg-indigo-500/50" /><span className="text-[10px] sm:text-[14px] font-black text-indigo-400 uppercase tracking-[0.6em]">Neural Directive</span><div className="h-px w-12 bg-indigo-500/50" /></div>
         </div>
         <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center">
            {!isMultiplayer && (
              <div className="flex flex-col gap-2 items-start">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Room ID</span>
                <input 
                  type="text" 
                  value={multiplayerRoomId} 
                  onChange={(e) => setMultiplayerRoomId(e.target.value.toUpperCase())}
                  className="bg-zinc-900 border border-indigo-500/30 text-white px-4 py-3 rounded-lg font-mono text-sm focus:outline-none focus:border-indigo-500 transition-all w-40"
                />
              </div>
            )}
            <button onClick={() => setMode('CAMPAIGN_HUB')} className="group relative px-12 py-5 bg-indigo-600 text-white font-black uppercase tracking-[0.4em] text-sm overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_30px_60px_rgba(79,70,229,0.2)]">
               <span className="relative z-10 italic">Eternal War Campaign</span>
            </button>
            <button onClick={initiateNeuralLink} className="group relative px-12 py-5 bg-white text-black font-black uppercase tracking-[0.4em] text-sm overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_30px_60px_rgba(255,255,255,0.1)]">
              <span className="relative z-10 italic">Standard Skirmish</span>
            </button>
            <button 
              onClick={async () => {
                if (isMultiplayer) {
                  disconnectMultiplayer();
                } else {
                  await soundEngine.startBgm('SELECT');
                  connectMultiplayer(import.meta.env.VITE_BACKEND_URL || window.location.origin, multiplayerRoomId);
                  setMode('SKIRMISH_SETUP');
                }
              }} 
              className={`group relative px-12 py-5 ${isMultiplayer ? 'bg-red-600' : 'bg-emerald-600'} text-white font-black uppercase tracking-[0.4em] text-sm overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_30px_60px_rgba(16,185,129,0.2)]`}
            >
              <span className="relative z-10 italic">{isMultiplayer ? 'Disconnect Link' : 'Establish Multi-Link'}</span>
            </button>
            {!isMultiplayer && (
              <button onClick={() => setIsBrowserOpen(true)} className="w-14 h-14 bg-zinc-900 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 hover:bg-indigo-900/40 transition-all shadow-lg active:scale-95" title="Browse Active Rooms">
                <Globe className="w-6 h-6" />
              </button>
            )}
         </div>
      </div>
      {isBrowserOpen && <RoomBrowser onClose={() => setIsBrowserOpen(false)} onJoin={async (id) => { 
        setMultiplayerRoomId(id); 
        await soundEngine.startBgm('SELECT');
        connectMultiplayer(import.meta.env.VITE_BACKEND_URL || window.location.origin, id); 
        setMode('SKIRMISH_SETUP');
        setIsBrowserOpen(false); 
      }} />}
    </div>
  );

  if (mode === 'CAMPAIGN_HUB') return (
    <div className="flex h-screen items-center justify-center bg-[#09090b] text-[#d4d4d8] p-10 font-sans overflow-hidden select-none relative">
      <ChromaKeyFilter /><GlobeIntro />
      <div className="w-full max-w-7xl bg-zinc-950/60 border-2 border-indigo-900/30 rounded-[4rem] p-16 shadow-[0_0_120px_rgba(79,70,229,0.1)] relative backdrop-blur-xl z-10">
        <div className="flex justify-between items-end mb-12">
           <div className="flex flex-col gap-2">
             <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.6em]">Global Command Center</span>
             <h1 className="text-8xl bangers text-white uppercase italic tracking-tighter">The War Room</h1>
           </div>
           <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col items-center gap-2 min-w-[200px]">
              <span className="text-[8px] font-black text-zinc-500 uppercase">Command Points</span>
              <div className="text-4xl bangers text-indigo-400">{campaign.commandPoints}</div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {THEATRES.map(theatre => {
             const isUnlocked = campaign.unlockedTheatres.includes(theatre.id);
             return (
               <div key={theatre.id} onClick={() => isUnlocked && setSelectedTheatreId(theatre.id)} className={`group p-8 rounded-[3rem] border-2 transition-all cursor-pointer relative overflow-hidden ${isUnlocked ? 'bg-zinc-900/40 border-zinc-800 hover:border-indigo-500' : 'bg-black/40 border-zinc-900 grayscale opacity-40'}`}>
                  <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                     <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{theatre.id}</span>
                        <h3 className="text-3xl bangers text-white uppercase leading-none">{theatre.name}</h3>
                     </div>
                     {!isUnlocked && <div className="text-[10px] font-bold text-red-500 uppercase italic">Access Denied: Unlocked via Campaign Progression</div>}
                     <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-400 transition-all">
                        <TacticalIcon type="annexation" className="w-6 h-6 text-white" />
                     </div>
                  </div>
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                     <h4 className="text-9xl bangers text-white">{theatre.id.charAt(0)}</h4>
                  </div>
               </div>
             );
           })}
        </div>

        <div className="mt-12 flex justify-between items-center border-t border-white/5 pt-8">
            <button onClick={() => setMode('HOME')} className="px-8 py-4 bg-zinc-900 border border-white/10 rounded-2xl text-zinc-400 uppercase font-black tracking-widest hover:text-white hover:border-white/30 transition-all flex items-center gap-3 group">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 group-hover:-translate-x-1 transition-transform"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              <span>Return to Base</span>
            </button>
            <div className="flex gap-4">
                <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-zinc-600 uppercase">Neural Assets</span>
                    <div className="flex gap-1 mt-1">
                        {campaign.medals.filter(m => m.isEarned).map(m => (
                            <div key={m.id} className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.5)]" title={m.name}>
                                <TacticalIcon type="annexation" className="w-3 h-3 text-white" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
      {selectedTheatreId && <CampaignBriefing theatre={THEATRES.find(t => t.id === selectedTheatreId)} onInitiate={(count) => { initCampaignGame(selectedTheatreId, count); setSelectedTheatreId(null); }} onCancel={() => setSelectedTheatreId(null)} />}
    </div>
  );

  if (mode === 'SKIRMISH_SETUP') return (
    <div className="flex h-screen items-center justify-center bg-[#050508] text-[#d4d4d8] p-10 font-sans overflow-hidden select-none relative animate-in fade-in duration-700">
      <ChromaKeyFilter /><GlobeIntro />
      {isMultiplayer && <LobbyScreen />}
      
      {/* Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* Back Button */}
      <button 
        onClick={() => {
          soundEngine.startBgm('MAIN');
          setMode('HOME');
        }} 
        className="absolute top-10 left-10 z-[110] flex items-center gap-3 text-zinc-500 hover:text-white transition-all group"
      >
        <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-white transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] bg-black/40">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] leading-none">Back to Menu</span>
          <span className="text-[6px] font-mono text-zinc-600 uppercase tracking-widest mt-1">Disconnect Neural Link</span>
        </div>
      </button>

      <div className="w-full max-w-7xl bg-zinc-950/90 border-2 border-indigo-900/30 rounded-[2rem] sm:rounded-[4rem] p-6 sm:p-16 shadow-[0_0_120px_rgba(79,70,229,0.2)] relative backdrop-blur-3xl overflow-y-auto max-h-[90vh] scrollbar-hide z-10 border-t-indigo-500/20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-16">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-12">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] block">1. Establish Identity</label>
              
              {/* Character Selection Carousel for Human Player */}
              {(() => {
                const currentNpc = npcData.find(n => n.id === humans[0].npcId);
                const npcColor = currentNpc?.color || '#6366f1';
                
                return (
                  <div 
                    className="bg-black/60 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border shadow-2xl relative overflow-hidden group transition-all duration-700"
                    style={{ 
                      boxShadow: `0 0 0 1px ${npcColor}20, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`,
                      borderColor: `${npcColor}20` 
                    }}
                  >
                    {/* Tactical Frame */}
                    <div 
                      className="absolute inset-4 border-2 border-dashed pointer-events-none opacity-20 rounded-[1.5rem] sm:rounded-[2rem] transition-all duration-700"
                      style={{ borderColor: npcColor }}
                    />

                    <div 
                      className="absolute inset-0 pointer-events-none transition-all duration-700" 
                      style={{ background: `linear-gradient(to bottom, ${npcColor}10, transparent)` }}
                    />
                    
                    <div className="flex justify-between items-center mb-4 sm:mb-8">
                      <div className="flex flex-col">
                        <span 
                          className="text-[10px] font-black uppercase tracking-[0.4em] italic transition-colors duration-700"
                          style={{ color: npcColor }}
                        >
                          Neural Link Active
                        </span>
                        <span className="text-[8px] font-mono text-zinc-500 uppercase mt-1">Commander Synchronization: 99%</span>
                      </div>
                      <div className="flex gap-1.5">
                        {npcData.map((npc, idx) => (
                          <div 
                            key={npc.id} 
                            className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                            style={{ 
                              backgroundColor: humans[0].npcId === npc.id ? npcColor : '#27272a',
                              width: humans[0].npcId === npc.id ? '1.5rem' : '0.375rem',
                              boxShadow: humans[0].npcId === npc.id ? `0 0 10px ${npcColor}80` : 'none'
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="relative flex items-center justify-center py-6">
                      {/* Left Arrow */}
                      <button 
                        onClick={() => {
                          soundEngine.play('UI_CLICK');
                          const currentIndex = npcData.findIndex(n => n.id === humans[0].npcId);
                          const nextIndex = (currentIndex - 1 + npcData.length) % npcData.length;
                          const n = [...humans];
                          const nextNpcId = npcData[nextIndex].id;
                          const nextNpc = npcData[nextIndex];
                          n[0].npcId = nextNpcId;
                          n[0].color = nextNpc.color;
                          setHumans(n);
                          
                          // Play select and iconic sounds
                          const voiceKey = nextNpc.voiceKeyOverride || nextNpc.name.toLowerCase().replace(/\s/g, '_');
                          const randomIndex = Math.floor(Math.random() * 3) + 1;
                          soundEngine.speak(voiceKey, [
                            { category: 'select', file: `select_${randomIndex}` },
                            { category: 'iconic', file: `iconic_${randomIndex}` }
                          ]);
                        }}
                        className="absolute left-0 z-20 w-14 h-14 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:border-white/40 transition-all group/btn shadow-xl active:scale-90"
                        style={{ '--hover-bg': npcColor } as any}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-7 h-7 group-hover/btn:-translate-x-0.5 transition-transform"><path d="M15 18l-6-6 6-6"/></svg>
                      </button>

                      {/* Avatar Display */}
                      <div className="relative w-48 h-48 sm:w-72 sm:h-72 flex items-center justify-center">
                        <div 
                          className="absolute inset-0 rounded-full blur-[40px] sm:blur-[60px] animate-pulse transition-all duration-700" 
                          style={{ backgroundColor: `${npcColor}30` }}
                        />
                        <div 
                          className="relative z-10 w-full h-full rounded-full border-4 overflow-hidden group-hover:scale-105 transition-all duration-700 ring-4 sm:ring-8 ring-black/40"
                          style={{ 
                            borderColor: `${npcColor}60`,
                            boxShadow: `0 0 50px ${npcColor}40`
                          }}
                        >
                          <Avatar 
                            spriteIndex={currentNpc?.spriteIndex} 
                            type="victory" 
                            className="w-full h-full scale-110" 
                            noBorder 
                          />
                        </div>
                      </div>

                      {/* Right Arrow */}
                      <button 
                        onClick={() => {
                          soundEngine.play('UI_CLICK');
                          const currentIndex = npcData.findIndex(n => n.id === humans[0].npcId);
                          const nextIndex = (currentIndex + 1) % npcData.length;
                          const n = [...humans];
                          const nextNpcId = npcData[nextIndex].id;
                          const nextNpc = npcData[nextIndex];
                          n[0].npcId = nextNpcId;
                          n[0].color = nextNpc.color;
                          setHumans(n);

                          // Play select and iconic sounds
                          const voiceKey = nextNpc.voiceKeyOverride || nextNpc.name.toLowerCase().replace(/\s/g, '_');
                          const randomIndex = Math.floor(Math.random() * 3) + 1;
                          soundEngine.speak(voiceKey, [
                            { category: 'select', file: `select_${randomIndex}` },
                            { category: 'iconic', file: `iconic_${randomIndex}` }
                          ]);
                        }}
                        className="absolute right-0 z-20 w-14 h-14 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:border-white/40 transition-all group/btn shadow-xl active:scale-90"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-7 h-7 group-hover/btn:translate-x-0.5 transition-transform"><path d="M9 18l6-6-6-6"/></svg>
                      </button>
                    </div>

                    <div className="mt-8 text-center space-y-2">
                      <div className="flex flex-col items-center">
                        <h3 className="text-5xl bangers text-white uppercase italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                          {currentNpc?.name}
                        </h3>
                        <span 
                          className={`text-2xl opacity-80 mt-1 transition-all duration-700 ${currentNpc?.fontClass}`}
                          style={{ color: npcColor, textShadow: `0 0 15px ${npcColor}40` }}
                        >
                          {currentNpc?.translatedName}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-px w-8 transition-colors duration-700" style={{ backgroundColor: `${npcColor}40` }} />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] italic transition-colors duration-700" style={{ color: npcColor }}>
                          {currentNpc?.heritage}
                        </p>
                        <div className="h-px w-8 transition-colors duration-700" style={{ backgroundColor: `${npcColor}40` }} />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] block">2. Combatant Count</label>
              <div className="bg-zinc-900/60 p-10 rounded-[3rem] border border-white/5 shadow-2xl space-y-8">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 bangers text-2xl uppercase italic">Total Commanders in Theatre</span>
                  <span className="text-4xl bangers text-indigo-500">{totalPlayers}</span>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {[2, 3, 4, 5, 6].map(num => (
                    <button 
                      key={num} 
                      onClick={() => { soundEngine.play('UI_CLICK'); setTotalPlayers(num); setSelectedNpcs([]); }}
                      className={`py-6 rounded-2xl bangers text-2xl transition-all border-2 ${totalPlayers === num ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-black/40 border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700'}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-6 space-y-12">
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] block">3. Select Rival Intelligence</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="SEARCH RIVALS..." 
                      value={rivalSearch}
                      onChange={(e) => setRivalSearch(e.target.value)}
                      className="bg-black/60 border-b-2 border-indigo-500/30 text-[10px] font-mono text-indigo-400 px-4 py-2 outline-none focus:border-indigo-500 w-48 transition-all rounded-t-lg"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-3 gap-3 sm:gap-4 max-h-[300px] sm:max-h-[450px] overflow-y-auto pr-2 scrollbar-hide">
                  {filteredRivals.map(n => (
                    <Tooltip key={n.id} text={`Rival: ${n.name}`}>
                      <div 
                        onClick={() => {
                          soundEngine.play('UI_CLICK');
                          setSelectedNpcs(prev => prev.includes(n.id) ? prev.filter(x => x !== n.id) : [...prev, n.id].slice(0, totalPlayers - 1));
                        }} 
                        className={`group p-1 sm:p-2 border-2 transition-all cursor-pointer relative rounded-[1rem] sm:rounded-[2rem] overflow-hidden ${selectedNpcs.includes(n.id) ? 'border-indigo-500 bg-indigo-500/20 scale-105 shadow-[0_0_40px_rgba(79,70,229,0.4)]' : 'border-zinc-800 opacity-40 hover:opacity-100 hover:border-zinc-600 bg-black/40'}`}
                      >
                        <div className="relative aspect-square rounded-[0.8rem] sm:rounded-[1.5rem] overflow-hidden mb-1 sm:mb-3 ring-1 ring-white/5">
                          <Avatar spriteIndex={n.spriteIndex} type="victory" className="w-full h-full scale-110" noBorder />
                          {selectedNpcs.includes(n.id) && (
                            <div className="absolute inset-0 bg-indigo-500/30 flex items-center justify-center backdrop-blur-[2px]">
                              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,1)] animate-pulse">
                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" className="w-4 h-4 sm:w-7 sm:h-7"><path d="M20 6L9 17l-5-5"/></svg>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-center px-1 pb-1">
                          <span className="text-[9px] sm:text-[11px] bangers uppercase text-white truncate block tracking-wide">{n.name}</span>
                        </div>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] block">4. Difficulty Calibration</label>
                <div className="grid grid-cols-3 gap-4 sm:gap-6">
                  {(['easy', 'normal', 'hard'] as AiDifficulty[]).map(d => (
                    <Tooltip key={d} text={d === 'easy' ? 'Reduced AI aggression.' : d === 'hard' ? 'Maximum AI efficiency.' : 'Balanced challenge.'}>
                      <button 
                        onClick={() => { soundEngine.play('UI_CLICK'); setDifficulty(d); }}
                        className={`w-full py-4 sm:py-8 rounded-[1rem] sm:rounded-[2rem] bangers text-xl sm:text-3xl uppercase tracking-[0.1em] transition-all border-2 relative overflow-hidden group/btn ${difficulty === d ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_40px_rgba(79,70,229,0.4)] scale-105' : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
                      >
                        {difficulty === d && <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_50%,transparent_50%)] bg-[length:100%_4px] opacity-20" />}
                        <span className="relative z-10 italic">{d}</span>
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] block">5. Deployment Protocol</label>
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  {(['random', 'manual'] as SetupRule[]).map(r => (
                    <Tooltip key={r} text={r === 'random' ? 'Territories are automatically distributed.' : 'Manual territory claim.'}>
                      <button 
                        onClick={() => { soundEngine.play('UI_CLICK'); setSetupRule(r); }}
                        className={`w-full py-4 sm:py-8 rounded-[1rem] sm:rounded-[2rem] bangers text-xl sm:text-3xl uppercase tracking-[0.1em] transition-all border-2 relative overflow-hidden group/btn ${setupRule === r ? 'bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.2)] scale-105' : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
                      >
                        {setupRule === r && <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_50%,transparent_50%)] bg-[length:100%_4px] opacity-20" />}
                        <span className="relative z-10 italic">{r}</span>
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>

            </div>
 
             <div className="flex flex-col gap-4 sm:gap-6 pt-6 sm:pt-12 border-t border-white/5">
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <button 
                    onClick={() => {
                      soundEngine.startBgm('MAIN');
                      setMode('HOME');
                    }} 
                    className="py-4 sm:py-8 bg-zinc-900/80 rounded-[1.5rem] sm:rounded-[2.5rem] bangers text-xl sm:text-3xl text-zinc-500 hover:text-white transition-all uppercase border-2 border-white/5 hover:border-white/20 italic"
                  >
                    Abort Mission
                  </button>
                  <button 
                    onClick={() => { 
                      if (selectedNpcs.length < totalPlayers - 1) {
                        soundEngine.play('ERROR');
                        return;
                      }
                      soundEngine.play('CONFIRM');
                      soundEngine.startBgm('MAIN');
                      initGame(totalPlayers, humans, difficulty, setupRule, selectedNpcs); 
                    }} 
                    disabled={selectedNpcs.length < totalPlayers - 1}
                    className={`py-4 sm:py-8 rounded-[1.5rem] sm:rounded-[2.5rem] bangers text-2xl sm:text-4xl transition-all border-b-4 sm:border-b-8 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] uppercase italic tracking-tighter ${selectedNpcs.length < totalPlayers - 1 ? 'bg-zinc-800 border-zinc-900 opacity-50 cursor-not-allowed' : 'bg-indigo-600 border-indigo-900 hover:bg-indigo-500 hover:-translate-y-1 active:translate-y-1 active:border-b-0 shadow-[0_0_40px_rgba(79,70,229,0.3)]'}`}
                  >
                    {selectedNpcs.length < totalPlayers - 1 ? `Select ${totalPlayers - 1 - selectedNpcs.length} More Rivals` : 'Initiate Global Conflict'}
                  </button>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-[0.5em]">Neural Link Protocol v4.2.0</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (missionOptions) return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-8 overflow-hidden animate-in fade-in duration-700">
      {/* Back Button for Mission Selection */}
      <button 
        onClick={() => {
          if (confirm('Cancel mission selection and return to setup?')) {
            resetGame();
            setMode('SKIRMISH_SETUP');
          }
        }} 
        className="absolute top-10 left-10 z-50 flex items-center gap-3 text-zinc-500 hover:text-white transition-all group"
      >
        <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-white transition-all">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Setup</span>
      </button>

      <div className="relative border-4 border-dashed border-indigo-500/20 rounded-[4rem] p-16 flex flex-col items-center justify-center max-w-7xl w-full">
        <h2 className="text-7xl bangers text-white uppercase mb-16 tracking-[0.2em] text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">Operator Authorization Required</h2>
        <div className="flex flex-wrap items-center justify-center gap-12 [perspective:1500px]">
          {missionOptions.map((m) => <FlipMissionCard key={m.id} mission={m} onSelect={() => selectMission(m)} />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen bg-[#0a0a0c] text-zinc-300 font-sans overflow-hidden select-none relative">
      <ChromaKeyFilter />
      
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {(isLeftSidebarOpen || isRightSidebarOpen) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setIsLeftSidebarOpen(false); setIsRightSidebarOpen(false); }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed lg:static inset-y-0 left-0 w-72 lg:w-64 h-full bg-[#0d0d0f]/95 border-r border-zinc-800 flex flex-col z-50 transition-transform duration-500 ease-out ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="relative w-full aspect-[9/16] bg-black overflow-hidden group">
           <Avatar player={players[currentPlayerIndex]} type="profile" className="w-full h-full border-0 rounded-none object-cover opacity-90 shadow-[inset_0_0_100px_rgba(0,0,0,1)]" />
           <div className="absolute bottom-4 left-4 right-4">
              <span className="text-2xl bangers uppercase block truncate drop-shadow-md leading-none" style={{ color: players[currentPlayerIndex]?.color }}>{players[currentPlayerIndex]?.name}</span>
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-1 block">Active Commander</span>
           </div>
           {/* Mobile Close Button */}
           <button onClick={() => setIsLeftSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white">
              <X className="w-5 h-5" />
           </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 flex flex-col gap-2">
            {players.map((p, idx) => (
              <div 
                key={p.id} 
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${idx === currentPlayerIndex ? 'bg-white/10 border-white/20 shadow-lg' : 'border-transparent opacity-40'} ${p.isEliminated ? 'grayscale opacity-10' : ''}`}
              >
                <Avatar player={p} className="w-10 h-10 lg:w-8 lg:h-8" />
                <div className="flex-1 overflow-hidden">
                  <span className="text-sm lg:text-xs bangers uppercase truncate block tracking-wider" style={{color: p.color}}>{p.name}</span>
                  <span className="text-[8px] font-mono text-zinc-500 uppercase block">{p.type}</span>
                </div>
              </div>
            ))}
        </div>
        <div className="p-4 border-t border-zinc-800/40 bg-black/40 flex gap-2">
           <button 
             onClick={() => setIsChatOpen(true)}
             className="flex-1 py-3 bg-zinc-900 hover:bg-indigo-900/40 border border-zinc-800 hover:border-indigo-500/50 rounded-xl flex items-center justify-center gap-2 transition-all group relative"
           >
             <MessageSquare className="w-4 h-4 text-zinc-500 group-hover:text-indigo-500" />
             <span className="text-[10px] font-black text-zinc-500 group-hover:text-indigo-500 uppercase tracking-widest">Chat</span>
             {useGameStore.getState().messages.length > 0 && !isChatOpen && <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border border-black animate-pulse" />}
           </button>
           <button 
             onClick={() => {
               soundEngine.play('UI_CLICK');
               setIsOptionsOpen(true);
             }}
             className="w-12 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl flex items-center justify-center transition-all group"
           >
             <Settings className="w-4 h-4 text-zinc-500 group-hover:text-white" />
           </button>
        </div>
      </aside>

      <main className="flex-1 relative bg-black overflow-hidden flex flex-col">
        {/* Mobile HUD Controls */}
        <div className="lg:hidden absolute top-6 left-6 right-6 z-40 flex justify-between pointer-events-none">
           <button 
             onClick={() => setIsLeftSidebarOpen(true)} 
             className="w-12 h-12 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white pointer-events-auto shadow-2xl active:scale-90 transition-transform"
           >
              <Menu className="w-6 h-6" />
           </button>
           <div className="flex gap-3">
             <button 
               onClick={() => setIsChatOpen(true)} 
               className="w-12 h-12 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white pointer-events-auto shadow-2xl active:scale-90 transition-transform relative"
             >
                <MessageSquare className="w-6 h-6" />
                {useGameStore.getState().messages.length > 0 && !isChatOpen && <div className="absolute top-2 right-2 w-3 h-3 bg-indigo-500 rounded-full border-2 border-black animate-pulse" />}
             </button>
             <button 
               onClick={() => setIsCardOverlayOpen(true)} 
               className="w-12 h-12 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white pointer-events-auto shadow-2xl active:scale-90 transition-transform"
             >
                <Database className="w-6 h-6" />
             </button>
             <button 
               onClick={() => setIsRightSidebarOpen(true)} 
               className="w-12 h-12 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white pointer-events-auto shadow-2xl active:scale-90 transition-transform"
             >
                <Settings className="w-6 h-6" />
             </button>
           </div>
        </div>

      <WorldMap 
        gameState={{territories, players, currentPlayerIndex, phase, reinforcementsAvailable, winner, selectedId} as any} 
        selectedId={selectedId} 
        targetId={targetId}
        suggestedId={strategicAdvice?.targetTerritoryId} 
        threatId={strategicAdvice?.predictedThreatId} 
        onTerritoryClick={handleTerritoryClick} 
      />

      <AnimatePresence>
        {showTurnNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
          >
            <div className="bg-black/90 backdrop-blur-2xl border border-white/10 px-10 py-5 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.9)] flex items-center gap-8 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
              <div className="relative">
                <Avatar player={players[currentPlayerIndex]} className="w-16 h-16 ring-4 ring-white/5" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-black">
                  <Zap className="w-3 h-3 text-white fill-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.6em] mb-1">Authorization Confirmed</span>
                <h2 className="text-4xl bangers text-white uppercase italic tracking-tighter leading-none">
                  Your Turn, <span style={{ color: players[currentPlayerIndex]?.color }}>{players[currentPlayerIndex]?.name}</span>
                </h2>
              </div>
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center ml-2">
                {getPhaseIcon(phase)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
        
        {/* Phase Indicator for Mobile */}
        <div className="lg:hidden absolute bottom-6 left-6 right-6 z-40 flex flex-col gap-4 pointer-events-none">
           <div className="flex justify-between items-end">
              <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl pointer-events-auto shadow-2xl">
                 <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Reserves</span>
                 <div className="text-4xl font-black italic mono leading-none" style={{ color: players[currentPlayerIndex]?.color }}>{reinforcementsAvailable}</div>
              </div>
              <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl pointer-events-auto shadow-2xl flex items-center gap-4">
                 <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block">Phase</span>
                    <span className="text-sm bangers text-white uppercase italic">{phase}</span>
                 </div>
                 <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    {getPhaseIcon(phase)}
                 </div>
              </div>
           </div>
           <button 
             disabled={players[currentPlayerIndex]?.type === 'ai' || phase === 'waiting'} 
             onClick={nextPhase} 
             className={`w-full py-5 bangers text-2xl rounded-2xl border-b-4 transition-all pointer-events-auto shadow-2xl ${players[currentPlayerIndex]?.type === 'ai' || phase === 'waiting' ? 'bg-zinc-800 text-zinc-600 border-zinc-900' : 'bg-indigo-600 text-white border-indigo-900 active:border-0 active:translate-y-1'} ${phase !== 'waiting' && players[currentPlayerIndex]?.type === 'human' ? 'animate-pulse' : ''}`}
           >
             Confirm Action
           </button>
        </div>

        {isCombatActive && selectedId && targetId && (
          <div className="absolute bottom-0 left-0 right-0 lg:h-44 bg-zinc-950/95 backdrop-blur-3xl border-t border-white/10 z-50 animate-in slide-in-from-bottom-full duration-500 flex flex-col lg:flex-row items-center justify-center p-6 lg:px-12 gap-6 lg:gap-16 shadow-[0_-20px_100px_rgba(0,0,0,0.8)]">
            <div className="flex flex-col items-center gap-2 lg:gap-4">
               <div className="flex items-center gap-3">
                 <Avatar player={players.find(p => p.id === territories[selectedId]?.owner)} type="head" className="w-10 h-10 border-indigo-500/50" />
                 <span className="text-[10px] bangers text-indigo-400 uppercase tracking-widest">{territories[selectedId]?.name}</span>
               </div>
               <div className="flex gap-2 lg:gap-4">
                {lastBattleResult?.aRolls.map((v, i) => <TacticalDice key={i} value={v} type="attacker" />) || Array.from({length: Math.min(3, (territories[selectedId]?.troops || 1) - 1)}).map((_, i) => <div key={i} className="w-12 h-12 lg:w-16 lg:h-16 border-2 border-dashed border-indigo-500/20 rounded-xl" />)}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
               {(players[currentPlayerIndex]?.type === 'human' || isAwaitingHumanDefense) && (
                 <button 
                   onClick={() => {
                     if (lastBattleResult) clearBattleResult();
                     setTimeout(() => {
                       executeAttack(
                         Math.min(3, (territories[selectedId]?.troops || 2) - 1), 
                         Math.min(2, territories[targetId]?.troops || 1)
                       );
                     }, 50);
                   }} 
                   disabled={(territories[selectedId]?.troops || 0) <= 1}
                   className="px-10 py-4 bg-indigo-600 text-white bangers text-2xl rounded-xl hover:bg-indigo-500 border-b-4 border-indigo-900 shadow-[0_0_30px_rgba(79,70,229,0.4)] active:translate-y-1 active:border-b-0 disabled:opacity-20 disabled:grayscale transition-all"
                 >
                   {isAwaitingHumanDefense ? 'Roll Defense' : (lastBattleResult ? 'Re-Engage' : 'Execute Assault')}
                 </button>
               )}
               {!isAwaitingHumanDefense && (
                 <button onClick={closeBattle} className="text-[10px] font-black uppercase text-zinc-600 hover:text-zinc-400 transition-all tracking-widest mt-2 underline italic">Withdraw Forces</button>
               )}
            </div>
            <div className="flex flex-col items-center gap-2 lg:gap-4">
               <div className="flex items-center gap-3">
                 <span className="text-[10px] bangers text-red-400 uppercase tracking-widest">{territories[targetId]?.name}</span>
                 <Avatar player={players.find(p => p.id === territories[targetId]?.owner)} type="head" className="w-10 h-10 border-red-500/50" />
               </div>
               <div className="flex gap-2 lg:gap-4">
                {lastBattleResult?.dRolls.map((v, i) => <TacticalDice key={i} value={v} type="defender" />) || Array.from({length: Math.min(2, territories[targetId]?.troops || 1)}).map((_, i) => <div key={i} className="w-12 h-12 lg:w-16 lg:h-16 border-2 border-dashed border-red-500/20 rounded-xl" />)}
              </div>
            </div>
          </div>
        )}
        {strategicAdvice && <div className="absolute top-24 lg:top-6 left-1/2 -translate-x-1/2 z-[40] animate-in fade-in zoom-in duration-500 bg-black/90 border border-indigo-500/50 p-3 rounded-xl max-w-sm"><p className="text-[10px] bangers text-white uppercase italic leading-tight">{strategicAdvice.recommendedAction}: {strategicAdvice.thoughtProcess}</p></div>}

        <AnimatePresence>
          {isChatOpen && <MultiplayerChat onClose={() => setIsChatOpen(false)} />}
        </AnimatePresence>
      </main>

      <aside className={`fixed lg:static inset-y-0 right-0 w-72 lg:w-64 h-full bg-[#0d0d0f]/90 border-l border-zinc-800 flex flex-col z-50 transition-transform duration-500 ease-out ${isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
         {targetId ? (
           <div className="relative w-full aspect-[9/16] bg-black overflow-hidden group animate-in slide-in-from-right duration-500">
              <Avatar player={players.find(p => p.id === territories[targetId].owner)} type="profile" mirrored={true} className="w-full h-full border-0 rounded-none object-cover opacity-90 shadow-[inset_0_0_100px_rgba(0,0,0,1)]" />
              <div className="absolute bottom-4 left-4 right-4 text-right">
                 <span className="text-2xl bangers uppercase block truncate drop-shadow-md leading-none" style={{ color: players.find(p => p.id === territories[targetId].owner)?.color }}>{players.find(p => p.id === territories[targetId].owner)?.name}</span>
                 <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-1 block">Target Commander</span>
              </div>
              {/* Mobile Close Button */}
              <button onClick={() => setIsRightSidebarOpen(false)} className="lg:hidden absolute top-4 left-4 w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white">
                 <X className="w-5 h-5" />
              </button>
           </div>
         ) : (
           <div className="p-6 lg:p-4 flex justify-between items-center lg:hidden">
              <span className="text-xl bangers text-white uppercase italic">Operations</span>
              <button onClick={() => setIsRightSidebarOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                 <X className="w-5 h-5" />
              </button>
           </div>
         )}
         
         <div className="flex-1 overflow-y-auto scrollbar-hide p-6 lg:p-4 flex flex-col gap-6 lg:gap-4">
            {targetId && selectedId && (
              <div className="bg-zinc-900/80 border border-red-500/30 p-4 rounded-2xl space-y-3 animate-in fade-in duration-500">
                 <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">Conflict Zone</span>
                    <div className="flex gap-1">
                       <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                       <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse delay-75" />
                       <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse delay-150" />
                    </div>
                 </div>
                 <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 text-left">
                       <div className="text-[10px] bangers text-white uppercase truncate">{territories[selectedId].name}</div>
                       <div className="w-full h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                          <div className="h-full transition-all duration-500" style={{ width: '100%', backgroundColor: players.find(p => p.id === territories[selectedId].owner)?.color }} />
                       </div>
                    </div>
                    <div className="text-zinc-600 bangers text-lg italic px-2">VS</div>
                    <div className="flex-1 text-right">
                       <div className="text-[10px] bangers text-red-400 uppercase truncate">{territories[targetId].name}</div>
                       <div className="w-full h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                          <div className="h-full transition-all duration-500" style={{ width: '100%', backgroundColor: players.find(p => p.id === territories[targetId].owner)?.color }} />
                       </div>
                    </div>
                 </div>
              </div>
            )}

            <div className="bg-zinc-900 border border-white/5 p-4 rounded-2xl">
               <span className="text-[8px] font-black text-zinc-600 uppercase block mb-2 text-center tracking-widest">Ops Phase</span>
               <div className="flex items-center justify-center py-4">{getPhaseIcon(phase)}</div>
               <button disabled={players[currentPlayerIndex]?.type === 'ai' || phase === 'waiting'} onClick={nextPhase} className={`w-full py-3 bangers text-xl rounded-xl border-b-4 transition-all ${players[currentPlayerIndex]?.type === 'ai' || phase === 'waiting' ? 'bg-zinc-800 text-zinc-600 border-zinc-900' : 'bg-white text-black border-zinc-300 hover:bg-zinc-100'} ${phase !== 'waiting' && players[currentPlayerIndex]?.type === 'human' ? 'animate-pulse' : ''}`}>Confirm Action</button>
            </div>
            <button 
              onClick={() => { setIsCardOverlayOpen(true); setIsRightSidebarOpen(false); }} 
              className="w-full py-5 lg:py-4 bg-zinc-900 border border-white/5 rounded-2xl bangers text-xl lg:text-lg hover:bg-zinc-800 transition-all uppercase italic flex items-center justify-center gap-3"
            >
               <Database className="w-5 h-5" />
               Inventory
            </button>

            {campaign.perks.filter(p => p.isUnlocked).length > 0 && (
              <div className="bg-zinc-900/40 border border-indigo-500/20 p-4 rounded-2xl space-y-3">
                 <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest block text-center">Tactical Support</span>
                 <div className="grid grid-cols-1 gap-2">
                    {campaign.perks.filter(p => p.isUnlocked).map(p => (
                      <button 
                        key={p.id}
                        onClick={() => {
                          if (p.id === 'p_drop') {
                            if (!selectedId) {
                              alert("Select a friendly territory first.");
                              return;
                            }
                            executePerk(p.id, selectedId);
                          } else if (p.id === 'p_strike') {
                            if (!targetId) {
                              alert("Select an enemy territory first (Target Intel).");
                              return;
                            }
                            executePerk(p.id, targetId);
                          } else {
                            executePerk(p.id);
                          }
                        }}
                        className="w-full py-2 px-3 bg-indigo-900/20 border border-indigo-500/30 rounded-xl flex items-center justify-between group hover:bg-indigo-500/20 transition-all"
                      >
                         <div className="text-left">
                            <div className="text-[10px] bangers text-white uppercase leading-none">{p.name}</div>
                            <div className="text-[7px] font-mono text-indigo-400 uppercase mt-1">Ready</div>
                         </div>
                         <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                            <Zap className="w-3 h-3 text-indigo-400 group-hover:text-white" />
                         </div>
                      </button>
                    ))}
                 </div>
              </div>
            )}

            <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl space-y-3">
               <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block text-center">Continent Intel</span>
               <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'N. America', bonus: 5, color: '#f59e0b' },
                    { name: 'S. America', bonus: 2, color: '#ef4444' },
                    { name: 'Europe', bonus: 5, color: '#3b82f6' },
                    { name: 'Africa', bonus: 2, color: '#10b981' },
                    { name: 'Asia', bonus: 7, color: '#22c55e' },
                    { name: 'Australia', bonus: 2, color: '#a855f7' }
                  ].map(c => (
                    <div key={c.name} className="flex items-center justify-between p-2 bg-black/20 rounded-lg border border-white/5">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                        <span className="text-[9px] font-black text-zinc-400 uppercase truncate">{c.name}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-white">+{c.bonus}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="mt-auto bg-zinc-900 border border-white/5 p-6 lg:p-4 rounded-2xl text-center">
               <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Reserves</span>
               <div className="text-7xl lg:text-6xl font-black italic mono leading-none tracking-tighter" style={{ color: players[currentPlayerIndex]?.color }}>{reinforcementsAvailable}</div>
            </div>
         </div>
      </aside>

      {isCardOverlayOpen && (        <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-2xl p-8 flex flex-col animate-in fade-in duration-500">
          <div className="flex justify-between mb-8 border-b border-white/10 pb-4">
            <h2 className="text-4xl bangers text-white uppercase italic">Tactical Inventory</h2>
            <button onClick={() => setIsCardOverlayOpen(false)} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors font-black">X</button>
          </div>
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 overflow-hidden">
            <div className="col-span-3 grid grid-cols-4 md:grid-cols-6 gap-4 overflow-y-auto scrollbar-hide">
              {(playerHands[players[currentPlayerIndex]?.id] || []).map(c => (
                <TacticalCard key={c.id} card={c} territoryName={c.territoryId ? territories[c.territoryId]?.name : 'WILD'} isSelected={selectedCards.includes(c.id)} onClick={() => toggleCardSelection(c.id)} />
              ))}
            </div>
            <div className="space-y-8">
              {players[currentPlayerIndex] && <MissionCard mission={players[currentPlayerIndex].mission} />} 
              {phase === 'reinforce' && players[currentPlayerIndex]?.type === 'human' && (
                <button disabled={selectedCards.length !== 3} onClick={() => {tradeInCards(); setIsCardOverlayOpen(false);}} className="w-full py-6 bg-indigo-600 text-white bangers text-2xl rounded-2xl disabled:opacity-20 hover:bg-indigo-500 shadow-lg italic">Trade-In Asset Set</button>
              )}
            </div>
          </div>
        </div>
      )}

      {pendingInvasion && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-8 animate-in fade-in backdrop-blur-md">
            <div className="bg-zinc-950 border-2 border-zinc-800 p-12 rounded-[3rem] w-full max-w-lg shadow-[0_50px_100px_rgba(0,0,0,1)] text-center space-y-8">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Sector Advance</span>
                  <div className="text-9xl bangers text-white italic tracking-tighter">{invasionCount}</div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Min: {pendingInvasion.min} / Max: {(territories[pendingInvasion.from]?.troops || 2) - 1}</span>
                </div>

                <div className="space-y-6">
                  <input 
                    type="range" 
                    min={pendingInvasion.min} 
                    max={(territories[pendingInvasion.from]?.troops || 2) - 1} 
                    value={invasionCount} 
                    onChange={(e) => setInvasionCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-full appearance-none accent-indigo-500 cursor-pointer"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setInvasionCount((territories[pendingInvasion.from]?.troops || 2) - 1)}
                      className="py-3 bg-zinc-900 text-zinc-400 font-black uppercase tracking-widest text-[10px] rounded-xl border border-white/5 hover:bg-zinc-800 transition-all"
                    >
                      Advance All
                    </button>
                    <button 
                      onClick={() => setInvasionCount(pendingInvasion.min)}
                      className="py-3 bg-zinc-900 text-zinc-400 font-black uppercase tracking-widest text-[10px] rounded-xl border border-white/5 hover:bg-zinc-800 transition-all"
                    >
                      Minimum
                    </button>
                  </div>

                  <button 
                    onClick={() => finalizeInvasion(invasionCount)} 
                    className="w-full py-6 bg-indigo-600 text-white bangers text-3xl rounded-3xl shadow-xl hover:bg-indigo-500 border-b-8 border-indigo-900 active:border-0 active:translate-y-2 uppercase italic tracking-tighter"
                  >
                    Authorize Deployment
                  </button>
                </div>
            </div>
        </div>
      )}

      {isOptionsOpen && (
        <div className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="bg-zinc-950 border border-white/10 p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl space-y-8 relative">
            <button onClick={() => setIsOptionsOpen(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center space-y-2">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Neural Link</span>
              <h2 className="text-4xl bangers text-white uppercase italic">System Options</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Audio Volume</span>
                  <span className="text-[10px] font-mono text-indigo-500">{Math.round(bgmVolume * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={bgmVolume} 
                  onChange={(e) => { 
                    const vol = parseFloat(e.target.value); 
                    setBgmVolume(vol); 
                    soundEngine.setBgmVolume(vol); 
                  }} 
                  className="w-full h-2 bg-zinc-900 rounded-full appearance-none accent-indigo-500 cursor-pointer" 
                />
              </div>

              <div className="h-px bg-white/5" />

              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to quit to the main menu? Progress will be lost.')) {
                    resetGame();
                    soundEngine.startBgm('MAIN');
                    setMode('HOME');
                    setIsOptionsOpen(false);
                  }
                }}
                className="w-full py-4 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 rounded-xl flex items-center justify-center gap-3 transition-all group"
              >
                <X className="w-5 h-5 text-red-500" />
                <span className="text-sm font-black text-red-500 uppercase tracking-widest">Terminate Mission</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {winner && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-[250] flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-1000">
            <Avatar player={players.find(p => p.id === winner)!} type="victory" className="w-80 h-80 relative z-10" />
            <h2 className="text-[10rem] bangers text-black uppercase leading-none italic">{players.find(p => p.id === winner)?.type === 'human' ? 'VICTORY' : 'DEFEAT'}</h2>
            <button onClick={() => { resetGame(); setMode('HOME'); }} className="px-16 py-6 bg-black text-white bangers text-4xl mt-8 hover:scale-105 transition-transform italic uppercase tracking-tighter">Return to War Room</button>
        </div>
      )}
    </div>
  );
};

const getPhaseIcon = (phase: string) => {
  switch (phase) {
    case 'setup': return <TacticalIcon type="annexation" className="w-12 h-12 text-indigo-500" />;
    case 'reinforce': return <TacticalIcon type="reinforce" className="w-12 h-12 text-indigo-500" />;
    case 'attack': return <TacticalIcon type="attack" className="w-12 h-12 text-red-500" />;
    case 'fortify': return <TacticalIcon type="fortify" className="w-12 h-12 text-indigo-500" />;
    default: return null;
  }
};

export default App;
