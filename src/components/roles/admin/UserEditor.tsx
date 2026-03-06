import { useState } from 'react';

export default function UserEditor({ users, refresh }: { users: any[], refresh: () => void }) {
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!formData.username.trim() || !formData.password.trim()) {
      alert('⚠️ Username y password son obligatorios');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error creando usuario');
      }

      alert('✅ Usuario "' + formData.username + '" creado correctamente');
      setFormData({ username: '', password: '', role: 'user' });
      refresh();

    } catch (error) {
      console.error('Error:', error);
      alert('❌ ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error actualizando usuario');
      }

      alert('✅ Usuario actualizado correctamente');
      setEditingUser(null);
      setFormData({ username: '', password: '', role: 'user' });
      refresh();

    } catch (error) {
      console.error('Error:', error);
      alert('❌ ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't show password for security
      role: user.role
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'user' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('✅ Usuario eliminado correctamente');
        refresh();
      } else {
        const data = await response.json();
        alert('❌ ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error eliminando usuario');
    }
  };

  return (
    <div className="space-y-6">
      {/* Create/Edit Form */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
          {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Username */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</label>
            <input
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="ej. referee_01"
              value={formData.username}
              onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {editingUser ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña'}
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>

          {/* Role */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rol del Sistema</label>
            <select
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none cursor-pointer"
              value={formData.role}
              onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="user">User (Invitado)</option>
              <option value="ref">Ref (Referee)</option>
              <option value="admin">Admin (Control Total)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {editingUser ? (
              <>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className={`flex-1 h-[46px] font-bold text-white rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95 ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex-1 h-[46px] font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={handleCreate}
                disabled={loading}
                className={`h-[46px] w-full font-bold text-white rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95 ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Procesando...' : 'Crear Usuario'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-green-600 rounded-full"></span>
          Usuarios Registrados
        </h3>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Username</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Creado</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="p-2 font-medium">{user.username}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    user.role === 'admin' ? 'bg-red-100 text-red-700' :
                    user.role === 'ref' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td className="p-2 text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(user)}
                      className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      Editar
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
