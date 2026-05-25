'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Target, Zap, TrendingUp } from 'lucide-react';

interface MissionInfo {
  id: string;
  title: string;
  points: number;
  isCompleted: boolean;
  image: string;
}

interface MissionScoreBreakdownProps {
  match: any;
}

const MISSION_DATA: Record<string, { title: string; image: string }> = {
  '1': { title: 'Surface Brushing', image: '/missions/mission1_1.webp' },
  '2': { title: 'Map Reveal', image: '/missions/mission2_1.webp' },
  '3': { title: 'Mineshaft Explorer', image: '/missions/mission3-4_1.webp' },
  '4': { title: 'Careful Recovery', image: '/missions/mission3-4_2.webp' },
  '5': { title: 'Who Lived Here?', image: '/missions/mission5_1.webp' },
  '6': { title: 'Forge', image: '/missions/mission6_1.webp' },
  '7': { title: 'Heavy Lifting', image: '/missions/mission7_1.webp' },
  '8': { title: 'Silo', image: '/missions/mission8_1.avif' },
  '9': { title: "What's on Sale?", image: '/missions/mission9_1.webp' },
  '10': { title: 'Tip the Scales', image: '/missions/mission10_1.webp' },
  '11': { title: 'Angler Artifacts', image: '/missions/mission11_1.webp' },
  '12': { title: 'Salvage Operation', image: '/missions/mission12_1.webp' },
  '13': { title: 'Statue Rebuild', image: '/missions/mission13_1.webp' },
  '14': { title: 'Forum', image: '/missions/mission14_1.webp' },
  '15': { title: 'Site Marking', image: '/missions/mission15_1.webp' }
};

const isYes = (v: any) => v === 'yes' || v === true;

function calculateMissionDetails(m: any): MissionInfo[] {
  if (!m) return [];
  const details: MissionInfo[] = [];
  const getInfo = (id: string) => MISSION_DATA[id];

  // M01
  const m01_pts = (Math.min(parseInt(m.m01_soil) || 0, 5) * 10) + (isYes(m.m01_brush) ? 10 : 0);
  details.push({ id: '1', ...getInfo('1'), points: m01_pts, isCompleted: m01_pts > 0 });
  // M02
  const m02_pts = Math.min(parseInt(m.m02_sections) || 0, 3) * 10;
  details.push({ id: '2', ...getInfo('2'), points: m02_pts, isCompleted: m02_pts > 0 });
  // M03
  const m03_pts = (isYes(m.m03_minecart) ? 30 : 0) + (isYes(m.m03_bonus) ? 10 : 0);
  details.push({ id: '3', ...getInfo('3'), points: m03_pts, isCompleted: m03_pts > 0 });
  // M04
  const m04_pts = (isYes(m.m04_artifact) ? 30 : 0) + (isYes(m.m04_support) ? 10 : 0);
  details.push({ id: '4', ...getInfo('4'), points: m04_pts, isCompleted: m04_pts > 0 });
  // M05
  const m05_pts = isYes(m.m05_floor) ? 30 : 0;
  details.push({ id: '5', ...getInfo('5'), points: m05_pts, isCompleted: m05_pts > 0 });
  // M06
  const m06_pts = Math.min(parseInt(m.m06_ore) || 0, 2) * 10;
  details.push({ id: '6', ...getInfo('6'), points: m06_pts, isCompleted: m06_pts > 0 });
  // M07
  const m07_pts = isYes(m.m07_millstone) ? 30 : 0;
  details.push({ id: '7', ...getInfo('7'), points: m07_pts, isCompleted: m07_pts > 0 });
  // M08
  const m08_pts = Math.min(parseInt(m.m08_preserved) || 0, 4) * 10;
  details.push({ id: '8', ...getInfo('8'), points: m08_pts, isCompleted: m08_pts > 0 });
  // M09
  const m09_pts = (isYes(m.m09_roof) ? 20 : 0) + (isYes(m.m09_wares) ? 10 : 0);
  details.push({ id: '9', ...getInfo('9'), points: m09_pts, isCompleted: m09_pts > 0 });
  // M10
  const m10_pts = (isYes(m.m10_tipped) ? 20 : 0) + (isYes(m.m10_pan) ? 10 : 0);
  details.push({ id: '10', ...getInfo('10'), points: m10_pts, isCompleted: m10_pts > 0 });
  // M11
  const m11_pts = (isYes(m.m11_raised) ? 20 : 0) + (isYes(m.m11_flag) ? 10 : 0);
  details.push({ id: '11', ...getInfo('11'), points: m11_pts, isCompleted: m11_pts > 0 });
  // M12
  const m12_pts = (isYes(m.m12_sand) ? 20 : 0) + (isYes(m.m12_ship) ? 10 : 0);
  details.push({ id: '12', ...getInfo('12'), points: m12_pts, isCompleted: m12_pts > 0 });
  // M13
  const m13_pts = isYes(m.m13_statue) ? 30 : 0;
  details.push({ id: '13', ...getInfo('13'), points: m13_pts, isCompleted: m13_pts > 0 });
  // M14
  const m14_pts = Math.min(parseInt(m.m14_artifacts) || 0, 8) * 5;
  details.push({ id: '14', ...getInfo('14'), points: m14_pts, isCompleted: m14_pts > 0 });
  // M15
  const tokens = Math.max(0, Math.min(parseInt(m.precision_tokens) || 0, 6));
  const precisionTable: Record<number, number> = { 6: 50, 5: 50, 4: 35, 3: 25, 2: 15, 1: 10, 0: 0 };
  const m15_pts = precisionTable[tokens] || 0;
  details.push({ id: '15', ...getInfo('15'), points: m15_pts, isCompleted: tokens > 0 });

  return details;
}

export default function MissionScoreBreakdown({ match }: MissionScoreBreakdownProps) {
  if (!match) return null;

  const missionsA = { ...match.missionsA1, ...match.missionsA2 };
  const missionsB = { ...match.missionsB1, ...match.missionsB2 };

  const detailsA = calculateMissionDetails(missionsA);
  const detailsB = calculateMissionDetails(missionsB);

  return (
    <div className="w-full h-full flex gap-8 p-6 overflow-hidden relative">
      
      <AllianceColumn 
        missions={detailsA} 
        color="red"
      />
      
      <div className="w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

      <AllianceColumn 
        missions={detailsB} 
        color="blue"
      />
    </div>
  );
}

function AllianceColumn({ missions, color }: { 
  missions: MissionInfo[], 
  color: 'blue' | 'red',
}) {
  const isBlue = color === 'blue';
  const completedCount = missions.filter(m => m.isCompleted).length;
  const progress = (completedCount / missions.length) * 100;
  
  return (
    <div className="flex-1 flex flex-col relative">
      {/* HUD Header */}
      <div className="mb-6 relative">

        {/* Progress HUD Bar */}
        <div className="h-1.5 w-full bg-slate-900/50 rounded-full overflow-hidden border border-white/5 relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full absolute left-0 top-0 ${isBlue ? 'bg-blue-500' : 'bg-red-500'}`}
            style={{ boxShadow: `0 0 20px ${isBlue ? 'rgba(59,130,246,0.5)' : 'rgba(239,68,68,0.5)'}` }}
          />
        </div>
      </div>
      
      {/* Enhanced Missions Grid */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-2 gap-3 content-start">
        <AnimatePresence mode="popLayout">
          {missions.map((m, idx) => (
            <motion.div 
              key={m.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, type: 'spring', damping: 15 }}
              className={`group relative flex flex-col p-4 rounded-[24px] border transition-all duration-500 overflow-hidden ${
                m.isCompleted 
                  ? isBlue 
                    ? 'bg-blue-500/10 border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]' 
                    : 'bg-red-500/10 border-red-500/30 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]'
                  : 'bg-slate-900/40 border-slate-800/50 grayscale opacity-30 hover:opacity-50'
              }`}
            >
              {/* Background Glow for completed missions */}
              {m.isCompleted && (
                <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-[40px] pointer-events-none ${isBlue ? 'bg-blue-600/20' : 'bg-red-600/20'}`} />
              )}

              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="relative shrink-0 w-12 h-12 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-slate-950">
                  <img src={m.image} alt={m.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  {!m.isCompleted && <div className="absolute inset-0 bg-slate-950/60" />}
                </div>
                
                <div className="min-w-0">
                   <div className="text-[10px] font-black uppercase tracking-tight text-white leading-tight truncate">
                     {m.title}
                   </div>
                   <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                     Mission {m.id.padStart(2, '0')}
                   </div>
                </div>
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-1.5">
                  {m.isCompleted ? (
                     <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${isBlue ? 'bg-blue-500/30 text-blue-400' : 'bg-red-500/30 text-red-400'}`}>
                       <Zap size={6} /> Done
                     </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest bg-slate-800 text-slate-600">
                      <TrendingUp size={6} /> Ready
                    </div>
                  )}
                </div>
                
                {m.isCompleted ? (
                  <div className={`text-lg font-black font-mono leading-none ${isBlue ? 'text-blue-400' : 'text-red-400'}`}>
                    +{m.points}
                  </div>
                ) : (
                  <div className="text-[10px] font-black font-mono text-slate-700">---</div>
                )}
              </div>

              {/* Status Indicator Bar at bottom of card */}
              <div className={`absolute bottom-0 left-0 h-0.5 transition-all duration-700 ${
                m.isCompleted 
                  ? isBlue ? 'bg-blue-500 w-full' : 'bg-red-500 w-full'
                  : 'bg-slate-800 w-0'
              }`} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
