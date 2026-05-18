import { useState, useEffect } from 'react';
import { socket } from '@/lib/socket';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DashboardLayout from '@/layouts/DashboardLayout';
import UsersSection from '@/components/roles/admin/UsersSection';
import TeamsSection from '@/components/roles/admin/TeamsSection';
import MatchesSection from '@/components/roles/admin/MatchesSection';
import ScoresSection from '@/components/roles/admin/ScoresSection';
import AwardsSection from '@/components/roles/admin/AwardsSection';
import ScreensSection from '@/components/roles/admin/Screens';
import QualisSection from '@/components/roles/admin/QualisSection';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'teams' | 'matches' | 'scores' | 'awards' | 'screens' | 'qualis'>('users');
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    checkAuth();
    fetchData();

    socket.on('usersUpdate', fetchData);
    socket.on('teamsUpdate', fetchData);
    socket.on('matchesUpdate', fetchData);

    return () => {
      socket.off('usersUpdate', fetchData);
      socket.off('teamsUpdate', fetchData);
      socket.off('matchesUpdate', fetchData);
    };
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

    try {
      const [u, t, m] = await Promise.all([
        fetch('/api/users', { headers }),
        fetch('/api/teams', { headers }),
        fetch('/api/matches', { headers })
      ]);

      if (u.ok) setUsers(await u.json());
      if (t.ok) setTeams(await t.json());
      if (m.ok) setMatches(await m.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10">Cargando...</div>;

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      {activeTab === 'users' && (
        <UsersSection users={users} refresh={fetchData} />
      )}

      {activeTab === 'teams' && (
        <TeamsSection teams={teams} refresh={fetchData} />
      )}

      {activeTab === 'matches' && (
        <MatchesSection />
      )}

      {activeTab === 'scores' && (
        <ScoresSection />
      )}

      {activeTab === 'awards' && (
        <AwardsSection />
      )}

      {activeTab === 'screens' && (
        <ScreensSection />
      )}

      {activeTab === 'qualis' && (
        <QualisSection />
      )}
    </DashboardLayout>
  );
}