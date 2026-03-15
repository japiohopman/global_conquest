import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="group relative flex flex-col items-center">
      {children}
      <div className="absolute bottom-full mb-3 hidden group-hover:flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300 z-50 pointer-events-none">
        <div className="bg-zinc-900 border border-indigo-500/50 text-white text-[10px] px-3 py-2 rounded-lg shadow-2xl whitespace-nowrap max-w-xs text-center">
          <p className="font-medium tracking-wide">{text}</p>
        </div>
        <div className="w-2 h-2 bg-zinc-900 border-r border-b border-indigo-500/50 transform rotate-45 -mt-1"></div>
      </div>
    </div>
  );
};
