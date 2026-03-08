'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, Users } from 'lucide-react'; // Opcional: instalando lucide-react

interface Match {
  id: string;
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
}

interface TeamScore {
  team: string;
  total: number;
}

export default function ScoresSection() {
  const [ranking, setRanking] = useState<TeamScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const res = await fetch('/api/matches');
      const matches: Match[] = await res.json();
      const scoresMap: Record<string, number> = {};

      matches.forEach(match => {
        if (match.teamA) scoresMap[match.teamA] = (scoresMap[match.teamA] || 0) + (match.scoreA || 0);
        if (match.teamB) scoresMap[match.teamB] = (scoresMap[match.teamB] || 0) + (match.scoreB || 0);
      });

      const rankingArray = Object.entries(scoresMap)
        .map(([team, total]) => ({ team, total }))
        .sort((a, b) => b.total - a.total);

      setRanking(rankingArray);
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-500 font-medium">Calculando posiciones...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Ranking General</h2>
          <p className="text-gray-500 text-sm">Temporada Actual • 2026</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-xl">
          <Trophy className="text-blue-600 w-6 h-6" />
        </div>
      </div>

      <div className="space-y-3">
        {/* Encabezado de Lista */}
        <div className="grid grid-cols-12 px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-1 text-center">Pos</div>
          <div className="col-span-8 ml-4">Equipo</div>
          <div className="col-span-3 text-right">Puntos Totales</div>
        </div>

        {ranking.length > 0 ? (
          ranking.map((team, index) => {
            const isTop3 = index < 3;
            const positionColors = [
              'bg-yellow-50 border-yellow-200 text-yellow-700', // Oro
              'bg-slate-50 border-slate-200 text-slate-700',   // Plata
              'bg-orange-50 border-orange-200 text-orange-700' // Bronce
            ];

            return (
              <div
                key={team.team}
                className={`grid grid-cols-12 items-center px-6 py-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] hover:shadow-md ${
                  isTop3 ? positionColors[index] : 'bg-white border-gray-100 text-gray-700'
                }`}
              >
                {/* Posición */}
                <div className="col-span-1 flex justify-center font-black text-lg">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </div>

                {/* Info Equipo */}
                <div className="col-span-8 flex items-center ml-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-inner mr-4 ${
                    isTop3 ? 'bg-white/50' : 'bg-gray-100'
                  }`}>
                    {team.team.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-bold truncate">{team.team}</span>
                </div>

                {/* Puntos */}
                <div className="col-span-3 text-right font-mono font-black text-xl">
                  {team.total.toLocaleString()}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aún no hay datos de partidos registrados.</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-50 text-center">
        <button 
          onClick={fetchScores}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          Actualizar Ranking
        </button>
      </div>
    </div>
  );
}