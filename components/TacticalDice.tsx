
import React, { useEffect, useState } from 'react';
import { ICONS } from '../constants';

interface TacticalDiceProps {
  value: number;
  type: 'attacker' | 'defender';
}

const TacticalDice: React.FC<TacticalDiceProps> = ({ value, type }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Rotation mapping to show the correct face on top
    // 1: Front, 2: Back, 3: Left, 4: Right, 5: Top, 6: Bottom
    const targetX = value === 5 ? -90 : value === 6 ? 90 : 0;
    const targetY = value === 2 ? 180 : value === 3 ? 90 : value === 4 ? -90 : 0;
    
    // Add multiple full rotations for kinetic effect
    const spinX = targetX + (Math.floor(Math.random() * 3 + 2) * 360);
    const spinY = targetY + (Math.floor(Math.random() * 3 + 2) * 360);

    // Briefly reset to trigger animation if same value rolled twice
    setRotation({ x: Math.random() * 45, y: Math.random() * 45 });
    
    const timer = setTimeout(() => {
      setRotation({ x: spinX, y: spinY });
    }, 50);

    return () => clearTimeout(timer);
  }, [value]);

  const colorClass = type === 'attacker' ? 'border-indigo-500/50 bg-indigo-500/10 fill-indigo-400' : 'border-red-500/50 bg-red-500/10 fill-red-400';
  const glowClass = type === 'attacker' ? 'shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'shadow-[0_0_15px_rgba(239,68,68,0.3)]';

  return (
    <div className="w-12 h-12 lg:w-16 lg:h-16" style={{ perspective: '1000px', ['--dice-size' as any]: '48px' }}>
      <style>{`
        .dice-scene {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 1.2s cubic-bezier(0.15, 0.85, 0.35, 1.15);
        }
        .dice-face {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(10, 10, 12, 0.95);
          backdrop-filter: blur(4px);
          backface-visibility: hidden;
          padding: 15%;
        }
        .dice-face svg {
          width: 100%;
          height: 100%;
        }
        
        .dice-face-front  { transform: rotateY(0deg) translateZ(calc(var(--dice-size) / 2)); }
        .dice-face-back   { transform: rotateY(180deg) translateZ(calc(var(--dice-size) / 2)); }
        .dice-face-left   { transform: rotateY(-90deg) translateZ(calc(var(--dice-size) / 2)); }
        .dice-face-right  { transform: rotateY(90deg) translateZ(calc(var(--dice-size) / 2)); }
        .dice-face-top    { transform: rotateX(90deg) translateZ(calc(var(--dice-size) / 2)); }
        .dice-face-bottom { transform: rotateX(-90deg) translateZ(calc(var(--dice-size) / 2)); }

        @media (min-width: 1024px) {
          .dice-face-front  { transform: rotateY(0deg) translateZ(32px); }
          .dice-face-back   { transform: rotateY(180deg) translateZ(32px); }
          .dice-face-left   { transform: rotateY(-90deg) translateZ(32px); }
          .dice-face-right  { transform: rotateY(90deg) translateZ(32px); }
          .dice-face-top    { transform: rotateX(90deg) translateZ(32px); }
          .dice-face-bottom { transform: rotateX(-90deg) translateZ(32px); }
        }
      `}</style>
      
      <div 
        className="dice-scene" 
        style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
      >
        {[1, 2, 3, 4, 5, 6].map((face) => {
          const faceKey = face === 1 ? 'front' : face === 2 ? 'back' : face === 3 ? 'left' : face === 4 ? 'right' : face === 5 ? 'top' : 'bottom';
          return (
            <div key={face} className={`dice-face dice-face-${faceKey} rounded-lg ${colorClass} ${glowClass}`}>
              <svg viewBox="0 0 512 512">
                <path d={ICONS.Dice[face.toString() as keyof typeof ICONS.Dice]} fillRule="evenodd" />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TacticalDice;
