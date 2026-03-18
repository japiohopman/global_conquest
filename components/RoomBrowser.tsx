import React, { useEffect } from 'react';
import { Globe, Users, RefreshCw } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { ShieldAlert } from 'lucide-react';

interface RoomBrowserProps {
  onClose: () => void;
  onJoin: (id: string) => void;
}

const RoomBrowser: React.FC<RoomBrowserProps> = ({ onClose, onJoin }) => {
  const availableRooms = useGameStore(s => s.availableRooms);
  const isFetchingRooms = useGameStore(s => s.isFetchingRooms);
  const fetchRooms = useGameStore(s => s.fetchRooms);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-2xl bg-zinc-900 border border-indigo-500/30 p-10 rounded-[3rem] shadow-[0_0_100px_rgba(79,70,229,0.2)] flex flex-col gap-8 relative overflow-hidden">
         <button onClick={onClose} className="absolute top-8 right-8 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">X</button>

         <div className="flex flex-col gap-2">
           <div className="flex items-center gap-3">
             <Globe className="w-5 h-5 text-indigo-500 animate-pulse" />
             <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.6em]">Satellite Uplink</span>
           </div>
           <h2 className="text-5xl bangers text-white uppercase italic tracking-tighter">Active Conflict Zones</h2>
         </div>

         <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-3 scrollbar-hide">
            {availableRooms.length === 0 && !isFetchingRooms && (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-8 h-8 text-zinc-800" />
                </div>
                <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest leading-relaxed">No active signals detected.<br/>Initiate a new command or wait for deployments.</p>
              </div>
            )}

            {availableRooms.map(room => (
              <div key={room.id} className="group p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 hover:border-indigo-500/30 transition-all">
                 <div className="flex flex-col gap-1">
                    <span className="text-xl bangers text-white tracking-widest">{room.id}</span>
                    <div className="flex items-center gap-3">
                       <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-zinc-500" />
                          <span className="text-[10px] font-mono text-zinc-500">{room.playerCount} COMMANDERS</span>
                       </div>
                       <div className="w-1 h-1 rounded-full bg-zinc-800" />
                       <span className={`text-[10px] font-black uppercase italic ${room.isStarted ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {room.isStarted ? 'In Progress' : 'Awaiting Deployment'}
                       </span>
                    </div>
                 </div>
                 <button
                   onClick={() => onJoin(room.id)}
                   className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white bangers text-lg rounded-xl transition-all shadow-lg group-hover:scale-105 active:scale-95"
                 >
                   Establish Link
                 </button>
              </div>
            ))}
         </div>

         <div className="flex justify-between items-center pt-6 border-t border-white/5">
            <button
              onClick={() => fetchRooms()}
              disabled={isFetchingRooms}
              className="flex items-center gap-2 text-[10px] font-black text-zinc-500 hover:text-indigo-400 transition-colors uppercase tracking-widest disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isFetchingRooms ? 'animate-spin' : ''}`} />
              Re-Scan Frequencies
            </button>
            <span className="text-[8px] font-mono text-zinc-700 uppercase">Neural Net v4.2.0</span>
         </div>
      </div>
    </div>
  );
};

export default RoomBrowser;