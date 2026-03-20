'use client';

import React, { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';
import type { FLLMissionsFlat, MissionKey } from '@/lib/fllMissionMapping';
import { missionBounds, missionValueFromMissionsFlat, missionValueToPatch } from '@/lib/fllMissionMapping';

type Props = {
  mission: MissionKey;
  title: string;
  subtitle: string;
  images: string[];
  valueLabel?: string;
};

const getActiveMatchId = (): string | null => {
  try {
    return localStorage.getItem('activeMatchId');
  } catch {
    return null;
  }
};

const pickActiveMatch = (matches: any[]): any | null => {
  const list = Array.isArray(matches) ? matches : [];
  return (
    list.find((m) => m?.status === 'in_progress') ||
    list.find((m) => m?.status === 'pending') ||
    list[0] ||
    null
  );
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
  const label = valueLabel ?? 'Area Score';

  const [matchId, setMatchId] = useState<string | null>(null);
  const [valueA, setValueA] = useState(0);
  const [valueB, setValueB] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!matchId) return;
    setLoading(true);
    try {
      const match = await safeFetchJson<any>(`/api/matches/${matchId}`);
      const missionsA: FLLMissionsFlat | undefined = match.missionsA;
      const missionsB: FLLMissionsFlat | undefined = match.missionsB;
      setValueA(missionValueFromMissionsFlat(mission, missionsA));
      setValueB(missionValueFromMissionsFlat(mission, missionsB));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const resolveMatchId = async () => {
      const stored = getActiveMatchId();
      if (stored) {
        if (!cancelled) setMatchId(stored);
        return;
      }

      try {
        const matches = await safeFetchJson<any[]>('/api/matches');
        const active = pickActiveMatch(matches || []);
        const resolvedId = active?.id ?? null;
        if (resolvedId) {
          try {
            localStorage.setItem('activeMatchId', resolvedId);
          } catch {
            // ignore
          }
        }
        if (!cancelled) setMatchId(resolvedId);
      } catch {
        // ignore; UI quedará deshabilitada
      }
    };

    resolveMatchId();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!matchId) return;

    load();

    const handler = () => {
      // Mantener UI sincronizada si otro dispositivo cambia scores.
      load();
    };

    socket.on('matchesUpdate', handler);
    return () => {
      socket.off('matchesUpdate', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, mission]);

  const commit = async (nextA: number, nextB: number) => {
    if (!matchId) return;
    const patchA = missionValueToPatch(mission, nextA);
    const patchB = missionValueToPatch(mission, nextB);

    await safeFetchJson<any>(`/api/matches/${matchId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        missionsA: patchA,
        missionsB: patchB,
      }),
    });
  };

  const setClamped = (current: number, delta: number) => {
    const next = current + delta;
    return Math.max(bounds.min, Math.min(bounds.max, next));
  };

  const canEdit = Boolean(matchId);

  const minusBtnClassA = canEdit
    ? 'w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-lg disabled:opacity-50'
    : 'w-10 h-10 rounded-lg bg-slate-100 font-black text-lg opacity-50 cursor-not-allowed';
  const plusBtnClassA = canEdit
    ? 'w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-lg disabled:opacity-50'
    : 'w-10 h-10 rounded-lg bg-blue-600 font-black text-lg opacity-50 cursor-not-allowed';

  const onClickA = async (delta: number) => {
    const nextA = setClamped(valueA, delta);
    setValueA(nextA);
    try {
      await commit(nextA, valueB);
    } catch {
      // Si falla el request, recargar para recuperar estado.
      load();
    }
  };

  const onClickB = async (delta: number) => {
    const nextB = setClamped(valueB, delta);
    setValueB(nextB);
    try {
      await commit(valueA, nextB);
    } catch {
      load();
    }
  };

  const imageGridCols =
    images.length <= 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-2';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight">{title}</h1>
        <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">{subtitle}</p>
      </div>

      <section className={`grid ${imageGridCols} gap-4`}>
        {images.map((src, idx) => (
          <div key={`${src}-${idx}`} className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <img src={src} alt={subtitle} className="w-full h-auto" />
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <span className="font-bold text-slate-700">{`Area 1 ${label}`}</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onClickA(-1)}
              disabled={!canEdit || valueA <= bounds.min}
              className={minusBtnClassA}
            >
              -
            </button>
            <span className="text-xl font-black text-blue-700 tabular-nums">{loading ? '...' : valueA}</span>
            <button
              type="button"
              onClick={() => onClickA(1)}
              disabled={!canEdit || valueA >= bounds.max}
              className={plusBtnClassA}
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <span className="font-bold text-slate-700">{`Area 2 ${label}`}</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onClickB(-1)}
              disabled={!canEdit || valueB <= bounds.min}
              className={minusBtnClassA}
            >
              -
            </button>
            <span className="text-xl font-black text-blue-700 tabular-nums">{loading ? '...' : valueB}</span>
            <button
              type="button"
              onClick={() => onClickB(1)}
              disabled={!canEdit || valueB >= bounds.max}
              className={plusBtnClassA}
            >
              +
            </button>
          </div>
        </div>

        {!canEdit && (
          <p className="text-xs text-red-600 font-semibold">
            Abre la pantalla de juego para seleccionar el match activo.
          </p>
        )}
      </section>
    </div>
  );
}

