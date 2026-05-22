'use client';

import React, { useState, useEffect } from "react";
import MatchTimer from "@/components/game/MatchTimer";
import { LogOut, LayoutDashboard, Settings, Trophy, GitFork, Users, Shield, Radio, Monitor, X, Sun, Moon } from "lucide-react";

interface Props {
    activeTab: string;
    setActiveTab: (tab: any) => void;
    children: React.ReactNode;
}

export default function DashboardLayout({ activeTab, setActiveTab, children }: Props) {
    const [darkMode, setDarkMode] = useState(() => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') === 'dark';
      }
      return false;
    });

    useEffect(() => {
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const handleLogout = () => {
      localStorage.clear();
      window.location.href = '/auth/login';
    };

    const NavButton = ({ id, label, icon: Icon, active, onClick }: any) => (
      <button
        onClick={() => onClick(id)}
        className={`w-full flex items-center gap-4 px-6 py-4 font-semibold text-sm transition-all border-l-4 ${
          active 
            ? (darkMode ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-blue-50 border-blue-600 text-blue-700')
            : (darkMode ? 'bg-transparent border-transparent text-slate-500 hover:bg-slate-800 hover:text-slate-300' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700')
        }`}
      >
        <Icon className={`w-5 h-5 ${active ? (darkMode ? 'text-blue-400' : 'text-blue-600') : 'text-slate-400'}`} />
        {label}
      </button>
    );
  
    return (
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${darkMode ? 'dark bg-slate-950 text-slate-300' : 'bg-slate-100 text-slate-800'}`}>
        {/* Top Header - FTC Style */}
        <header className={`h-16 flex items-center justify-between px-6 shadow-md shrink-0 z-50 transition-colors ${darkMode ? 'bg-[#1a1a1a]' : 'bg-[#0066B3]'}`}>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded shadow-sm">
                <img src="/img/logo_internacional.svg" alt="FIRST Logo" className="h-7 w-auto" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white font-black tracking-tight text-lg uppercase italic">FTC <span className="text-blue-200">LIVE</span></span>
                <span className="text-[9px] text-blue-100 font-bold tracking-widest uppercase mt-0.5">Scoring & Event Management</span>
              </div>
            </div>
            
            <div className="h-8 w-[1px] bg-white/20 hidden md:block" />
            
            <div className="hidden md:flex items-center gap-4">
              <span className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">Active Match</span>
              <MatchTimer />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90 flex items-center gap-2"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
            </button>

            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-white font-bold uppercase tracking-widest">Server Online</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="text-white/80 hover:text-white transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Permanent Sidebar */}
          <aside className={`w-64 border-r flex flex-col shrink-0 transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="py-6 flex-1 overflow-y-auto">
              <div className="px-6 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navigation</div>
              <nav className="space-y-1">
                <NavButton id="matches" label="Match Control" icon={Monitor} active={activeTab === 'matches'} onClick={setActiveTab} />
                <NavButton id="scores" label="Rankings" icon={Trophy} active={activeTab === 'scores'} onClick={setActiveTab} />
                <NavButton id="teams" label="Teams" icon={Shield} active={activeTab === 'teams'} onClick={setActiveTab} />
                <NavButton id="qualis" label="Qualis / Scoring" icon={Radio} active={activeTab === 'qualis'} onClick={setActiveTab} />
                <NavButton id="awards" label="Awards" icon={Trophy} active={activeTab === 'awards'} onClick={setActiveTab} />
                <NavButton id="screens" label="Displays" icon={LayoutDashboard} active={activeTab === 'screens'} onClick={setActiveTab} />
                <NavButton id="users" label="Users / Security" icon={Users} active={activeTab === 'users'} onClick={setActiveTab} />
              </nav>
            </div>
            
            <div className={`p-6 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className={`rounded-xl p-4 border transition-colors ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 italic">Event Status</div>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-500">Total Matches</span>
                        <span className="text-blue-600">--</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-500">Current Phase</span>
                        <span className={`uppercase ${darkMode ? 'text-white' : 'text-slate-900'}`}>Qualifying</span>
                    </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Scrollable */}
          <main className={`flex-1 overflow-y-auto p-8 lg:p-10 transition-colors ${darkMode ? 'bg-slate-950 text-slate-300' : 'bg-slate-100 text-slate-800'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {children}
                </div>
            </div>
          </main>
        </div>
      </div>
    );
}
