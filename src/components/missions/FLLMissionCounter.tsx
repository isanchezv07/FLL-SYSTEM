'use client';

import React, { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import type { MissionKey } from '@/lib/fllMissionMapping';
import { missionBounds, missionValueFromMissionsFlat, missionValueToPatch } from '@/lib/fllMissionMapping';
import MatchTimer from '@/components/game/MatchTimer';
import { ArrowLeft, Zap, RotateCcw, Trophy } from 'lucide-react';

type Props = {
  mission: MissionKey;
  title: string;
  subtitle: string;
  images: string[];
  valueLabel?: string;
};

const getActiveMatchId = (): string | null => {
  try { return localStorage.getItem('activeMatchId'); } catch { return null; }
};

const getActiveTeam = (): string | null => {
  try { return localStorage.getItem('activeTeam'); } catch { return null; }
};

const safeFetchJson = async <T,>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
};

export default function FLLMissionCounter({ mission, title, subtitle, images, valueLabel }: Props) {
  const bounds = missionBounds[mission];
  const label = valueLabel ?? 'Pts';

  const [matchId, setMatchId] = useState<string | null>(null);
  const [activeTeam, setActiveTeam] = useState<string | null>(null);
  const [match, setMatch] = useState<any | null>(null);
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const mId = getActiveMatchId();
    const tId = getActiveTeam();
    if (!mId || !tId) return;
    setLoading(true);
    try {
      const data = await safeFetchJson<any>(`/api/matches/${mId}`);
      setMatch(data);
      const teamMissions = data[`missions${tId}`];
      setValue(missionValueFromMissionsFlat(mission, teamMissions));
    } finally { setLoading(false); }
  };

  useEffect(() => {
    setMatchId(getActiveMatchId());
    setActiveTeam(getActiveTeam());
  }, []);

  useEffect(() => {
    if (!matchId) return;
    load();
    const handler = () => load();
    socket.on('matchesUpdate', handler);
    return () => { socket.off('matchesUpdate', handler); };
  }, [matchId, mission]);

  const commit = async (nextVal: number) => {
    if (!matchId || !activeTeam) return;
    const patch = missionValueToPatch(mission, nextVal);
    const key = `missions${activeTeam}`;
    await safeFetchJson<any>(`/api/matches/${matchId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: patch }),
    });
  };

  const onUpdate = async (delta: number) => {
    const next = Math.max(bounds.min, Math.min(bounds.max, value + delta));
    setValue(next);
    try { await commit(next); } catch { load(); }
  };

  const onSetMax = async () => {
    setValue(bounds.max);
    try { await commit(bounds.max); } catch { load(); }
  };

  const onSetMin = async () => {
    setValue(bounds.min);
    try { await commit(bounds.min); } catch { load(); }
  };

  const isAtMax = value === bounds.max && bounds.max > 0;
  const teamName = match && activeTeam ? match[`team${activeTeam}`] : `Equipo ${activeTeam}`;

  if (!matchId || !activeTeam) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617]">
        <div className="bg-red-500/10 border-2 border-red-500/20 p-12 rounded-[48px] text-center max-w-sm backdrop-blur-xl">
          <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/30">
            <Zap className="text-red-500 w-10 h-10" />
          </div>
          <p className="text-red-400 font-black uppercase tracking-[0.3em] text-sm mb-8">Session Expired</p>
          <a href="/roles/referee/ref" className="block bg-red-600 hover:bg-red-500 text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-95">
            Reconfigure
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Navigation & Timer Header */}
        <div className="flex items-center justify-between">
          <a href="/roles/referee/ref" className="group flex items-center gap-3 bg-slate-900/50 hover:bg-slate-800 px-5 py-3 rounded-2xl border border-slate-800 transition-all active:scale-95">
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-white" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Back to Map</span>
          </a>
          <MatchTimer />
        </div>

        {/* Mission Info Card */}
        <div className="bg-slate-900/40 rounded-[40px] border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="p-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600" />
          <div className="p-8 space-y-6 text-center">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Mission Control #{match?.position || '—'}</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{title}</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">{subtitle}</p>
          </div>

          <div className="px-4 pb-4 grid grid-cols-2 gap-3">
            {images.map((src, idx) => (
              <div key={`${src}-${idx}`} className="bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-800 aspect-square flex items-center justify-center">
                <img src={src} alt="Ref" className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-700" />
              </div>
            ))}
          </div>
        </div>

        {/* Scoring Console */}
        <div className="bg-slate-900/80 rounded-[48px] border border-slate-800 p-8 md:p-10 shadow-2xl space-y-10">
          <div className="text-center space-y-2">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Active Alliance Table</div>
            <div className="inline-flex items-center gap-3 bg-slate-950 px-6 py-2 rounded-2xl border border-slate-800">
              <span className="text-blue-400 font-black text-lg">{activeTeam}</span>
              <div className="w-px h-4 bg-slate-800" />
              <span className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[180px]">{teamName || '—'}</span>
            </div>
          </div>

          <div className="flex items-center justify-around">
            <button
              onClick={() => onUpdate(-1)}
              disabled={loading || value <= bounds.min}
              className="w-24 h-24 rounded-3xl bg-slate-800 hover:bg-slate-700 active:scale-90 text-white font-light text-6xl shadow-xl border-b-8 border-slate-950 transition-all disabled:opacity-10"
            >
              -
            </button>
            
            <div className="flex flex-col items-center">
              <div className={`text-9xl font-black tabular-nums leading-none transition-all duration-500 ${isAtMax ? 'text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.6)] scale-110' : 'text-blue-500'}`}>
                {loading ? '...' : value}
              </div>
              <div className={`text-[10px] font-black uppercase tracking-[0.4em] mt-4 ${isAtMax ? 'text-emerald-500' : 'text-slate-600'}`}>{label}</div>
            </div>

            <button
              onClick={() => onUpdate(1)}
              disabled={loading || value >= bounds.max}
              className="w-24 h-24 rounded-3xl bg-blue-600 hover:bg-blue-500 active:scale-90 text-white font-light text-6xl shadow-xl border-b-8 border-blue-800 transition-all disabled:opacity-10"
            >
              +
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onSetMin}
              className="group flex items-center justify-center gap-3 bg-slate-950/50 hover:bg-slate-950 py-5 rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] text-slate-500 hover:text-white border border-slate-800 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-slate-700 group-hover:text-red-500" />
              Reset Score
            </button>
            <button
              onClick={onSetMax}
              className={`group flex items-center justify-center gap-3 py-5 rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95 border ${
                isAtMax 
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
            >
              <Trophy className={`w-4 h-4 ${isAtMax ? 'text-white animate-bounce' : 'text-emerald-500'}`} />
              Complete Max
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
