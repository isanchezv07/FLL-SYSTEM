import MatchTimer from "@/components/game/MatchTimer";
import { LogOut, LayoutDashboard, Settings, Trophy, GitFork, Users } from "lucide-react";

interface Props {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    children: React.ReactNode;
}

const NavButton = ({ id, label, icon: Icon, active, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all border-2 ${
      active 
        ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-105 z-10' 
        : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
    }`}
  >
    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-600'}`} />
    {label}
  </button>
);

export default function DashboardLayout({ activeTab, setActiveTab, children }: Props) {
    const handleLogout = () => {
      localStorage.clear();
      window.location.href = '/auth/login';
    };
  
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
        {/* Top Bar */}
        <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-md border-b border-slate-800/50 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                <LayoutDashboard className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-black uppercase tracking-tighter leading-none">FLL SYSTEM</h1>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Command Center</span>
              </div>
            </div>
            <MatchTimer />
          </div>

          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border border-red-500/20 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </header>
  
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
          {/* Navigation */}
          <nav className="flex flex-wrap gap-3 mb-8">
            <NavButton id="users" label="Usuarios" icon={Users} active={activeTab === 'users'} onClick={setActiveTab} />
            <NavButton id="matches" label="Partidos" icon={Settings} active={activeTab === 'matches'} onClick={setActiveTab} />
            <NavButton id="scores" label="Ranking" icon={Trophy} active={activeTab === 'scores'} onClick={setActiveTab} />
            <NavButton id="awards" label="Premios" icon={Trophy} active={activeTab === 'awards'} onClick={setActiveTab} />
          </nav>
    
          {/* Main Content Area */}
          <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-slate-900/40 rounded-[40px] border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-sm min-h-[700px]">
              <div className="p-1 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
              <div className="p-8 lg:p-10">
                {children}
              </div>
            </div>
          </main>
        </div>

        {/* Decoración de fondo */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />
        </div>
      </div>
    );
}
