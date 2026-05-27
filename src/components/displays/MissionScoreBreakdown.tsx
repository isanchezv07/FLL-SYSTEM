'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Target, Zap, TrendingUp } from 'lucide-react';

interface MissionInfo {
  id: string;
  title: string;
  points: number;
  isCompleted: boolean;
  isStarted: boolean;
}

interface MissionScoreBreakdownProps {
  match: any;
}

const isYes = (v: any) => v === 'yes' || v === true;
const hasValue = (v: any) => v !== undefined && v !== '' && v !== null;

function calculateMissionDetails(m: any): MissionInfo[] {
  if (!m) return [];
  const details: MissionInfo[] = [];

  // Helper to add mission with completion check
  const addMission = (id: string, title: string, pts: number, max: number, started: boolean) => {
    details.push({ id, title, points: pts, isCompleted: pts >= max, isStarted: started });
  };

  // M01: Max = 5*10 + 10 = 60
  const m01_pts = (Math.min(parseInt(m.m01_soil) || 0, 5) * 10) + (isYes(m.m01_brush) ? 10 : 0);
  addMission('1', 'Surface Brushing', m01_pts, 60, hasValue(m.m01_soil) || hasValue(m.m01_brush));

  // M02: Max = 3 * 10 = 30
  const m02_pts = Math.min(parseInt(m.m02_sections) || 0, 3) * 10;
  addMission('2', 'Map Reveal', m02_pts, 30, hasValue(m.m02_sections));

  // M03: Max = 30 + 10 = 40
  const m03_pts = (isYes(m.m03_minecart) ? 30 : 0) + (isYes(m.m03_bonus) ? 10 : 0);
  addMission('3', 'Mineshaft Explorer', m03_pts, 40, hasValue(m.m03_minecart) || hasValue(m.m03_bonus));

  // M04: Max = 30 + 10 = 40
  const m04_pts = (isYes(m.m04_artifact) ? 30 : 0) + (isYes(m.m04_support) ? 10 : 0);
  addMission('4', 'Careful Recovery', m04_pts, 40, hasValue(m.m04_artifact) || hasValue(m.m04_support));

  // M05: Max = 30
  const m05_pts = isYes(m.m05_floor) ? 30 : 0;
  addMission('5', 'Who Lived Here?', m05_pts, 30, hasValue(m.m05_floor));

  // M06: Max = 2 * 10 = 20
  const m06_pts = Math.min(parseInt(m.m06_ore) || 0, 2) * 10;
  addMission('6', 'Forge', m06_pts, 20, hasValue(m.m06_ore));

  // M07: Max = 30
  const m07_pts = isYes(m.m07_millstone) ? 30 : 0;
  addMission('7', 'Heavy Lifting', m07_pts, 30, hasValue(m.m07_millstone));

  // M08: Max = 4 * 10 = 40
  const m08_pts = Math.min(parseInt(m.m08_preserved) || 0, 4) * 10;
  addMission('8', 'Silo', m08_pts, 40, hasValue(m.m08_preserved));

  // M09: Max = 20 + 10 = 30
  const m09_pts = (isYes(m.m09_roof) ? 20 : 0) + (isYes(m.m09_wares) ? 10 : 0);
  addMission('9', "What's on Sale?", m09_pts, 30, hasValue(m.m09_roof) || hasValue(m.m09_wares));

  // M10: Max = 20 + 10 = 30
  const m10_pts = (isYes(m.m10_tipped) ? 20 : 0) + (isYes(m.m10_pan) ? 10 : 0);
  addMission('10', 'Tip the Scales', m10_pts, 30, hasValue(m.m10_tipped) || hasValue(m.m10_pan));

  // M11: Max = 20 + 10 = 30
  const m11_pts = (isYes(m.m11_raised) ? 20 : 0) + (isYes(m.m11_flag) ? 10 : 0);
  addMission('11', 'Angler Artifacts', m11_pts, 30, hasValue(m.m11_raised) || hasValue(m.m11_flag));

  // M12: Max = 20 + 10 = 30
  const m12_pts = (isYes(m.m12_sand) ? 20 : 0) + (isYes(m.m12_ship) ? 10 : 0);
  addMission('12', 'Salvage Operation', m12_pts, 30, hasValue(m.m12_sand) || hasValue(m.m12_ship));

  // M13: Max = 30
  const m13_pts = isYes(m.m13_statue) ? 30 : 0;
  addMission('13', 'Statue Rebuild', m13_pts, 30, hasValue(m.m13_statue));

  // M14: Max = 8 * 5 = 40
  const m14_pts = Math.min(parseInt(m.m14_artifacts) || 0, 8) * 5;
  addMission('14', 'Forum', m14_pts, 40, hasValue(m.m14_artifacts));

  // M15 (Precision Tokens): Max = 50
  const tokens = Math.max(0, Math.min(parseInt(m.precision_tokens) || 0, 6));
  const precisionTable: Record<number, number> = { 6: 50, 5: 50, 4: 35, 3: 25, 2: 15, 1: 10, 0: 0 };
  const m15_pts = precisionTable[tokens] || 0;
  addMission('15', 'Site Marking', m15_pts, 50, hasValue(m.precision_tokens));

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap');
        .mission-grid { font-family: 'Roboto', sans-serif; }
      `}</style>
      
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
  const visibleMissions = missions.filter(m => m.isStarted);
  const completedCount = missions.filter(m => m.isCompleted).length;
  const progress = (completedCount / missions.length) * 100;
  
  return (
    <div className="flex-1 flex flex-col relative mission-grid p-4">
      {/* HUD Header */}
      <div className="mb-8 relative px-2">
        <div className="flex justify-between items-end mb-2">
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Alliance Progress</span>
           <span className={`text-sm font-black font-mono ${color === 'blue' ? 'text-blue-600' : 'text-red-600'}`}>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden relative shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full absolute left-0 top-0 ${color === 'blue' ? 'bg-blue-500' : 'bg-red-500'}`}
            style={{ boxShadow: `0 0 15px ${color === 'blue' ? 'rgba(59,130,246,0.3)' : 'rgba(239,68,68,0.3)'}` }}
          />
        </div>
      </div>
      
      {/* Dynamic Missions Grid */}
      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar grid grid-cols-3 gap-6 content-start pb-10">
        <AnimatePresence mode="popLayout">
          {visibleMissions.map((m) => (
            <motion.div 
              key={m.id}
              layout
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className={`relative flex flex-col items-center justify-between p-6 rounded-[40px] border transition-all duration-500 ${
                m.isCompleted 
                  ? 'bg-white border-emerald-200 shadow-[0_20px_40px_rgba(16,185,129,0.1)]' 
                  : 'bg-white border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)]'
              }`}
            >
              {/* Mission ID Badge */}
              <div className={`absolute -top-3 -left-3 w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shadow-lg border-2 ${
                m.isCompleted 
                  ? 'bg-emerald-500 border-emerald-400 text-white' 
                  : 'bg-slate-800 border-slate-700 text-white'
              }`}>
                {m.id.padStart(2, '0')}
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center mt-2">
                <div className={`text-[11px] font-black uppercase tracking-wider leading-tight mb-2 ${m.isCompleted ? 'text-slate-800' : 'text-slate-500'}`}>
                  {m.title}
                </div>
                
                <div className={`text-3xl font-black font-mono tracking-tighter ${m.isCompleted ? 'text-emerald-500' : 'text-slate-300'}`}>
                  {m.isCompleted ? `+${m.points}` : `+${m.points}`}
                </div>
              </div>

              {/* Bottom Status Tag */}
              <div className={`mt-4 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${
                m.isCompleted 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                  : 'bg-slate-50 border-slate-100 text-slate-400'
              }`}>
                {m.isCompleted ? 'Perfect' : 'In Progress'}
              </div>

              {/* Decorative Completed Check */}
              {m.isCompleted && (
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                >
                  <CheckCircle2 size={12} strokeWidth={4} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {visibleMissions.length === 0 && (
          <div className="col-span-3 mt-10 flex flex-col items-center justify-center p-12 border-4 border-dashed border-slate-100 rounded-[60px] bg-slate-50/50">
             <div className="w-20 h-20 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center mb-6">
                <Zap className="text-slate-200" size={32} />
             </div>
             <h3 className="text-slate-300 font-black text-xl uppercase tracking-[0.3em]">Wait for Action</h3>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 opacity-50">Referee is preparing the score</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}
