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
    if (!matchId) return;
    loadInspection();

    const handler = () => loadInspection();
    socket.on('matchesUpdate', handler);
    return () => {
      socket.off('matchesUpdate', handler);
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

      <section className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <span className="font-bold text-slate-700">Area 1 Inspection</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={async () => {
                setInspectionA(false);
                try {
                  await commitInspection(false, inspectionB);
                } catch {
                  loadInspection();
                }
              }}
              disabled={!canEdit}
              className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-lg disabled:opacity-50"
            >
              -
            </button>
            <span className="text-xl font-black text-blue-700 tabular-nums">
              {loadingInspection ? '...' : inspectionA ? 1 : 0}
            </span>
            <button
              type="button"
              onClick={async () => {
                setInspectionA(true);
                try {
                  await commitInspection(true, inspectionB);
                } catch {
                  loadInspection();
                }
              }}
              disabled={!canEdit}
              className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-lg disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <span className="font-bold text-slate-700">Area 2 Inspection</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={async () => {
                setInspectionB(false);
                try {
                  await commitInspection(inspectionA, false);
                } catch {
                  loadInspection();
                }
              }}
              disabled={!canEdit}
              className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-lg disabled:opacity-50"
            >
              -
            </button>
            <span className="text-xl font-black text-blue-700 tabular-nums">
              {loadingInspection ? '...' : inspectionB ? 1 : 0}
            </span>
            <button
              type="button"
              onClick={async () => {
                setInspectionB(true);
                try {
                  await commitInspection(inspectionA, true);
                } catch {
                  loadInspection();
                }
              }}
              disabled={!canEdit}
              className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-lg disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}