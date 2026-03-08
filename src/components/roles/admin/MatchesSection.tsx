'use client';

import { useEffect, useState, useMemo } from 'react';

interface Match {
  id: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  round: number;
  position: number;
  status: 'pending' | 'in_progress' | 'finished';
  missions?: any;
  precision?: number;
}

export default function MatchesSection() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [bracketSize, setBracketSize] = useState(8);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const showNotify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      const data = await res.json();
      setMatches(data);
    } catch (e) {
      showNotify("Error al cargar partidos", "error");
    } finally {
      setLoading(false);
    }
  };

  const createBracket = async () => {
    try {
      const res = await fetch('/api/brackets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ size: bracketSize })
      });
      if (!res.ok) throw new Error();
      showNotify(`Bracket de ${bracketSize} equipos creado`);
      await fetchMatches();
    } catch {
      showNotify("Error creando bracket", "error");
    }
  };

  const handleUpdateLocal = (id: string, updates: Partial<Match>) => {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const saveMatch = async (id: string) => {
    // Buscar el match en tu estado
    const match = matches.find(m => m.id === id);
    if (!match) {
      showNotify("No se encontró el match", "error");
      return;
    }
  
    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: 'PUT', // Se mantiene PUT
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(match) // Envía todo el objeto
      });
  
      // Revisar respuesta del servidor
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "Error desconocido al guardar el match");
      }
  
      const updatedMatch = await res.json();
  
      // Actualizar el estado local con el match actualizado desde el servidor
      setMatches(prev => prev.map(m => m.id === id ? updatedMatch : m));
  
      showNotify("Partido actualizado correctamente");
    } catch (err: any) {
      console.error("Error al guardar match:", err);
      showNotify(`Error al guardar cambios: ${err.message}`, "error");
    }
  };

  // Agrupar matches por ronda de forma eficiente
  const rounds = useMemo(() => {
    const grouped: Record<number, Match[]> = {};
    matches.forEach(m => {
      if (!grouped[m.round]) grouped[m.round] = [];
      grouped[m.round].push(m);
    });
    return Object.keys(grouped).map(Number).sort((a, b) => a - b).map(r => ({
      number: r,
      matches: grouped[r].sort((a, b) => a.position - b.position)
    }));
  }, [matches]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {notification && (
        <div className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-lg shadow-xl text-white transition-all transform animate-bounce ${
          notification.type === 'error' ? 'bg-red-500' : 'bg-green-600'
        }`}>
          {notification.msg}
        </div>
      )}

      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Gestión de Brackets</h1>
          <p className="text-gray-500 text-sm">Organiza y actualiza los resultados del torneo</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border">
          <select
            value={bracketSize}
            onChange={(e) => setBracketSize(Number(e.target.value))}
            className="bg-transparent font-medium focus:outline-none px-2"
          >
            {[4, 8, 16, 32].map(n => <option key={n} value={n}>Top {n}</option>)}
          </select>
          <button
            onClick={createBracket}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Generar Nuevo
          </button>
        </div>
      </header>

      <div className="flex gap-12 overflow-x-auto pb-8 snap-x">
        {rounds.map(round => (
          <div key={round.number} className="flex-shrink-0 w-72 snap-center">
            <h3 className="text-center font-bold text-gray-400 uppercase tracking-widest mb-6">
              Ronda {round.number}
            </h3>
            
            <div className="flex flex-col gap-8 justify-around h-full">
              {round.matches.map(match => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  onUpdate={handleUpdateLocal} 
                  onSave={saveMatch} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sub-componente para limpiar el render principal
function MatchCard({ match, onUpdate, onSave }: { 
  match: Match; 
  onUpdate: (id: string, u: Partial<Match>) => void;
  onSave: (id: string) => void;
}) {
  return (
    <div className="bg-white border-l-4 border-l-blue-500 rounded-r-xl shadow-sm hover:shadow-md transition-shadow p-4 relative group">
      <span className="absolute -top-3 left-2 bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full border">
        Match #{match.position}
      </span>

      <div className="space-y-3 mt-2">
        <div className="space-y-1">
          <TeamInput 
            label="Team A" 
            value={match.teamA} 
            score={match.scoreA}
            onChangeName={(v) => onUpdate(match.id, { teamA: v })}
            onChangeScore={(v) => onUpdate(match.id, { scoreA: v })}
          />
          <TeamInput 
            label="Team B" 
            value={match.teamB} 
            score={match.scoreB}
            onChangeName={(v) => onUpdate(match.id, { teamB: v })}
            onChangeScore={(v) => onUpdate(match.id, { scoreB: v })}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-400 block uppercase">Estado</label>
            <select
              value={match.status}
              onChange={(e) => onUpdate(match.id, { status: e.target.value as any })}
              className="text-xs w-full bg-gray-50 border rounded p-1"
            >
              <option value="pending">Pendiente</option>
              <option value="in_progress">En curso</option>
              <option value="finished">Finalizado</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block uppercase">Precisión</label>
            <input
              type="number"
              value={match.precision ?? 0}
              onChange={(e) => onUpdate(match.id, { precision: Number(e.target.value) })}
              className="text-xs w-full bg-gray-50 border rounded p-1"
            />
          </div>
        </div>

        <button
          onClick={() => onSave(match.id)}
          className="w-full bg-slate-800 hover:bg-black text-white text-xs font-bold py-2 rounded transition-colors"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}

function TeamInput({ label, value, score, onChangeName, onChangeScore }: any) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder={label}
        value={value || ''}
        onChange={(e) => onChangeName(e.target.value)}
        className="flex-1 text-sm font-semibold border-b border-transparent focus:border-blue-300 focus:outline-none py-1"
      />
      <input
        type="number"
        value={score}
        onChange={(e) => onChangeScore(Number(e.target.value))}
        className="w-10 text-center bg-gray-100 rounded font-bold text-sm py-1 focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />
    </div>
  );
}