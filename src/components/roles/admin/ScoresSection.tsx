'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, Users, RefreshCw } from 'lucide-react';
import { socket } from '@/lib/socket';

interface Match {
  id: string;
  teamA1: string;
  teamA2: string;
  teamB1: string;
  teamB2: string;
  scoreA: number;
  scoreB: number;
  missionsA1?: any;
  missionsA2?: any;
  missionsB1?: any;
  missionsB2?: any;
}

interface TeamScore {
  team: string;
  total: number;
  matchesPlayed: number;
}

export default function ScoresSection() {
  const [ranking, setRanking] = useState<TeamScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores();
    socket.on('matchesUpdate', fetchScores);
    return () => { socket.off('matchesUpdate', fetchScores); };
  }, []);

  const fetchScores = async () => {
    try {
      const res = await fetch('/api/matches');
      const matches: Match[] = await res.json();
      const scoresMap: Record<string, { total: number, count: number }> = {};

      const addScore = (team: string, score: number) => {
        if (!team) return;
        if (!scoresMap[team]) scoresMap[team] = { total: 0, count: 0 };
        scoresMap[team].total += (score || 0);
        scoresMap[team].count += 1;
      };

      matches.forEach(match => {
        // En FLL, cada mesa tiene su puntaje individual (missionsA1, missionsA2...)
        // scoreA es la SUMA, pero el ranking suele ser por equipo individual.
        // Si no tenemos scores individuales guardados, usamos una aproximación o el total de la alianza.
        // Aquí asumiremos que queremos el ranking por equipo sumando lo que aportaron en sus alianzas.
        
        addScore(match.teamA1, match.scoreA / (match.teamA2 ? 2 : 1)); // Simplificación si no hay desglose
        addScore(match.teamA2, match.scoreA / 2);
        addScore(match.teamB1, match.scoreB / (match.teamB2 ? 2 : 1));
        addScore(match.teamB2, match.scoreB / 2);
      });

      const rankingArray = Object.entries(scoresMap)
        .map(([team, data]) => ({ team, total: Math.round(data.total), matchesPlayed: data.count }))
        .sort((a, b) => b.total - a.total);

      setRanking(rankingArray);
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Processing Rankings</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Leaderboard</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Live Tournament Standings</p>
        </div>
        <button 
          onClick={fetchScores}
          className="p-3 bg-slate-900 hover:bg-slate-800 text-blue-400 rounded-2xl border border-slate-800 transition-all active:scale-90"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {ranking.length > 0 ? (
          ranking.map((team, index) => {
            const isFirst = index === 0;
            const isTop3 = index < 3;
            
            return (
              <div
                key={team.team}
                className={`group grid grid-cols-12 items-center px-8 py-6 rounded-[32px] border-2 transition-all duration-300 hover:scale-[1.02] ${
                  isFirst 
                    ? 'bg-blue-600 border-blue-400 shadow-[0_20px_40px_rgba(37,99,235,0.2)] text-white' 
                    : isTop3 
                      ? 'bg-slate-900 border-slate-700 text-slate-200' 
                      : 'bg-slate-900/40 border-slate-800/50 text-slate-400'
                }`}
              >
                {/* Posición */}
                <div className="col-span-1 flex items-center gap-4">
                  <span className={`font-black text-2xl tabular-nums ${isFirst ? 'text-white' : 'text-slate-500'}`}>
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Info Equipo */}
                <div className="col-span-7 flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-xl transition-transform group-hover:rotate-12 ${
                    isFirst ? 'bg-white text-blue-600' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {team.team.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-black uppercase tracking-tight text-lg ${isFirst ? 'text-white' : 'text-slate-200'}`}>
                      {team.team}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isFirst ? 'text-blue-200' : 'text-slate-600'}`}>
                      {team.matchesPlayed} Matches Played
                    </span>
                  </div>
                </div>

                {/* Puntos */}
                <div className="col-span-4 text-right flex flex-col items-end">
                  <div className={`font-mono font-black text-3xl tabular-nums ${isFirst ? 'text-white' : 'text-blue-400'}`}>
                    {team.total.toLocaleString()}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isFirst ? 'text-blue-200' : 'text-slate-600'}`}>
                    Accumulated Points
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-32 bg-slate-900/20 rounded-[48px] border-4 border-dashed border-slate-800/50">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-800">
              <Users className="w-10 h-10 text-slate-700" />
            </div>
            <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No match data available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
