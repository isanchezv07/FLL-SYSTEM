import { Eye, Monitor, Play, Radio, Layout, Volume2, Music } from 'lucide-react';
import { socket } from '@/lib/socket';

export default function ScreensSection() {
  const triggerSound = (sound: 'start' | 'end') => {
    socket.emit('play_sound', { sound });
  };

  const displayNodes = [
    { 
      id: 'live', 
      label: 'Live Telemetry Display', 
      path: '/displays/live', 
      icon: Eye, 
      desc: 'Main event output featuring match results and rankings' 
    },
    { 
      id: 'timer', 
      label: 'Tactical Timer Display', 
      path: '/displays/timer', 
      icon: Play, 
      desc: 'Precision countdown system with synchronized field nodes' 
    },
    { 
      id: 'sound', 
      label: 'Audio/Visual Visualizer', 
      path: '/displays/sound', 
      icon: Radio, 
      desc: 'Real-time sonic telemetry and reactive visual engine' 
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm flex flex-col md:flex-row justify-between items-center transition-colors">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Display Matrix</h2>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Official Event Output Nodes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayNodes.map((node) => (
          <a 
            key={node.id} 
            href={node.path} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-600 dark:hover:border-blue-400 rounded-xl p-8 transition-all hover:shadow-lg flex flex-col h-full"
          >
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-lg flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                    <node.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">Node {node.id.toUpperCase()}</div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{node.label}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed flex-1">{node.desc}</p>

            <div className="mt-8 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold uppercase text-[10px] tracking-widest">
                Initialize Link
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        ))}

        {/* Sound Controls Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-950 rounded-lg flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm">
              <Volume2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">Sound Control</div>
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-4">Manual Audio Triggers</h3>
          
          <div className="space-y-3">
            <button 
              onClick={() => triggerSound('start')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Music className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Start Match Sound</span>
              </div>
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
            
            <button 
              onClick={() => triggerSound('end')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Music className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">End Match Sound</span>
              </div>
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
          
          <p className="mt-4 text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest leading-relaxed">
            Note: Audio will play on all active display nodes currently connected to the server.
          </p>
        </div>

        {/* Placeholder for future expansion */}
        <div className="hidden lg:flex bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 items-center justify-center transition-colors">
          <div className="text-center">
            <Layout className="w-8 h-8 text-slate-200 dark:text-slate-800 mx-auto mb-3" />
            <p className="text-[9px] font-bold text-slate-300 dark:text-slate-800 uppercase tracking-[0.3em]">Expansion Slot Available</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { ChevronRight } from 'lucide-react';
