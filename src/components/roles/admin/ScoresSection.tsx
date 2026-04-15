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
        <div className="absolute inset-0 border-4 border-[#006847]/10 rounded-full" />
        <div className="absolute inset-0 border-4 border-[#006847] border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">Procesando Rankings</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
            Tabla de <span className="text-[#006847]">Posi</span>cio<span className="text-[#CE1126]">nes</span>
          </h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#006847] rounded-full animate-pulse" />
            Resultados en vivo del torneo
          </p>
        </div>
        <button 
          onClick={fetchScores}
          className="p-4 bg-white hover:bg-gray-50 text-[#006847] rounded-2xl border border-gray-100 transition-all active:scale-90 shadow-sm"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {ranking.length > 0 ? (
          ranking.map((team, index) => {
            const isFirst = index === 0;
            const isTop3 = index < 3;
            
            return (
              <div
                key={team.team}
                className={`group grid grid-cols-12 items-center px-8 py-7 rounded-[40px] border transition-all duration-500 hover:scale-[1.02] shadow-xl shadow-gray-200/40 relative overflow-hidden ${
                  isFirst 
                    ? 'bg-gray-900 border-gray-900 text-white' 
                    : 'bg-white border-white text-gray-800'
                }`}
              >
                {/* Decoración Bandera para el primero */}
                {isFirst && (
                  <div className="absolute top-0 left-0 w-full h-1 flex">
                    <div className="h-full flex-1 bg-[#006847]"></div>
                    <div className="h-full flex-1 bg-white"></div>
                    <div className="h-full flex-1 bg-[#CE1126]"></div>
                  </div>
                )}

                {/* Posición */}
                <div className="col-span-1 flex items-center gap-4">
                  <span className={`font-black text-3xl tabular-nums italic ${isFirst ? 'text-white' : 'text-gray-200 group-hover:text-[#006847] transition-colors'}`}>
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Info Equipo */}
                <div className="col-span-7 flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm shadow-xl transition-transform group-hover:rotate-12 border ${
                    isFirst ? 'bg-white text-gray-900 border-gray-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                  }`}>
                    {team.team.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className={`font-black uppercase tracking-tight text-xl italic ${isFirst ? 'text-white' : 'text-gray-900'}`}>
                      {team.team}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isFirst ? 'text-gray-400' : 'text-gray-400'}`}>
                        {team.matchesPlayed} Partidos Jugados
                      </span>
                      {isTop3 && (
                        <div className={`w-1.5 h-1.5 rounded-full ${index === 0 ? 'bg-[#006847]' : index === 1 ? 'bg-gray-300' : 'bg-[#CE1126]'}`} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Puntos */}
                <div className="col-span-4 text-right flex flex-col items-end">
                  <div className={`font-mono font-black text-4xl tabular-nums tracking-tighter ${isFirst ? 'text-white' : 'text-[#006847]'}`}>
                    {team.total.toLocaleString()}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isFirst ? 'text-gray-500' : 'text-gray-400'}`}>
                    Puntos Acumulados
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-32 bg-white rounded-[60px] border-4 border-dashed border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-gray-100 shadow-sm">
              <Users className="w-12 h-12 text-gray-200" />
            </div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-sm italic">No hay datos de partidos disponibles aún</p>
          </div>
        )}
      </div>
    </div>
  );
}
