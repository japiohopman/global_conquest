import React, { useState } from 'react';
import { Globe, Users } from 'lucide-react';
import GlobeIntro from '../components/GlobeIntro';
import { useGameStore } from '../store';
import { soundEngine } from '../services/soundEngine';
import RoomBrowser from '../components/RoomBrowser';

interface HomePageProps {
  mode: string;
  setMode: (mode: string) => void;
  multiplayerRoomId: string;
  setMultiplayerRoomId: (id: string) => void;
  isMultiplayer: boolean;
  connectMultiplayer: (url: string, roomId: string) => void;
  disconnectMultiplayer: () => void;
  isBrowserOpen: boolean;
  setIsBrowserOpen: (open: boolean) => void;
}

const HomePage: React.FC<HomePageProps> = ({
  setMode,
  multiplayerRoomId,
  setMultiplayerRoomId,
  isMultiplayer,
  connectMultiplayer,
  disconnectMultiplayer,
  isBrowserOpen,
  setIsBrowserOpen
}) => {
  const initiateNeuralLink = async () => {
    soundEngine.play('UI_CLICK');
    await soundEngine.startBgm('SELECT');
    setMode('SKIRMISH_SETUP');
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#050508] text-white font-sans overflow-hidden select-none relative">
      <GlobeIntro />
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
};

export default HomePage;