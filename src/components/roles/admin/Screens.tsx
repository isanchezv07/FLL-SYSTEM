import { useState, useEffect } from 'react';
import { Trophy, Megaphone, Trash2, Eye, EyeOff, Save, Play, Square, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ScreensSection() {
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
      {/* Enlaces a Pantallas */}
      <div className="bg-slate-900/40 p-8 rounded-[40px] border border-slate-800 shadow-2xl backdrop-blur-md">
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-6">Pantallas de Visualización</h3>
        <div className="flex flex-wrap gap-4">
          <a href="/displays/live" target="_blank" className="bg-slate-800 hover:bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 border border-slate-700 hover:border-blue-400">
            <Eye className="w-5 h-5" />
            Display Principal (Live)
          </a>
          <a href="/displays/timer" target="_blank" className="bg-slate-800 hover:bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 border border-slate-700 hover:border-blue-400">
            <Play className="w-5 h-5" />
            Display de Timer (Incluye Qualis)
          </a>
        </div>
      </div>
    </div>
  );
}
