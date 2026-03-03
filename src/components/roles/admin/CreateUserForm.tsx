import { useState } from 'react';

export default function CreateUserForm({ onUserCreated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    // 1. Validaciones básicas
    if (!username.trim() || !password.trim()) {
      alert('⚠️ Username y password son obligatorios');
      return;
    }

    try {
      setLoading(true);

      // 2. Recuperar el token del localStorage (vital para que el server no lo rechace)
      const token = localStorage.getItem('token');

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // <--- IMPORTANTE: Esto evita el "Token requerido"
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error creando usuario');
      }

      // 3. Éxito: Limpiar formulario y avisar al padre
      alert('✅ Usuario "' + username + '" creado correctamente');
      
      setUsername('');
      setPassword('');
      setRole('user');

      // Si pasaste una función para refrescar la tabla, la llamamos
      if (onUserCreated) onUserCreated();

    } catch (error) {
      console.error('Error:', error);
      alert('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
        Registrar Nuevo Usuario
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Username */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</label>
          <input
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="ej. referee_01"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contraseña</label>
          <input
            type="password"
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {/* Role */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rol del Sistema</label>
          <select
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none cursor-pointer"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="user">User (Invitado)</option>
            <option value="ref">Ref (Referee)</option>
            <option value="admin">Admin (Control Total)</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleCreate}
          disabled={loading}
          className={`h-[46px] w-full font-bold text-white rounded-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95 ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Procesando...' : 'Crear Usuario'}
        </button>
      </div>
    </div>
  );
}