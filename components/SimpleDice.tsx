import React, { useEffect, useState } from 'react';
import { ICONS } from '../constants';

interface SimpleDiceProps {
  value: number;
  color: 'red' | 'white';
}

const SimpleDice: React.FC<SimpleDiceProps> = ({ value, color }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let rx = 0, ry = 0;
    switch(value) {
      case 1: rx = 0; ry = 0; break;
      case 2: rx = 0; ry = 180; break;
      case 3: rx = 0; ry = 90; break;
      case 4: rx = 0; ry = -90; break;
      case 5: rx = -90; ry = 0; break;
      case 6: rx = 90; ry = 0; break;
    }
    setRotation({ x: rx + 720, y: ry + 720 });
  }, [value]);

  const bgColor = color === 'red' ? 'bg-red-600' : 'bg-white';
  const diceIconColor = color === 'red' ? 'white' : 'black';
  const borderColor = color === 'red' ? 'border-red-800' : 'border-zinc-300';

  return (
    <div className="w-12 h-12 perspective-[500px]">
      <style>{`
        .dice-container {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dice-face {
          position: absolute;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(0,0,0,0.15);
          backface-visibility: hidden;
          border-radius: 6px;
          padding: 4px;
        }
        .f-front  { transform: rotateY(0deg) translateZ(24px); }
        .f-back   { transform: rotateY(180deg) translateZ(24px); }
        .f-left   { transform: rotateY(-90deg) translateZ(24px); }
        .f-right  { transform: rotateY(90deg) translateZ(24px); }
        .f-top    { transform: rotateX(90deg) translateZ(24px); }
        .f-bottom { transform: rotateX(-90deg) translateZ(24px); }
      `}</style>
      <div 
        className="dice-container"
        style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
      >
        {[1, 2, 3, 4, 5, 6].map((face) => {
          const faceClass = face === 1 ? 'f-front' : face === 2 ? 'f-back' : face === 3 ? 'f-left' : face === 4 ? 'f-right' : face === 5 ? 'f-top' : 'f-bottom';
          return (
            <div key={face} className={`dice-face ${faceClass} ${bgColor} ${borderColor}`}>
              <svg viewBox="0 0 512 512" fill={diceIconColor}>
                <path d={ICONS.Dice[face.toString() as keyof typeof ICONS.Dice]} />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleDice;