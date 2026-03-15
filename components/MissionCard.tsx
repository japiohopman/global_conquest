
import React from 'react';
import { Mission } from '../types';

interface MissionCardProps {
  mission: Mission;
}

const MissionCard: React.FC<MissionCardProps> = ({ mission }) => {
  return (
    <div className="relative w-full h-full bg-white border border-zinc-200 rounded-md overflow-hidden shadow-xl group transition-all duration-500 hover:shadow-[0_10px_20px_rgba(0,0,0,0.1)] flex flex-col">
      {/* Texture Layer - Subtle paper grain */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
      
      {/* Header */}
      <div className="bg-zinc-100 border-b border-zinc-200 p-2 text-center relative overflow-hidden">
        <span className="text-[7px] font-black uppercase tracking-[0.2em] text-zinc-500">Classified Objective</span>
      </div>

      {/* Main content Area */}
      <div className="p-4 flex-1 flex flex-col items-center justify-center text-center relative">
        <div className="space-y-4 z-10">
          <h3 className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Primary Directive</h3>
          <p className="text-[11px] lg:text-[18px] font-black text-zinc-900 uppercase italic leading-tight tracking-tight px-1 drop-shadow-sm">
            {mission.description}
          </p>
          <div className="h-0.5 w-12 bg-indigo-100 mx-auto" />
        </div>

        {/* Shield Icon - Stylized as an authentication seal */}
        <div className="mt-8 opacity-20 grayscale transition-all duration-700">
          <div className="w-14 h-14 rounded-full border-2 border-zinc-200 flex items-center justify-center bg-zinc-50 shadow-inner">
             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
             </svg>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-2 right-2 opacity-30">
        <span className="text-[6px] font-mono text-zinc-400 uppercase tracking-[0.1em]">UNIT_AUTH_REF_881</span>
      </div>
    </div>
  );
};

export default MissionCard;
