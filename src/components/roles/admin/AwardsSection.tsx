import { useState, useEffect } from 'react';
import { Trophy, Megaphone, Trash2, Eye, EyeOff, Save, Play, Square, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AwardsSection() {
  const [awardsData, setAwardsData] = useState({ awards: [], announcement: { text: '', active: false }, ceremonyMode: false });
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [awardsRes, teamsRes] = await Promise.all([
        fetch('/api/awards'),
        fetch('/api/teams')
      ]);
      if (awardsRes.ok) {
        const data = await awardsRes.ok ? await awardsRes.json() : awardsData;
        setAwardsData(data);
      }
      if (teamsRes.ok) {
        const data = await teamsRes.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Error fetching awards data:', error);
    }
  };

  const handleUpdateAward = async (id, data) => {
    try {
      const response = await fetch(`/api/awards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      toast.error('Error al actualizar premio');
    }
  };

  const handleRevealStep = async (award) => {
    // Si nada está revelado, revelamos el título
    if (!award.revealedTitle && !award.revealedWinner) {
      // Primero ocultamos cualquier otro que esté visible
      const others = awardsData.awards.filter(a => a.id !== award.id && (a.revealedTitle || a.revealedWinner));
      for (const other of others) {
        await handleUpdateAward(other.id, { revealedTitle: false, revealedWinner: false });
      }
      await handleUpdateAward(award.id, { revealedTitle: true });
      toast.success('Título del premio mostrado');
    } 
    // Si el título ya está pero el ganador no, revelamos ganador
    else if (award.revealedTitle && !award.revealedWinner) {
      await handleUpdateAward(award.id, { revealedWinner: true });
      toast.success('¡Ganador revelado!');
    }
    // Si todo está revelado, lo ocultamos todo
    else {
      await handleUpdateAward(award.id, { revealedTitle: false, revealedWinner: false });
      toast.info('Premio ocultado');
    }
  };

  const handleAnnouncementUpdate = async (data) => {
    try {
      const response = await fetch('/api/awards/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        toast.success('Anuncio actualizado');
        fetchData();
      }
    } catch (error) {
      toast.error('Error al actualizar anuncio');
    }
  };

  const handleCeremonyToggle = async () => {
    const newMode = !awardsData.ceremonyMode;
    try {
      const response = await fetch('/api/awards/ceremony', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newMode })
      });
      if (response.ok) {
        toast.success(newMode ? 'Modo Ceremonia ACTIVADO' : 'Modo Ceremonia DESACTIVADO');
        fetchData();
      }
    } catch (error) {
      toast.error('Error al cambiar modo');
    }
  };

  const handleReset = async () => {
    if (!confirm('¿Estás seguro de que quieres reiniciar todos los premios y anuncios?')) return;
    try {
      const response = await fetch('/api/awards/reset', { method: 'POST' });
      if (response.ok) {
        toast.success('Todo reiniciado');
        fetchData();
      }
    } catch (error) {
      toast.error('Error al reiniciar');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Mode Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-slate-800 shadow-2xl backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Ceremonia de Premiación</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Control de ganadores y visibilidad</p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={handleCeremonyToggle}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all border-2 ${
              awardsData.ceremonyMode
                ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {awardsData.ceremonyMode ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {awardsData.ceremonyMode ? 'Detener Ceremonia' : 'Iniciar Ceremonia'}
          </button>
          
          <button
            onClick={handleReset}
            className="p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl border border-red-500/20 transition-all active:scale-95"
            title="Reiniciar Todo"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Premios List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {awardsData?.awards?.map((award) => (
              <div key={award.id} className={`bg-slate-900/40 border-2 rounded-[32px] p-6 transition-all duration-300 ${award.revealedTitle ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.1)]' : 'border-slate-800'}`}>
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <div className="flex-1 text-center sm:text-left">
                    <div className="text-amber-500 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Categoría de Premio</div>
                    <div className="text-xl font-black text-white uppercase">{award.name}</div>
                  </div>
                  
                  <div className="w-full sm:w-64">
                    <div className="text-slate-600 text-[8px] font-black uppercase tracking-widest mb-1.5 ml-2">Asignar Ganador</div>
                    <select
                      value={award.teamNumber}
                      onChange={(e) => {
                        const team = teams.find(t => t.number === e.target.value);
                        handleUpdateAward(award.id, { 
                          teamNumber: e.target.value, 
                          teamName: team ? team.name : '' 
                        });
                      }}
                      className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-4 py-3 text-sm text-white font-bold focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="">--- Ninguno ---</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.number}>{t.number} - {t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <button
                      onClick={() => handleRevealStep(award)}
                      disabled={!award.teamNumber}
                      className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-20 disabled:grayscale ${
                        award.revealedWinner 
                          ? 'bg-red-600 text-white shadow-lg' 
                          : award.revealedTitle
                            ? 'bg-amber-500 text-white shadow-lg'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {!award.revealedTitle ? (
                        <><Eye className="w-4 h-4" /> Mostrar Título</>
                      ) : !award.revealedWinner ? (
                        <><ChevronRight className="w-4 h-4" /> Revelar Ganador</>
                      ) : (
                        <><EyeOff className="w-4 h-4" /> Ocultar Todo</>
                      )}
                    </button>
                    
                    {award.revealedTitle && (
                      <div className="flex justify-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${award.revealedTitle ? 'bg-amber-500 animate-pulse' : 'bg-slate-800'}`} />
                        <div className={`w-2 h-2 rounded-full ${award.revealedWinner ? 'bg-amber-500 animate-pulse' : 'bg-slate-800'}`} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anuncios Config */}
        <div className="space-y-6">
          {/* (resto del componente igual que antes) */}
          <div className="bg-slate-900/60 rounded-[40px] border border-slate-800 p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Megaphone className="text-blue-500 w-5 h-5" />
              <h3 className="font-black uppercase tracking-widest text-sm text-white">Anuncio Global</h3>
            </div>
            
            <div className="space-y-6">
              <textarea
                value={awardsData?.announcement?.text || ''}
                onChange={(e) => setAwardsData({...awardsData, announcement: {...awardsData.announcement, text: e.target.value}})}
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-5 py-4 text-sm text-white font-medium focus:border-blue-500 outline-none min-h-[150px] transition-all"
                placeholder="Escribe el mensaje aquí..."
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleAnnouncementUpdate({ text: awardsData?.announcement?.text })}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
                
                <button
                  onClick={() => handleAnnouncementUpdate({ active: !awardsData?.announcement?.active })}
                  className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 border-2 ${
                    awardsData?.announcement?.active
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {awardsData?.announcement?.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {awardsData?.announcement?.active ? 'En Pantalla' : 'Mostrar'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-[40px] p-8">
            <h4 className="text-amber-500 font-black uppercase tracking-widest text-[11px] mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Pasos para Premiar
            </h4>
            <ul className="text-slate-400 text-xs space-y-3 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold">1.</span>
                Asigna el ganador en la lista.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold">2.</span>
                Haz clic en <strong>Mostrar Título</strong> para que el público sepa qué premio se entrega.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500 font-bold">3.</span>
                Haz clic en <strong>Revelar Ganador</strong> para mostrar el equipo y lanzar el confeti.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
