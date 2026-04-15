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
    <div className="space-y-10 animate-in fade-in duration-700 font-sans">
      {/* Header con diseño Pro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/70 p-8 rounded-[40px] border border-white shadow-xl shadow-gray-200/50 backdrop-blur-xl">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">
            Gestión de Usuarios
          </h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#006847] rounded-full animate-pulse" />
            Control de accesos y credenciales del sistema
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={refresh}
            className="p-4 bg-white hover:bg-gray-50 text-gray-400 rounded-2xl border border-gray-100 transition-all active:scale-90 shadow-sm"
            title="Refrescar lista"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowShowForm(!showForm)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] transition-all active:scale-95 shadow-lg ${
              showForm 
                ? 'bg-white text-gray-400 border border-gray-200' 
                : 'bg-gray-900 hover:bg-black text-white shadow-gray-900/20 border border-gray-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            {showForm ? 'Cerrar Formulario' : 'Crear Acceso'}
          </button>
        </div>
      </div>

      {/* Formulario de Creación Estilizado */}
      {showForm && (
        <div className="bg-white/80 border border-white rounded-[48px] p-10 backdrop-blur-2xl animate-in slide-in-from-top-8 duration-500 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)]">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Nombre de Usuario</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#006847] transition-colors" />
                <input
                  required
                  type="text"
                  placeholder="Ej: mesa_norte_01"
                  className="w-full bg-white border border-gray-200 p-5 pl-14 rounded-[24px] outline-none focus:border-[#006847] focus:ring-4 focus:ring-[#006847]/5 text-gray-800 font-bold transition-all shadow-sm"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Clave de Acceso</label>
              <div className="relative group">
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#006847] transition-colors" />
                <input
                  required
                  type="text"
                  placeholder="Contraseña robusta"
                  className="w-full bg-white border border-gray-200 p-5 pl-14 rounded-[24px] outline-none focus:border-[#006847] focus:ring-4 focus:ring-[#006847]/5 text-gray-800 font-bold transition-all shadow-sm"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Nivel de Privilegios</label>
              <div className="flex gap-3">
                <select
                  className="flex-1 bg-white border border-gray-200 p-5 rounded-[24px] outline-none focus:border-[#006847] focus:ring-4 focus:ring-[#006847]/5 text-gray-800 font-bold appearance-none cursor-pointer shadow-sm"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="ref">Juez de Campo (Referee)</option>
                  <option value="admin">Administrador Total</option>
                </select>
                <button className="bg-[#006847] hover:bg-[#005a3e] text-white px-10 rounded-[24px] font-bold uppercase tracking-widest text-[11px] transition-all shadow-lg shadow-[#006847]/20 active:scale-95 transform hover:-translate-y-0.5">
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
            <div key={user.id} className="group relative bg-white border border-gray-100 p-8 rounded-[40px] transition-all duration-500 hover:border-[#006847]/20 hover:shadow-2xl hover:shadow-gray-200/50 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#006847]/5 blur-3xl -mr-16 -mt-16 pointer-events-none transition-all group-hover:bg-[#006847]/10" />
              
              <div className="flex flex-col h-full relative z-10">
                {/* Header Tarjeta */}
                <div className="flex items-start justify-between mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:rotate-6 ${
                    user.role === 'admin' ? 'bg-purple-50 border-purple-100 text-purple-600' : 'bg-[#006847]/5 border-[#006847]/10 text-[#006847]'
                  }`}>
                    <Shield className="w-7 h-7" />
                  </div>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-3 text-gray-300 hover:text-[#CE1126] hover:bg-red-50 rounded-xl transition-all"
                    title="Eliminar usuario"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Info Principal */}
                <div className="space-y-6">
                  <div>
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Identificador</div>
                    <div className="text-2xl font-black text-gray-900 uppercase tracking-tighter truncate italic">{user.username}</div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Password Field */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between group/field">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Clave de Acceso</span>
                        <span className="font-mono font-bold text-gray-600 tracking-wider">
                          {isPasswordVisible ? user.password : '••••••••'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/field:opacity-100 transition-opacity">
                        <button 
                          onClick={() => togglePassword(user.id)}
                          className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-gray-900 transition-colors shadow-sm"
                        >
                          {isPasswordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => copyToClipboard(user.password, user.id + '-pass')}
                          className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-[#006847] transition-colors shadow-sm"
                        >
                          {copiedId === user.id + '-pass' ? <Check className="w-4 h-4 text-[#006847]" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Role Tag */}
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-[#006847] shadow-[0_0_8px_rgba(0,104,71,0.5)]'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${user.role === 'admin' ? 'text-purple-600' : 'text-[#006847]'}`}>
                          {user.role === 'admin' ? 'Administrador' : 'Juez de Campo'}
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
