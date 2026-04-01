'use client';

import { useEffect, useState } from 'react';
import { GitFork, Layers, Calendar, RefreshCw } from 'lucide-react';

interface Bracket {
  id: string;
  name: string;
  size: number;
  mode: string;
  status: string;
  date: string;
}

export default function BracketsSection() {
  const [brackets, setBrackets] = useState<Bracket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrackets();
  }, []);

  const fetchBrackets = async () => {
    try {
      const res = await fetch('/api/brackets');
      const data = await res.json();
      setBrackets(data);
    } catch (error) {
      console.error('Error fetching brackets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-6">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Loading History</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Bracket History</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Archived and Active Tournaments</p>
        </div>
        <button 
          onClick={fetchBrackets}
          className="p-3 bg-slate-900 hover:bg-slate-800 text-blue-400 rounded-2xl border border-slate-800 transition-all active:scale-90"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brackets.length > 0 ? (
          brackets.slice().reverse().map(bracket => (
            <div
              key={bracket.id}
              className="group bg-slate-900/40 border border-slate-800 p-8 rounded-[32px] hover:border-blue-500/50 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                  <GitFork className="text-blue-500 w-6 h-6" />
                </div>
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${
                  bracket.status === 'active' 
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}>
                  {bracket.status}
                </span>
              </div>

              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-blue-400 transition-colors">
                {bracket.name}
              </h3>
              
              <div className="space-y-3 mt-6 pt-6 border-t border-slate-800/50">
                <div className="flex items-center gap-3 text-slate-400">
                  <Layers className="w-4 h-4 text-slate-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{bracket.size} Teams • {bracket.mode}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <span className="text-[10px] font-medium">
                    {new Date(bracket.date || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-32 bg-slate-900/20 rounded-[48px] border-4 border-dashed border-slate-800/50">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-800">
              <GitFork className="w-10 h-10 text-slate-700" />
            </div>
            <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No brackets generated yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
