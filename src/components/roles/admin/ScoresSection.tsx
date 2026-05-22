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
        addScore(match.teamA1, match.scoreA / (match.teamA2 ? 2 : 1));
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
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Standings...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans text-slate-800 dark:text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight transition-colors">Event Rankings</h2>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Official Team Standings</p>
        </div>
        <button 
          onClick={fetchScores}
          className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-lg border border-slate-200 dark:border-slate-800 transition-all shadow-sm flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden transition-colors">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-[#0066B3] dark:bg-blue-900 text-white transition-colors">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Rank</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Team</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest">Team Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center">Played</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Total Score</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-right">Avg Score</th>
                </tr>
            </thead>
            <tbody className="divide-y border-slate-100 dark:divide-slate-800">
                {ranking.length > 0 ? (
                    ranking.map((team, index) => {
                        const isTop3 = index < 3;
                        const avg = team.matchesPlayed > 0 ? (team.total / team.matchesPlayed).toFixed(2) : "0.00";
                        
                        return (
                            <tr key={team.team} className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-950/30'}`}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`font-black text-lg italic ${isTop3 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-700'}`}>
                                            {index + 1}
                                        </span>
                                        {index === 0 && <Trophy className="w-4 h-4 text-amber-500 fill-current" />}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-black text-blue-700 dark:text-blue-400 tabular-nums">#{team.team}</td>
                                <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 uppercase text-xs truncate max-w-[200px]">Team {team.team}</td>
                                <td className="px-6 py-4 text-center font-bold text-slate-600 dark:text-slate-400 tabular-nums text-sm">{team.matchesPlayed}</td>
                                <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 dark:text-white text-lg tabular-nums">{team.total.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-mono font-bold text-xs border border-blue-100 dark:border-blue-900/50">
                                        {avg}
                                    </span>
                                </td>
                            </tr>
                        );
                    })
                ) : (
                    <tr>
                        <td colSpan={6} className="px-6 py-20 text-center">
                            <Users className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                            <p className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-[10px]">No Ranking Data Available</p>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}
