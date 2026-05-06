import { useState } from 'react';
import { Users, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface Team {
  id: string;
  number: string;
  name: string;
}

export default function TeamsSection({ teams, refresh }: { teams: Team[], refresh: () => void }) {
  const [formData, setFormData] = useState({ number: '', name: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.number.trim() || !formData.name.trim()) {
      toast.error('Número y nombre son requeridos');
      return;
    }

    setLoading(true);
    
    try {
      const url = editingId ? `/api/teams/${editingId}` : '/api/teams';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al procesar equipo');
      }

      toast.success(editingId ? 'Equipo actualizado' : 'Equipo creado');
      
      setFormData({ number: '', name: '' });
      setEditingId(null);
      refresh();
      
    } catch (error) {
      toast.error('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (team: Team) => {
    setEditingId(team.id);
    setFormData({
      number: team.number,
      name: team.name
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este equipo?')) return;
    
    try {
      const response = await fetch(`/api/teams/${id}`, { method: 'DELETE' });
      
      if (response.ok) {
        toast.success('Equipo eliminado');
        refresh();
      } else {
        const data = await response.json();
        toast.error('Error: ' + data.error);
      }
    } catch (error) {
      toast.error('Error al eliminar equipo');
    }
  };

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.number.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-slate-900/40 p-8 rounded-[40px] border border-slate-800 shadow-2xl backdrop-blur-md">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Gestión de Equipos</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Administra los equipos registrados en teams.json</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team Form */}
        <div className="bg-slate-900/60 rounded-[40px] border border-slate-800 p-8 shadow-2xl h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              {editingId ? <Edit2 className="text-white w-5 h-5" /> : <Plus className="text-white w-5 h-5" />}
            </div>
            <h3 className="font-black uppercase tracking-widest text-sm text-white">
              {editingId ? 'Editar Equipo' : 'Nuevo Equipo'}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Número de Equipo</label>
              <input
                type="text"
                placeholder="Ej: 101"
                value={formData.number}
                onChange={e => setFormData(prev => ({ ...prev, number: e.target.value }))}
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-5 py-4 text-white font-bold focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nombre del Equipo</label>
              <input
                type="text"
                placeholder="Ej: Cyber Bots"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-5 py-4 text-white font-bold focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {loading ? 'Procesando...' : (editingId ? 'Actualizar' : 'Crear Equipo')}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ number: '', name: '' });
                  }}
                  className="px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Teams List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/40 p-4 rounded-3xl border border-slate-800 flex items-center gap-4">
            <Users className="w-5 h-5 text-slate-500 ml-2" />
            <input 
              type="text" 
              placeholder="Buscar por nombre o número..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-white font-bold text-sm w-full placeholder:text-slate-600"
            />
            <div className="bg-slate-800 px-3 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {filteredTeams.length} Equipos
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
            {filteredTeams.map(team => (
              <div key={team.id} className="bg-slate-900/60 border-2 border-slate-800 hover:border-blue-500/50 rounded-3xl p-6 transition-all group">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">#{team.number}</span>
                    <span className="text-lg font-black text-white uppercase truncate max-w-[200px]">{team.name}</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(team)}
                      className="p-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-xl transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(team.id)}
                      className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredTeams.length === 0 && (
              <div className="col-span-full py-20 text-center bg-slate-900/20 rounded-[40px] border-2 border-dashed border-slate-800">
                <Users className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                <p className="text-slate-600 font-black uppercase tracking-widest text-xs">No se encontraron equipos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
