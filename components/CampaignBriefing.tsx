import React, { useState } from 'react';
import { Theatre } from '../types';
import { npcData } from '../npc_characters';
import { Avatar } from './Avatar';
import { TacticalIcon } from './TacticalIcons';

interface CampaignBriefingProps {
  theatre: Theatre;
  onInitiate: (count: number) => void;
  onCancel: () => void;
}

export const CampaignBriefing: React.FC<CampaignBriefingProps> = ({ theatre, onInitiate, onCancel }) => {
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
