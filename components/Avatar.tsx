import React, { useState, useEffect, useRef } from 'react';
import { PlayerConfig } from '../types';

const HEADSHOT_URL = 'https://raw.githubusercontent.com/japiohopman/risk/main/enemy_npcs/sprite_sheet.png';
const PROFILE_URL = 'https://raw.githubusercontent.com/japiohopman/risk/main/enemy_npcs/side_profiles.png';
const DEFEATED_URL = 'https://raw.githubusercontent.com/japiohopman/risk/main/enemy_npcs/defeated.png';
const VICTORY_URL = 'https://raw.githubusercontent.com/japiohopman/risk/main/enemy_npcs/victory.png';

const loadedSheets = new Set<string>();

export const ChromaKeyFilter = () => (
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

interface AvatarProps {
  player?: Partial<PlayerConfig>;
  spriteIndex?: number;
  color?: string;
  className?: string;
  type?: 'head' | 'profile' | 'defeated' | 'victory';
  mirrored?: boolean;
  noBorder?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  player, 
  spriteIndex, 
  color, 
  className = "w-8 h-8", 
  type = 'head', 
  mirrored = false, 
  noBorder = false 
}) => {
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
