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
    <div className="space-y-6 animate-in fade-in duration-300 font-sans text-slate-800 dark:text-slate-200 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight transition-colors">Team Registry</h2>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Official Event Participants</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 transition-all">
        {/* Team Form - Compact Sidebar Style */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm transition-colors">
                <h3 className="font-bold uppercase tracking-tight text-sm text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                  {editingId ? 'Modify Unit' : 'New Unit'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Team Number</label>
                    <input
                      type="text"
                      placeholder="101"
                      value={formData.number}
                      onChange={e => setFormData(prev => ({ ...prev, number: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Team Name</label>
                    <input
                      type="text"
                      placeholder="Cyber Bots"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none transition-all uppercase placeholder:text-slate-300 dark:placeholder:text-slate-700"
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-[#0066B3] dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white py-2.5 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all shadow-sm"
                    >
                      {loading ? '...' : (editingId ? 'Save' : 'Register')}
                    </button>
                    
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => { setEditingId(null); setFormData({ number: '', name: '' }); }}
                        className="px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg font-bold uppercase text-[10px]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </form>
            </div>
        </div>

        {/* Teams List Table */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex items-center px-4 py-2 gap-4 transition-colors">
            <Users className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="FILTER BY NUMBER OR NAME..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-bold w-full placeholder:text-slate-300 dark:placeholder:text-slate-700 dark:text-white"
            />
            <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800">
              {filteredTeams.length} Total
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden transition-colors">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Number</th>
                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Official Name</th>
                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y border-slate-100 dark:divide-slate-800">
                    {filteredTeams.map(team => (
                        <tr key={team.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                            <td className="px-6 py-4 font-black text-blue-700 dark:text-blue-400 tabular-nums">#{team.number}</td>
                            <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-tight">{team.name}</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(team)} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded text-blue-600 dark:text-blue-400 border border-transparent hover:border-blue-100 dark:hover:border-blue-900 transition-all shadow-sm"><Edit2 className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => handleDelete(team.id)} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded text-red-600 border border-transparent hover:border-red-100 dark:hover:border-red-900 transition-all shadow-sm"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredTeams.length === 0 && (
                        <tr>
                            <td colSpan={3} className="px-6 py-20 text-center text-slate-400 dark:text-slate-600 font-bold uppercase text-[10px] tracking-widest">No Teams Registered</td>
                        </tr>
                    )}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
