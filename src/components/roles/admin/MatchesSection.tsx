'use client';

import { useEffect, useState } from 'react';

interface Match {
  id: string;
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
  status?: string;
}

export default function MatchesSection() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Cargando matches...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Matches</h2>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Team A</th>
            <th className="p-2">Team B</th>
            <th className="p-2">Score</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {matches.map(match => (
            <tr key={match.id} className="border-t">
              <td className="p-2">{match.teamA}</td>
              <td className="p-2">{match.teamB}</td>
              <td className="p-2">
                {match.scoreA ?? 0} - {match.scoreB ?? 0}
              </td>
              <td className="p-2">{match.status ?? 'pending'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}