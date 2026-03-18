import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { useGameStore } from '../store/useGameStore';

interface MultiplayerChatProps {
  onClose: () => void;
}

export const MultiplayerChat: React.FC<MultiplayerChatProps> = ({ onClose }) => {
  const messages = useGameStore(s => s.messages);
  const sendMessage = useGameStore(s => s.sendChatMessage);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  return (
    <motion.div 
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed top-24 right-6 bottom-32 w-80 bg-zinc-950/90 backdrop-blur-2xl border border-indigo-500/30 rounded-[2rem] flex flex-col z-[100] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
    >
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-indigo-500/10">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">Comm Link</span>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-500 transition-colors">X</button>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-center px-8">
            <span className="text-[8px] font-mono text-zinc-600 uppercase leading-relaxed tracking-widest">Secure line established. Waiting for transmissions...</span>
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black uppercase tracking-tighter" style={{ color: m.senderColor }}>{m.senderName}</span>
              <span className="text-[6px] font-mono text-zinc-600">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className="text-xs text-zinc-300 font-medium leading-relaxed bg-white/5 p-2 rounded-lg rounded-tl-none border-l-2" style={{ borderLeftColor: m.senderColor }}>{m.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
        <input 
          type="text" 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="ENTER MESSAGE..." 
          className="flex-1 bg-zinc-900 border border-indigo-500/20 rounded-xl px-4 py-2 text-[10px] font-mono text-indigo-400 outline-none focus:border-indigo-500 transition-all"
        />
        <button type="submit" className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white hover:bg-indigo-500 transition-all shadow-lg active:scale-95">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
};
