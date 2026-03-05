import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

import DashboardLayout from '@/layouts/DashboardLayout';
import UsersSection from '@/components/roles/admin/UsersSection';
import MatchesSection from '@/components/roles/admin/MatchesSection';
import ScoresSection from '@/components/roles/admin/ScoresSection';
import BracketsSection from '@/components/roles/admin/BracketsSection';

const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'matches' | 'scores' | 'brackets'>('users');
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [brackets, setBrackets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    checkAuth();
    fetchData();

    const socket = io(`http://${hostname}:3000`);

    socket.on('usersUpdate', fetchData);
    socket.on('matchesUpdate', fetchData);
    socket.on('bracketsUpdate', fetchData);

    return () => socket.disconnect();
  }, []);

  const checkAuth = () => {
    const isAuth = localStorage.getItem('isAuthenticated');
    const role = localStorage.getItem('role');

    if (!isAuth || role !== 'admin') {
      window.location.href = '/auth/login';
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem('token');

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const [u, m, b] = await Promise.all([
      fetch('/api/users', { headers }),
      fetch('/api/matches', { headers }),
      fetch('/api/brackets', { headers })
    ]);

    if (u.ok) setUsers(await u.json());
    if (m.ok) setMatches(await m.json());
    if (b.ok) setBrackets(await b.json());

    setLoading(false);
  };

  if (loading) return <div className="p-10">Cargando...</div>;

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'users' && (
        <UsersSection users={users} refresh={fetchData} />
      )}

      {activeTab === 'matches' && (
        <MatchesSection />
      )}

      {activeTab === 'scores' && (
        <ScoresSection />
      )}

      {activeTab === 'brackets' && (
        <BracketsSection />
      )}
    </DashboardLayout>
  );
}