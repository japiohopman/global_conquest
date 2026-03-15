
import React from 'react';
import { RiskItem } from '../types';
import { RISK_COLORS } from '../constants';

interface RiskMatrixProps {
  risks: RiskItem[];
}

const RiskMatrix: React.FC<RiskMatrixProps> = ({ risks }) => {
  const getRiskLevel = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 20) return RISK_COLORS.CRITICAL;
    if (score >= 12) return RISK_COLORS.HIGH;
    if (score >= 6) return RISK_COLORS.MEDIUM;
    return RISK_COLORS.LOW;
  };

  return (
    <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
      <h3 className="text-sm font-bold text-zinc-300 mb-4 uppercase tracking-tighter">Impact Velocity Matrix</h3>
      <div className="grid grid-cols-5 gap-2 aspect-square">
        {Array.from({ length: 25 }).map((_, i) => {
          const impact = 5 - Math.floor(i / 5);
          const likelihood = (i % 5) + 1;
          const activeRisks = risks.filter(r => r.likelihood === likelihood && r.impact === impact);
          
          return (
            <div 
              key={i} 
              className="relative flex items-center justify-center rounded border border-white/5 transition-all hover:scale-105"
              style={{ backgroundColor: `${getRiskLevel(likelihood, impact)}15` }}
            >
              {activeRisks.length > 0 && (
                <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: getRiskLevel(likelihood, impact), backgroundColor: 'currentColor' }} />
              )}
              {activeRisks.length > 1 && (
                <span className="absolute top-1 right-1 text-[8px] font-bold text-white/40">{activeRisks.length}</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-4 text-[10px] text-zinc-600 font-bold">
        <span>LOW PROBABILITY</span>
        <span>HIGH PROBABILITY</span>
      </div>
    </div>
  );
};

export default RiskMatrix;
