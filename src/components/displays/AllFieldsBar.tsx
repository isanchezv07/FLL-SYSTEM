'use client';

import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';

interface AllFieldsBarProps {
  timer: any;
  teams: any[];
  layoutPosition: 'top' | 'bottom';
  isCritical: boolean;
  onFieldClick: () => void;
}

export default function AllFieldsBar({
  timer,
  teams,
  layoutPosition,
  isCritical,
  onFieldClick,
}: AllFieldsBarProps) {
  const fieldCount = timer.fieldCount || 4;
  const fieldKeys = Array.from({ length: fieldCount }, (_, i) => `cancha${i + 1}`);
  const [fieldMatches, setFieldMatches] = useState<Record<string, any>>({});

  // Fetch every field's match whenever timer.fields changes
  useEffect(() => {
    const fields: Record<string, string | null> = timer.fields || {};
    const fetchers = fieldKeys.map(async (key) => {
      const matchId = fields[key];
      if (!matchId) return { key, match: null };
      try {
        const res = await fetch(`/api/matches/${matchId}`);
        if (res.ok) return { key, match: await res.json() };
      } catch {}
      return { key, match: null };
    });
    Promise.all(fetchers).then((results) => {
      const map: Record<string, any> = {};
      results.forEach(({ key, match }) => { map[key] = match; });
      setFieldMatches(map);
    });
  }, [timer.fields, fieldCount]);

  // Re-fetch on socket match updates
  useEffect(() => {
    const refetch = () => {
      const fields: Record<string, string | null> = timer.fields || {};
      const fetchers = fieldKeys.map(async (key) => {
        const matchId = fields[key];
        if (!matchId) return { key, match: null };
        try {
          const res = await fetch(`/api/matches/${matchId}`);
          if (res.ok) return { key, match: await res.json() };
        } catch {}
        return { key, match: null };
      });
      Promise.all(fetchers).then((results) => {
        const map: Record<string, any> = {};
        results.forEach(({ key, match }) => { map[key] = match; });
        setFieldMatches(map);
      });
    };
    socket.on('matchesUpdate', refetch);
    socket.on('matchUpdate', refetch);
    return () => { socket.off('matchesUpdate', refetch); socket.off('matchUpdate', refetch); };
  }, [timer.fields, fieldCount]);

  const getTeamLabel = (number: any) => {
    if (!number || number === 'TBD' || number === '—') return number || 'TBD';
    const team = teams.find((t: any) => t.number === number.toString());
    return team ? `${team.number} · ${team.name}` : `Team ${number}`;
  };

  const borderColor = isCritical ? 'rgba(220,38,38,0.7)' : 'rgba(102,180,178,0.35)';
  const bgColor     = isCritical ? 'rgba(80,10,10,0.93)'  : 'rgba(30,20,70,0.93)';

  return (
    <div
      className={`shrink-0 w-full flex flex-col`}
      style={{
        background: bgColor,
        backdropFilter: 'blur(16px)',
        borderBottom: layoutPosition === 'top'    ? `2px solid ${borderColor}` : undefined,
        borderTop:    layoutPosition === 'bottom' ? `2px solid ${borderColor}` : undefined,
        boxShadow: layoutPosition === 'top'
          ? '0 4px 32px rgba(0,0,0,0.5)'
          : '0 -4px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header row */}
      <div
        className="flex items-center justify-between px-6 py-2 cursor-pointer select-none"
        style={{ borderBottom: '1px solid rgba(106,134,174,0.2)' }}
        onClick={onFieldClick}
      >
        <div className="flex items-center gap-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#66B4B2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: '#66B4B2' }}>
            Todas las Canchas
          </span>
        </div>
      </div>

      {/* One row per field */}
      <div className={`grid gap-px`} style={{ gridTemplateColumns: `repeat(${fieldCount}, 1fr)`, background: 'rgba(106,134,174,0.15)' }}>
        {fieldKeys.map((key) => {
          const match = fieldMatches[key];
          const label = key.replace('cancha', 'C');
          const inProgress = match?.status === 'in_progress';
          const finished   = match?.status === 'finished';
          const winnerSide = finished
            ? (match.scoreA > match.scoreB ? 'A' : match.scoreB > match.scoreA ? 'B' : null)
            : null;

          return (
            <div
              key={key}
              className="flex flex-col px-4 py-3 relative"
              style={{
                background: inProgress ? 'rgba(102,180,178,0.08)' : 'rgba(30,20,70,0.0)',
                borderTop: inProgress ? '1px solid rgba(102,180,178,0.4)' : '1px solid transparent',
              }}
            >
              {/* Field label + status */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: inProgress ? '#66B4B2' : '#6A86AE' }}>
                  {label}
                </span>
                {inProgress && (
                  <span className="text-[8px] font-black uppercase tracking-widest animate-pulse" style={{ color: '#66B4B2' }}>● LIVE</span>
                )}
                {finished && (
                  <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: '#5AA057' }}>✓ FIN</span>
                )}
              </div>

              {match ? (
                <>
                  {/* Alliance A */}
                  <div className={`flex items-center justify-between gap-2 mb-1 rounded px-2 py-1 ${winnerSide === 'A' ? 'bg-green-900/30' : ''}`}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-1 h-4 rounded-full shrink-0 bg-blue-500" />
                      <span className="text-[10px] font-bold text-white/80 truncate leading-none">{getTeamLabel(match.teamA1)}</span>
                    </div>
                    <span className={`text-sm font-black font-mono shrink-0 ${winnerSide === 'A' ? 'text-[#66B4B2]' : 'text-[#6A86AE]'}`}>
                      {finished ? match.scoreA : '—'}
                    </span>
                  </div>
                  {/* Alliance B */}
                  <div className={`flex items-center justify-between gap-2 rounded px-2 py-1 ${winnerSide === 'B' ? 'bg-green-900/30' : ''}`}>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-1 h-4 rounded-full shrink-0 bg-red-500" />
                      <span className="text-[10px] font-bold text-white/80 truncate leading-none">{getTeamLabel(match.teamB1)}</span>
                    </div>
                    <span className={`text-sm font-black font-mono shrink-0 ${winnerSide === 'B' ? 'text-[#66B4B2]' : 'text-[#6A86AE]'}`}>
                      {finished ? match.scoreB : '—'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Sin partido</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
