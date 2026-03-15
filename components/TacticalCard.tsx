
import React from 'react';
import { AssetCard, AssetType } from '../types';
import { UnitIcon } from './UnitIcons';
import { ASSET_CARD_PATHS } from '../constantsAssetCards';

interface TacticalCardProps {
  card: AssetCard;
  territoryName?: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const TacticalCard: React.FC<TacticalCardProps> = ({ card, territoryName, isSelected, onClick, disabled }) => {
  const cardPath = card.territoryId ? ASSET_CARD_PATHS[card.territoryId] : null;

  return (
    <div 
      onClick={!disabled ? onClick : undefined}
      className={`
        relative w-full aspect-[2/3] rounded-sm border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col
        ${isSelected 
          ? 'border-zinc-100 bg-zinc-100 shadow-[0_0_8px_rgba(255,255,255,0.3)] z-10' 
          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}
      `}
    >
      {/* Header: Name */}
      <div className={`p-0.5 text-center border-b ${isSelected ? 'border-zinc-200 bg-zinc-200' : 'border-zinc-800 bg-black/20'}`}>
        <div className={`text-[6px] font-black truncate uppercase tracking-tighter leading-none ${isSelected ? 'text-black' : 'text-zinc-300'}`}>
          {territoryName || 'WILD'}
        </div>
      </div>

      {/* Middle: Silhouette */}
      <div className="flex-1 flex items-center justify-center p-1 bg-black/5">
        {cardPath ? (
          <svg viewBox="0 0 320 256" className={`w-full h-full p-0 transition-all ${isSelected ? 'drop-shadow-[0_0_1px_rgba(0,0,0,0.5)]' : ''}`}>
             <path 
              d={cardPath} 
              fill={isSelected ? '#000' : '#444'} 
              stroke={isSelected ? '#000' : '#333'} 
              strokeWidth="1.5"
             />
          </svg>
        ) : (
          <div className={`text-[10px] font-black italic ${isSelected ? 'text-black opacity-20' : 'text-zinc-800 opacity-20'}`}>??</div>
        )}
      </div>

      {/* Footer: Unit Icon */}
      <div className={`p-1 flex flex-col items-center gap-0 border-t ${isSelected ? 'border-zinc-200 bg-zinc-200' : 'border-zinc-800 bg-black/20'}`}>
        <UnitIcon 
          type={card.type} 
          className="w-5 h-5" 
          color={isSelected ? "#000" : "#71717a"} 
        />
      </div>

      {isSelected && (
        <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-black rounded-full" />
      )}
    </div>
  );
};

export default TacticalCard;
