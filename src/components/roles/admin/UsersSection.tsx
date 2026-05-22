'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, User, Key, RefreshCw, Eye, EyeOff, Copy, Check, X } from 'lucide-react';

export default function UsersSection({ users: initialUsers, refresh }: { users: any[], refresh: () => void }) {
  const [showForm, setShowShowForm] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'ref' });
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Usar props o fetch
  const [users, setUsers] = useState(initialUsers || []);

  useEffect(() => {
    console.log('[DEBUG] Users updated in UsersSection:', initialUsers);
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ username: '', password: '', role: 'ref' });
        setShowShowForm(false);
        refresh();
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar acceso de este operador?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) refresh();
    } catch (e) { console.error(e); }
  };

  const togglePassword = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans text-slate-800 dark:text-slate-200 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 transition-colors">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight italic">Security <span className="text-blue-600 dark:text-blue-400">Registry</span></h2>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Operator Credentials Management</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={refresh}
            className="p-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowShowForm(!showForm)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all shadow-sm ${
              showForm 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' 
                : 'bg-[#0066B3] dark:bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {showForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Add User'}
          </button>
        </div>
      </div>

      {/* Formulario de Creación */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 shadow-md animate-in slide-in-from-top-4 duration-300 transition-colors">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  type="text"
                  placeholder="admin_north"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm font-bold focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Initial Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  type="text"
                  placeholder="password123"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm font-bold focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Security Role</label>
              <div className="flex gap-2">
                <select
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm font-bold focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="ref">Referee</option>
                  <option value="admin">Administrator</option>
                </select>
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all shadow-sm active:scale-95">
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Usuarios (Table Style) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden transition-colors">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest transition-colors">
                    <th className="px-6 py-4">Security Unit</th>
                    <th className="px-6 py-4">Protocol Key</th>
                    <th className="px-6 py-4">Access Level</th>
                    <th className="px-6 py-4 text-right">Operations</th>
                </tr>
            </thead>
            <tbody className="divide-y border-slate-100 dark:divide-slate-800">
                {users.map((user: any) => {
                    const isPasswordVisible = visiblePasswords[user.id];
                    return (
                        <tr key={user.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-slate-400 transition-colors">
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    {user.username}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3 font-mono text-xs transition-colors">
                                    <div className={`min-w-[100px] px-2 py-1 rounded ${isPasswordVisible ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-bold' : 'text-slate-400 dark:text-slate-600'}`}>
                                      {isPasswordVisible ? (user.password || 'NO_PASS_DATA') : '••••••••'}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                          onClick={() => togglePassword(user.id)} 
                                          className={`p-1.5 rounded transition-all shadow-sm border ${isPasswordVisible ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}
                                          title={isPasswordVisible ? "Hide Password" : "Show Password"}
                                        >
                                            {isPasswordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                        <button 
                                          onClick={() => copyToClipboard(user.password, user.id)} 
                                          className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded transition-all shadow-sm border border-slate-200 dark:border-slate-700 text-slate-400"
                                          title="Copy Password"
                                        >
                                            {copiedId === user.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border transition-colors ${
                                    user.role === 'admin' 
                                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400' 
                                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                                }`}>
                                    {user.role === 'admin' ? 'Root Admin' : 'Field Operator'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button 
                                    onClick={() => handleDelete(user.id)}
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 hover:text-red-600 rounded transition-all"
                                    title="Decommission Access"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>
    </div>
  );
}
