interface Props {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    children: React.ReactNode;
  }
  
  export default function DashboardLayout({ activeTab, setActiveTab, children }: Props) {
    const handleLogout = () => {
      localStorage.clear();
      window.location.href = '/auth/login';
    };
  
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow p-4 flex justify-between">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
            Logout
          </button>
        </header>
  
        <nav className="flex space-x-4 p-4">
          {['users', 'matches', 'scores', 'brackets'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded ${
                activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
  
        <main className="p-6 bg-white m-4 rounded shadow">
          {children}
        </main>
      </div>
    );
}