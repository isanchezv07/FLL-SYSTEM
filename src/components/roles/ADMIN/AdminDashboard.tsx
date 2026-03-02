import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import * as ReactRouter from 'react-router-dom';
const { useHistory } = ReactRouter;

// Get the current hostname for dynamic connection
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

interface User {
  id: string;
  username: string;
  role: string;
  createdAt: string;
}

interface Match {
  id: string;
  type: string;
  number: number;
  date: string;
  redTeam: {
    name: string;
    score: number;
  };
  blueTeam: {
    name: string;
    score: number;
  };
  winner: 'red' | 'blue' | 'tie';
}

interface Bracket {
  id: string;
  name: string;
  matches: Match[];
  teams: string[];
  status: 'pending' | 'active' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'matches' | 'scores' | 'brackets'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [brackets, setBrackets] = useState<Bracket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    const isClient = typeof window !== 'undefined';
    
    if (!isClient) {
      return;
    }

    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const role = localStorage.getItem('role');
    
    if (!isAuthenticated || isAuthenticated !== 'true' || role !== 'admin') {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    setIsAuthenticated(true);
    fetchData();

    // Configurar WebSocket para actualizaciones en tiempo real
    console.log('Connecting to WebSocket at:', `http://${hostname}:3000`);
    const socket = io(`http://${hostname}:3000`, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socket.on('connect', () => {
      console.log('AdminDashboard WebSocket connected successfully');
    });
    
    socket.on('connect_error', (error) => {
      console.error('AdminDashboard WebSocket connection error:', error);
    });
    
    socket.on('usersUpdate', () => {
      console.log('Users updated, refreshing...');
      fetchData();
    });
    
    socket.on('matchesUpdate', () => {
      console.log('Matches updated, refreshing...');
      fetchData();
    });
    
    socket.on('bracketsUpdate', () => {
      console.log('Brackets updated, refreshing...');
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchData = async () => {
    // Check if we're in a browser environment
    const isClient = typeof window !== 'undefined';
    
    if (!isClient) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Fetch users
      const usersResponse = await fetch('/api/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      } else {
        console.error('Failed to fetch users');
      }

      // Fetch matches
      const matchesResponse = await fetch('/api/matches');
      if (matchesResponse.ok) {
        const matchesData = await matchesResponse.json();
        setMatches(matchesData);
      } else {
        console.error('Failed to fetch matches');
      }

      // Fetch brackets
      const bracketsResponse = await fetch('/api/brackets');
      if (bracketsResponse.ok) {
        const bracketsData = await bracketsResponse.json();
        setBrackets(bracketsData);
      } else {
        console.error('Failed to fetch brackets');
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Check if we're in a browser environment
    const isClient = typeof window !== 'undefined';
    
    if (isClient) {
      // Limpiar completamente localStorage
      localStorage.clear();
      // Redirigir al login
      window.location.href = '/login';
    }
  };

  const handleCreateUser = async () => {
    // Check if we're in a browser environment
    const isClient = typeof window !== 'undefined';
    
    if (!isClient) {
      return;
    }

    const username = prompt('Nombre de usuario:');
    const role = prompt('Rol (user/admin):');
    
    if (!username || !role) {
      alert('Username y role son requeridos');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, role })
      });

      if (response.ok) {
        fetchData();
        alert('Usuario creado exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al crear usuario');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error de conexión');
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`¿Estás seguro de eliminar el usuario "${username}"?`)) return;
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
        alert('Usuario eliminado exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al eliminar usuario');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error de conexión');
    }
  };

  const handleCreateBracket = async () => {
    // Check if we're in a browser environment
    const isClient = typeof window !== 'undefined';
    
    if (!isClient) {
      return;
    }

    const name = prompt('Nombre del bracket:');
    
    if (!name) {
      alert('El nombre es requerido');
      return;
    }

    try {
      const response = await fetch('/api/brackets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          name, 
          status: 'pending', 
          teams: [], 
          matches: [] 
        })
      });

      if (response.ok) {
        fetchData();
        alert('Bracket creado exitosamente');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al crear bracket');
      }
    } catch (error) {
      console.error('Error creating bracket:', error);
      alert('Error de conexión');
    }
  };

  const renderUsers = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Usuarios</h3>
        <button
          onClick={handleCreateUser}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Nuevo Usuario
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMatches = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Matches</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipo Rojo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score Rojo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equipo Azul
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score Azul
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ganador
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {matches.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No hay matches registrados
                </td>
              </tr>
            ) : (
              matches.map(match => (
                <tr key={match.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {match.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {match.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {match.redTeam?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                    {match.redTeam?.score || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {match.blueTeam?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {match.blueTeam?.score || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${
                      match.winner === 'red' ? 'text-red-600' : 
                      match.winner === 'blue' ? 'text-blue-600' : 
                      'text-gray-600'
                    }`}>
                      {match.winner === 'red' ? 'Rojo' : 
                       match.winner === 'blue' ? 'Azul' : 
                       'Empate'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(match.date).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderScores = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Scores</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="text-lg font-semibold text-red-600 mb-4">Equipo Rojo</h4>
          <div className="space-y-2">
            {matches.filter(m => m.redTeam?.score > 0).length === 0 ? (
              <p className="text-gray-500">No hay scores registrados</p>
            ) : (
              matches
                .filter(m => m.redTeam?.score > 0)
                .map(match => (
                  <div key={match.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span>{match.redTeam?.name || 'N/A'}</span>
                    <span className="font-bold">{match.redTeam?.score || 0}</span>
                  </div>
                ))
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="text-lg font-semibold text-blue-600 mb-4">Equipo Azul</h4>
          <div className="space-y-2">
            {matches.filter(m => m.blueTeam?.score > 0).length === 0 ? (
              <p className="text-gray-500">No hay scores registrados</p>
            ) : (
              matches
                .filter(m => m.blueTeam?.score > 0)
                .map(match => (
                  <div key={match.id} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span>{match.blueTeam?.name || 'N/A'}</span>
                    <span className="font-bold">{match.blueTeam?.score || 0}</span>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBrackets = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Brackets/Torneo</h3>
        <button
          onClick={handleCreateBracket}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Nuevo Bracket
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brackets.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No hay brackets registrados
          </div>
        ) : (
          brackets.map(bracket => (
            <div key={bracket.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">{bracket.name}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  bracket.status === 'completed' ? 'bg-green-100 text-green-800' :
                  bracket.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {bracket.status === 'completed' ? 'Completado' :
                   bracket.status === 'active' ? 'Activo' : 'Pendiente'}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <p><strong>Equipos:</strong> {bracket.teams.length > 0 ? bracket.teams.join(', ') : 'Ninguno'}</p>
                <p><strong>Matches:</strong> {bracket.matches?.length || 0}</p>
              </div>
              <div className="flex justify-end">
                <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                  Ver Detalles
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">LEGO Timer - Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Admin: {(() => {
                  const isClient = typeof window !== 'undefined';
                  if (!isClient) return 'Unknown';
                  const user = JSON.parse(localStorage.getItem('user') || '{}');
                  return user?.username || 'Unknown';
                })()}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'users' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'matches' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Matches
            </button>
            <button
              onClick={() => setActiveTab('scores')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'scores' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Scores
            </button>
            <button
              onClick={() => setActiveTab('brackets')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'brackets' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Brackets
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'matches' && renderMatches()}
          {activeTab === 'scores' && renderScores()}
          {activeTab === 'brackets' && renderBrackets()}
        </div>
      </main>
    </div>
  );
}
