 'use client';

import React, { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import FLLMissionCounter from './FLLMissionCounter';

const getActiveMatchId = (): string | null => {
  try {
    return localStorage.getItem('activeMatchId');
  } catch {
    return null;
  }
};

const isYes = (v: unknown): boolean => v === 'yes' || v === true;

const safeFetchJson = async <T,>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
};

export default function Mission1() {
  const [matchId, setMatchId] = useState<string | null>(null);
  const [inspectionA, setInspectionA] = useState(false);
  const [inspectionB, setInspectionB] = useState(false);
  const [loadingInspection, setLoadingInspection] = useState(true);

  const loadInspection = async () => {
    if (!matchId) return;
    setLoadingInspection(true);
    try {
      const match = await safeFetchJson<any>(`/api/matches/${matchId}`);
      setInspectionA(isYes(match?.missionsA?.inspection));
      setInspectionB(isYes(match?.missionsB?.inspection));
    } finally {
      setLoadingInspection(false);
    }
  };

  useEffect(() => {
    setMatchId(getActiveMatchId());
  }, []);

  useEffect(() => {
    const handler = () => { if (matchId) loadInspection(); };
    const resetHandler = () => {
      localStorage.removeItem('activeMatchId');
      setMatchId(null);
      setInspectionA(false);
      setInspectionB(false);
    };

    socket.on('matchesUpdate', handler);
    socket.on('tournamentReset', resetHandler);

    if (matchId) loadInspection();

    return () => {
      socket.off('matchesUpdate', handler);
      socket.off('tournamentReset', resetHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  const commitInspection = async (nextA: boolean, nextB: boolean) => {
    if (!matchId) return;
    await safeFetchJson<any>(`/api/matches/${matchId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        missionsA: { inspection: nextA ? 'yes' : false },
        missionsB: { inspection: nextB ? 'yes' : false },
      }),
    });
  };

  const canEdit = Boolean(matchId);

  return (
    <div className="space-y-6">
      <FLLMissionCounter
        mission="1"
        title="Misión 01"
        subtitle="Surface Brushing"
        images={['/missions/mission1_1.webp', '/missions/mission1_2.webp']}
        valueLabel="Soil/Brush (0..6)"
      />
    </div>
  );
}