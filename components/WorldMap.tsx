
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameState, TerritoryState } from '../types';
import { TERRITORY_PATHS } from '../constantsAtlasBoardes';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

const LABEL_COORDS: Record<string, {x: number, y: number}> = {
  'alaska': {x: 60, y: 80}, 'northwest_territory': {x: 130, y: 80}, 'greenland': {x: 260, y: 60}, 'alberta': {x: 120, y: 120},
  'ontario': {x: 160, y: 135}, 'quebec': {x: 220, y: 130}, 'western_united_states': {x: 125, y: 180}, 'eastern_united_states': {x: 175, y: 195},
  'central_america': {x: 140, y: 250}, 'venezuela': {x: 180, y: 290}, 'peru': {x: 180, y: 350}, 'brazil': {x: 240, y: 325},
  'argentina': {x: 200, y: 400}, 'iceland': {x: 320, y: 110}, 'great_britain': {x: 310, y: 162}, 'scandinavia': {x: 380, y: 110},
  'ukraine': {x: 450, y: 150}, 'western_europe': {x: 335, y: 215}, 'northern_europe': {x: 377, y: 175}, 'southern_europe': {x: 380, y: 210},
  'north_africa': {x: 350, y: 310}, 'egypt': {x: 410, y: 297}, 'east_africa': {x: 440, y: 360}, 'congo': {x: 410, y: 380},
  'south_africa': {x: 420, y: 435}, 'madagascar': {x: 475, y: 450}, 'ural': {x: 515, y: 120}, 'siberia': {x: 560, y: 90},
  'yakursk': {x: 610, y: 70}, 'irkutsk': {x: 610, y: 140}, 'mongolia': {x: 630, y: 200}, 'kamchatka': {x: 665, y: 80},
  'japan': {x: 685, y: 185}, 'china': {x: 690, y: 240}, 'afghanistan': {x: 510, y: 190}, 'middle_east': {x: 480, y: 290},
  'india': {x: 555, y: 270}, 'siam': {x: 605, y: 295}, 'indonesia': {x: 620, y: 370}, 'new_guinea': {x: 690, y: 355},
  'western_australia': {x: 650, y: 440}, 'eastern_australia': {x: 710, y: 435}
};

const TROOP_ICON_PATH = "M250.882 22.802c-23.366 3.035-44.553 30.444-44.553 65.935 0 19.558 6.771 36.856 16.695 48.815l11.84 14.263-18.217 3.424c-12.9 2.425-22.358 9.24-30.443 20.336-8.085 11.097-14.266 26.558-18.598 44.375-7.843 32.28-9.568 71.693-9.842 106.436h42.868l11.771 157.836c29.894 6.748 61.811 6.51 90.602.025l10.414-157.86h40.816c-.027-35.169-.477-75.126-7.584-107.65-3.918-17.934-9.858-33.372-18.04-44.343-8.185-10.97-18.08-17.745-32.563-19.989l-18.592-2.88 11.736-14.704c9.495-11.897 15.932-28.997 15.932-48.082 0-37.838-23.655-65.844-49.399-65.844z";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 1.0 to 0.0
  maxLife: number;
  size: number;
  type: 'fire' | 'smoke';
}

interface WorldMapProps {
  gameState: GameState;
  selectedId: string | null;
  targetId: string | null;
  suggestedId?: string;
  threatId?: string;
  reachableIds?: Set<string>;
  onTerritoryClick: (id: string) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ gameState, selectedId, targetId, suggestedId, threatId, reachableIds, onTerritoryClick }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [fireZones, setFireZones] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouchPos, setLastTouchPos] = useState({ x: 0, y: 0 });
  const [lastTouchDist, setLastTouchDist] = useState<number | null>(null);
  
  const prevTroops = useRef<Record<string, number>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number>(null);

  // Troop loss detection for fire zones
  useEffect(() => {
    const newFireZones: string[] = [];
    (Object.values(gameState.territories) as TerritoryState[]).forEach((t) => {
      const pCount = prevTroops.current[t.id];
      if (pCount !== undefined && t.troops < pCount) {
        newFireZones.push(t.id);
      }
      prevTroops.current[t.id] = t.troops;
    });

    if (newFireZones.length > 0) {
      setFireZones(prev => new Set([...prev, ...newFireZones]));
      newFireZones.forEach(id => {
        setTimeout(() => {
          setFireZones(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }, 3000);
      });
    }
  }, [gameState.territories]);

  // Particle Canvas Animation Loop
  const animate = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Spawn new particles for active zones
    fireZones.forEach(id => {
      const coord = LABEL_COORDS[id];
      if (!coord) return;

      // Spawn fire
      if (Math.random() > 0.4) {
        particlesRef.current.push({
          x: coord.x + (Math.random() - 0.5) * 15,
          y: coord.y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -Math.random() * 2 - 1,
          life: 1.0,
          maxLife: 0.5 + Math.random() * 0.5,
          size: 4 + Math.random() * 6,
          type: 'fire'
        });
      }
      // Spawn smoke
      if (Math.random() > 0.7) {
        particlesRef.current.push({
          x: coord.x + (Math.random() - 0.5) * 10,
          y: coord.y,
          vx: (Math.random() - 0.5) * 1,
          vy: -Math.random() * 1.5 - 0.5,
          life: 1.0,
          maxLife: 1.5 + Math.random() * 1,
          size: 8 + Math.random() * 12,
          type: 'smoke'
        });
      }
    });

    // 2. Update and Draw
    const nextParticles: Particle[] = [];
    ctx.globalCompositeOperation = 'screen';

    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02 / p.maxLife;

      if (p.life > 0) {
        nextParticles.push(p);
        
        ctx.beginPath();
        const alpha = p.life * (p.type === 'fire' ? 0.8 : 0.4);
        
        if (p.type === 'fire') {
          const r = 255;
          const g = Math.floor(100 + p.life * 155);
          const b = Math.floor(p.life * 50);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgba(255, 100, 0, ${alpha})`;
        } else {
          const shade = Math.floor(40 + (1 - p.life) * 40);
          ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, ${alpha})`;
          ctx.shadowBlur = 0;
        }

        ctx.arc(p.x, p.y, p.size * (0.5 + p.life * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
    });

    particlesRef.current = nextParticles;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [fireZones]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setLastTouchPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastTouchPos.x;
    const dy = e.clientY - lastTouchPos.y;
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastTouchPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setLastTouchPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setLastTouchDist(null);
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setLastTouchDist(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - lastTouchPos.x;
      const dy = e.touches[0].clientY - lastTouchPos.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastTouchPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (lastTouchDist !== null) {
        const delta = dist / lastTouchDist;
        setZoom(prev => Math.min(Math.max(prev * delta, 0.5), 4));
      }
      setLastTouchDist(dist);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouchDist(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.5), 4));
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const getStyle = (id: string) => {
    const t = gameState.territories[id];
    if (!t) return { fill: 'transparent', stroke: '#27272a' };
    const isSelected = selectedId === id;
    const isTarget = targetId === id;
    const isActive = hoveredId === id;
    const player = gameState.players.find(p => p.id === t.owner);
    const color = player?.color || '#3f3f46';
    if (t.owner === 'neutral') return { fill: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.4)', stroke: isActive ? '#fff' : 'rgba(255,255,255,0.1)', strokeWidth: isActive ? 2 : 1 };
    
    if (isTarget) {
      return {
        fill: 'rgba(239, 68, 68, 0.3)',
        stroke: '#ef4444',
        strokeWidth: 3,
        filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))'
      };
    }

    return { 
      fill: isSelected ? `${color}88` : `${color}25`, 
      stroke: (isSelected || isActive) ? '#fff' : color,
      strokeWidth: isSelected ? 2.5 : isActive ? 2.0 : 0.8,
    };
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Zoom Controls */}
      <div className="absolute top-24 lg:top-6 right-6 z-50 flex flex-col gap-2 pointer-events-auto">
        <button onClick={() => setZoom(prev => Math.min(prev * 1.2, 4))} className="w-10 h-10 lg:w-12 lg:h-12 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 active:scale-90 transition-all shadow-xl">
          <ZoomIn className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>
        <button onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.5))} className="w-10 h-10 lg:w-12 lg:h-12 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 active:scale-90 transition-all shadow-xl">
          <ZoomOut className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>
        <button onClick={resetView} className="w-10 h-10 lg:w-12 lg:h-12 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 active:scale-90 transition-all shadow-xl">
          <Maximize className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>
      </div>

      <div 
        className="relative w-full h-full transition-transform duration-75 ease-out will-change-transform"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-[750px] aspect-[750/521]">
            {/* Particle Canvas Overlay */}
            <canvas 
              ref={canvasRef}
              width={750}
              height={521}
              className="absolute inset-0 w-full h-full pointer-events-none z-[100]"
              style={{ imageRendering: 'pixelated' }}
            />
            
            <svg viewBox="0 0 750 521" className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] rounded-[2rem] overflow-visible relative">
              <image aria-hidden="true" href="https://www.krea.ai/api/img?f=webp&i=https%3A%2F%2Fapp-uploads.krea.ai%2F9678081a-d6a5-4cb1-8e01-1019733c1706%2F1768381276821-can_we_make_a_sea_behind_this_board_game_map_please_leave_the_map_intact_the_body_of_water_could_hav_b5a5ff3a-d2a3-424f-af97-ba4d28cd71c4.webp" x="-17" y="0" width="785" height="521" className="opacity-40 grayscale-[50%]" />
              
              {/* Connection Lines */}
              <image href="/risk_connect_lines.svg" x="0" y="0" width="750" height="521" className="opacity-60 pointer-events-none brightness-150 contrast-125" />

              <g className="territories">
                {Object.keys(gameState.territories).map(id => (
                  <path key={id} d={TERRITORY_PATHS[id]} onClick={() => onTerritoryClick(id)} onMouseEnter={() => { setHoveredId(id); import('../services/soundEngine').then(({ soundEngine }) => soundEngine.play('UI_HOVER')); }} onMouseLeave={() => setHoveredId(null)} className={`cursor-pointer transition-all outline-none ${targetId === id ? 'animate-pulse' : ''}`} style={getStyle(id)} />
                ))}
              </g>
              
              {/* Battle Link */}
              {selectedId && targetId && LABEL_COORDS[selectedId] && LABEL_COORDS[targetId] && (
                <g className="battle-link animate-in fade-in duration-700">
                  <defs>
                    <linearGradient id="battleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={gameState.players.find(p => p.id === gameState.territories[selectedId].owner)?.color || '#fff'} stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  <line 
                    x1={LABEL_COORDS[selectedId].x} 
                    y1={LABEL_COORDS[selectedId].y} 
                    x2={LABEL_COORDS[targetId].x} 
                    y2={LABEL_COORDS[targetId].y} 
                    stroke="url(#battleGradient)" 
                    strokeWidth="3" 
                    strokeDasharray="8 4"
                    className="animate-[dash_20s_linear_infinite]"
                  />
                  <circle cx={LABEL_COORDS[selectedId].x} cy={LABEL_COORDS[selectedId].y} r="4" fill={gameState.players.find(p => p.id === gameState.territories[selectedId].owner)?.color || '#fff'} />
                  <circle cx={LABEL_COORDS[targetId].x} cy={LABEL_COORDS[targetId].y} r="4" fill="#ef4444" className="animate-ping" />
                </g>
              )}
              <g pointerEvents="none">
                {(Object.entries(gameState.territories) as [string, TerritoryState][]).map(([id, t]) => {
                  if (t.owner === 'neutral') return null;
                  const coords = LABEL_COORDS[id];
                  if (!coords) return null;
                  const player = gameState.players.find(p => p.id === t.owner);
                  const isSelected = selectedId === id;
                  
                  return (
                    <g key={`node-${id}`} className="transition-all duration-300">
                      {/* Soldier Silhouette Icon - Adjusted size to be smaller and shifted slightly right */}
                      <g transform={`translate(${coords.x - 7}, ${coords.y - 18}) scale(0.038)`}>
                        {/* Shadow/Outline for visibility */}
                        <path 
                          d={TROOP_ICON_PATH} 
                          fill="black" 
                          transform="translate(40, 40)"
                          className="opacity-40"
                        />
                        <path 
                          d={TROOP_ICON_PATH} 
                          fill={player?.color || '#fff'} 
                          stroke="white" 
                          strokeWidth={isSelected ? "40" : "25"}
                          className={`transition-all duration-300 ${isSelected ? 'filter drop-shadow-[0_0_20px_white]' : ''}`}
                        />
                      </g>
                      {/* Troop Count Text - Made larger and shifted slightly right for better visibility */}
                      <text 
                        x={coords.x + 3} 
                        y={coords.y + 18} 
                        textAnchor="middle" 
                        className="text-[18px] font-black select-none pointer-events-none"
                        style={{ 
                          fill: 'white', 
                          fontFamily: 'Bangers, system-ui',
                          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,1))' 
                        }}
                      >
                        {t.troops}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;

