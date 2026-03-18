import React, { useState } from 'react';
import { Mission } from '../types';
import { soundEngine } from '../services/soundEngine';
import MissionCard from './MissionCard';
import { TacticalIcon } from './TacticalIcons';

const CARD_BACK_URL = 'https://raw.githubusercontent.com/japiohopman/risk/main/the_back_of_a_board_game_card_.webp';

interface FlipMissionCardProps {
  mission: Mission;
  onSelect: () => void;
}

export const FlipMissionCard: React.FC<FlipMissionCardProps> = ({ mission, onSelect }) => {
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
