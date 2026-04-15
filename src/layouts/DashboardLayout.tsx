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
    className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[11px] transition-all border ${
      active 
        ? 'bg-gray-900 border-gray-900 text-white shadow-xl shadow-gray-900/20 scale-105 z-10' 
        : 'bg-white border-gray-200 text-gray-500 hover:border-[#006847] hover:text-[#006847] shadow-sm hover:shadow-md'
    }`}
  >
    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400 group-hover:text-[#006847]'}`} />
    {label}
  </button>
);

export default function DashboardLayout({ activeTab, setActiveTab, children }: Props) {
    const handleLogout = () => {
      localStorage.clear();
      window.location.href = '/auth/login';
    };
  
    return (
      <div className="min-h-screen bg-[#f8fafc] text-gray-800 font-sans selection:bg-[#006847]/10">
        {/* Barra decorativa bandera de México */}
        <div className="fixed top-0 left-0 w-full h-1 flex z-[60]">
          <div className="h-full flex-1 bg-[#006847]"></div>
          <div className="h-full flex-1 bg-white"></div>
          <div className="h-full flex-1 bg-[#CE1126]"></div>
        </div>

        {/* Top Bar */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <img src="/img/logo_internacional.svg" alt="FLL Logo" className="h-10 w-auto" />
            </div>
            <div className="hidden md:block">
              <MatchTimer />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <MatchTimer />
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 bg-white hover:bg-red-50 text-red-500 px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all border border-gray-200 hover:border-red-200 active:scale-95 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </header>
  
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
          {/* Navigation */}
          <nav className="flex flex-wrap gap-3 mb-8">
            <NavButton id="users" label="Usuarios" icon={Users} active={activeTab === 'users'} onClick={setActiveTab} />
            <NavButton id="matches" label="Partidos" icon={Settings} active={activeTab === 'matches'} onClick={setActiveTab} />
            <NavButton id="scores" label="Ranking" icon={Trophy} active={activeTab === 'scores'} onClick={setActiveTab} />
            <NavButton id="awards" label="Premios" icon={Trophy} active={activeTab === 'awards'} onClick={setActiveTab} />
            <NavButton id="screens" label="Pantallas" icon={Trophy} active={activeTab === 'screens'} onClick={setActiveTab} />
          </nav>
    
          {/* Main Content Area */}
          <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white/70 backdrop-blur-xl rounded-[40px] border border-white shadow-[0_32px_64px_-15px_rgba(0,0,0,0.05)] overflow-hidden min-h-[750px]">
              <div className="p-1 h-1 bg-gradient-to-r from-transparent via-[#006847]/30 to-transparent" />
              <div className="p-8 lg:p-12">
                {children}
              </div>
            </div>
          </main>
        </div>

        {/* Decoración de fondo */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-30"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#006847]/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#CE1126]/5 blur-[120px] rounded-full" />
        </div>
      </div>
    );
}
