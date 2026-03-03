'use client';

import { useEffect, useState } from 'react';

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
        if (match.teamA) {
          scoresMap[match.teamA] =
            (scoresMap[match.teamA] || 0) + (match.scoreA || 0);
        }

        if (match.teamB) {
          scoresMap[match.teamB] =
            (scoresMap[match.teamB] || 0) + (match.scoreB || 0);
        }
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

  if (loading) return <p>Cargando scores...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Ranking General</h2>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Posición</th>
            <th className="p-2">Equipo</th>
            <th className="p-2">Puntos Totales</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((team, index) => (
            <tr key={team.team} className="border-t">
              <td className="p-2">{index + 1}</td>
              <td className="p-2">{team.team}</td>
              <td className="p-2">{team.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}