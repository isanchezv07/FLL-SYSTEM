'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, User, Key, RefreshCw, Eye, EyeOff, Copy, Check } from 'lucide-react';

export default function UsersSection({ users: initialUsers, refresh }: any) {
  const [users, setUsers] = useState(initialUsers || []);
  const [showForm, setShowShowForm] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'ref' });
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const togglePassword = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreate = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        refresh();
        setShowShowForm(false);
        setFormData({ username: '', password: '', role: 'ref' });
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este usuario de forma permanente?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) refresh();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header con diseño Pro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 p-8 rounded-[40px] border border-slate-800 shadow-2xl backdrop-blur-md">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Identity Management</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Control de accesos y credenciales del sistema
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={refresh}
            className="p-4 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-2xl border border-slate-800 transition-all active:scale-90"
            title="Refrescar lista"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowShowForm(!showForm)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 shadow-lg ${
              showForm 
                ? 'bg-slate-800 text-slate-400 border border-slate-700' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 border border-blue-400/20'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            {showForm ? 'Cerrar Formulario' : 'Crear Acceso'}
          </button>
        </div>
      </div>

      {/* Formulario de Creación Estilizado */}
      {showForm && (
        <div className="bg-slate-900/80 border-2 border-blue-500/20 rounded-[48px] p-10 backdrop-blur-2xl animate-in slide-in-from-top-8 duration-500 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-4">Nombre de Usuario</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <input
                  required
                  type="text"
                  placeholder="Ej: mesa_norte_01"
                  className="w-full bg-slate-950 border-2 border-slate-800 p-5 pl-14 rounded-[24px] outline-none focus:border-blue-500 text-white font-black transition-all shadow-inner"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-4">Clave de Acceso</label>
              <div className="relative group">
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <input
                  required
                  type="text"
                  placeholder="Contraseña robusta"
                  className="w-full bg-slate-950 border-2 border-slate-800 p-5 pl-14 rounded-[24px] outline-none focus:border-blue-500 text-white font-black transition-all shadow-inner"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-4">Nivel de Privilegios</label>
              <div className="flex gap-3">
                <select
                  className="flex-1 bg-slate-950 border-2 border-slate-800 p-5 rounded-[24px] outline-none focus:border-blue-500 text-white font-black appearance-none cursor-pointer shadow-inner"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="ref">Juez de Campo (Referee)</option>
                  <option value="admin">Administrador Total</option>
                </select>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-10 rounded-[24px] font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-blue-950/20 active:scale-95 border-b-4 border-blue-800">
                  Registrar
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Usuarios con el nuevo diseño de Fichas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user: any) => {
          const isPasswordVisible = visiblePasswords[user.id];
          return (
            <div key={user.id} className="group relative bg-slate-900/60 border border-slate-800 p-8 rounded-[40px] transition-all duration-500 hover:border-slate-600 hover:bg-slate-900 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -mr-16 -mt-16 pointer-events-none" />
              
              <div className="flex flex-col h-full relative z-10">
                {/* Header Tarjeta */}
                <div className="flex items-start justify-between mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-transform group-hover:rotate-6 ${
                    user.role === 'admin' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  }`}>
                    <Shield className="w-7 h-7" />
                  </div>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    title="Eliminar usuario"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Info Principal */}
                <div className="space-y-6">
                  <div>
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">User Identifier</div>
                    <div className="text-2xl font-black text-white uppercase tracking-tighter truncate">{user.username}</div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Password Field */}
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/50 flex items-center justify-between group/field">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Secure Key</span>
                        <span className="font-mono font-bold text-slate-300 tracking-wider">
                          {isPasswordVisible ? user.password : '••••••••'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/field:opacity-100 transition-opacity">
                        <button 
                          onClick={() => togglePassword(user.id)}
                          className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
                        >
                          {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => copyToClipboard(user.password, user.id + '-pass')}
                          className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-blue-400 transition-colors"
                        >
                          {copiedId === user.id + '-pass' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Role Tag */}
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${user.role === 'admin' ? 'text-purple-400' : 'text-blue-400'}`}>
                          {user.role === 'admin' ? 'System Admin' : 'Field Referee'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
