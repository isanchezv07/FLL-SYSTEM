import { useState, useEffect } from 'react';
import { Trophy, Megaphone, Trash2, Eye, EyeOff, Save, Play, Square, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AwardsSection() {
  const [awardsData, setAwardsData] = useState({ awards: [], announcement: { text: '', active: false }, ceremonyMode: false });
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [awardsRes, teamsRes] = await Promise.all([
        fetch('/api/awards'),
        fetch('/api/teams')
      ]);
      if (awardsRes.ok) {
        const data = await awardsRes.json();
        setAwardsData(data);
      }
      if (teamsRes.ok) {
        const data = await teamsRes.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Error fetching awards data:', error);
    }
  };

  const handleUpdateAward = async (id, data) => {
    try {
      const response = await fetch(`/api/awards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      toast.error('Error al actualizar premio');
    }
  };

  const handleRevealStep = async (award) => {
    if (!award.revealedTitle && !award.revealedWinner) {
      const others = awardsData.awards.filter(a => a.id !== award.id && (a.revealedTitle || a.revealedWinner));
      for (const other of others) {
        await handleUpdateAward(other.id, { revealedTitle: false, revealedWinner: false });
      }
      await handleUpdateAward(award.id, { revealedTitle: true });
      toast.success('Category shown');
    } 
    else if (award.revealedTitle && !award.revealedWinner) {
      await handleUpdateAward(award.id, { revealedWinner: true });
      toast.success('Winner revealed!');
    }
    else {
      await handleUpdateAward(award.id, { revealedTitle: false, revealedWinner: false });
      toast.info('Reveal reset');
    }
  };

  const handleAnnouncementUpdate = async (data) => {
    try {
      const response = await fetch('/api/awards/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        toast.success('Announcement updated');
        fetchData();
      }
    } catch (error) {
      toast.error('Error updating announcement');
    }
  };

  const handleCeremonyToggle = async () => {
    const newMode = !awardsData.ceremonyMode;
    try {
      const response = await fetch('/api/awards/ceremony', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newMode })
      });
      if (response.ok) {
        toast.success(newMode ? 'Ceremony Mode ON' : 'Ceremony Mode OFF');
        fetchData();
      }
    } catch (error) {
      toast.error('Error toggling mode');
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all awards and announcements?')) return;
    try {
      const response = await fetch('/api/awards/reset', { method: 'POST' });
      if (response.ok) {
        toast.success('Registry reset successful');
        fetchData();
      }
    } catch (error) {
      toast.error('Error during reset');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans text-slate-800 dark:text-slate-200 transition-colors">
      {/* Header & Mode Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 transition-colors">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight italic">Awards <span className="text-[#0066B3] dark:text-blue-400">Ceremony</span></h2>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Event Recognition & Protocol Management</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleCeremonyToggle}
            className={`flex items-center gap-3 px-6 py-2.5 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all border shadow-sm ${
              awardsData.ceremonyMode
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {awardsData.ceremonyMode ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {awardsData.ceremonyMode ? 'Stop Ceremony' : 'Start Ceremony'}
          </button>
          
          <button
            onClick={handleReset}
            className="p-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900 transition-all shadow-sm"
            title="Reset All"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 transition-all">
        {/* Awards Registry */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden transition-colors">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-800 dark:bg-black text-white text-[10px] font-bold uppercase tracking-widest transition-colors">
                        <th className="px-6 py-4">Award Category</th>
                        <th className="px-6 py-4">Recipient Assignment</th>
                        <th className="px-6 py-4 text-right">Ceremony Controls</th>
                    </tr>
                </thead>
                <tbody className="divide-y border-slate-100 dark:divide-slate-800 transition-colors">
                    {awardsData?.awards?.map((award) => (
                        <tr key={award.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${award.revealedTitle ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}`}>
                            <td className="px-6 py-4">
                                <div className="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1 italic transition-colors">Registry Category</div>
                                <div className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none transition-colors">{award.name}</div>
                            </td>
                            <td className="px-6 py-4">
                                <select
                                    value={award.teamNumber}
                                    onChange={(e) => {
                                        const team = teams.find(t => t.number === e.target.value);
                                        handleUpdateAward(award.id, { teamNumber: e.target.value, teamName: team ? team.name : '' });
                                    }}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="" className="dark:bg-slate-900">-- No Recipient --</option>
                                    {teams.map(t => (
                                        <option key={t.id} value={t.number} className="dark:bg-slate-900">{t.number} - {t.name}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => handleRevealStep(award)}
                                        disabled={!award.teamNumber}
                                        className={`flex items-center gap-2 px-4 py-2 rounded font-bold uppercase text-[9px] transition-all disabled:opacity-30 ${
                                            award.revealedWinner 
                                            ? 'bg-red-600 text-white shadow-sm' 
                                            : award.revealedTitle
                                                ? 'bg-amber-500 text-white shadow-sm'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {!award.revealedTitle ? (
                                            <><Eye size={12} /> Show Category</>
                                        ) : !award.revealedWinner ? (
                                            <><ChevronRight size={12} /> Reveal Winner</>
                                        ) : (
                                            <><EyeOff size={12} /> Reset Reveal</>
                                        )}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </div>

        {/* Global Announcement */}
        <div className="lg:col-span-1 space-y-6 transition-all">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm transition-colors">
            <h3 className="font-bold uppercase tracking-tight text-xs text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Megaphone className="text-blue-600 dark:text-blue-400 w-4 h-4" />
              Event Broadcast
            </h3>
            
            <div className="space-y-4">
              <textarea
                value={awardsData?.announcement?.text || ''}
                onChange={(e) => setAwardsData({...awardsData, announcement: {...awardsData.announcement, text: e.target.value}})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 min-h-[120px] transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                placeholder="INPUT TELEMETRY MESSAGE..."
              />
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleAnnouncementUpdate({ text: awardsData?.announcement?.text })}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg transition-all shadow-sm"
                  title="Save Protocol"
                >
                  <Save size={16} />
                </button>
                
                <button
                  onClick={() => handleAnnouncementUpdate({ active: !awardsData?.announcement?.active })}
                  className={`flex-1 py-2.5 rounded-lg font-bold uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 border shadow-sm ${
                    awardsData?.announcement?.active
                      ? 'bg-blue-600 border-blue-600 text-white shadow-blue-200'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {awardsData?.announcement?.active ? <EyeOff size={14} /> : <Eye size={14} />}
                  {awardsData?.announcement?.active ? 'Broadcasting' : 'Display'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-lg p-6 shadow-inner transition-colors">
            <h4 className="text-amber-700 dark:text-amber-400 font-bold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2 italic">
              <Trophy size={14} />
              Protocol Guide
            </h4>
            <ol className="text-amber-800 dark:text-amber-300 text-[10px] space-y-3 font-medium leading-relaxed uppercase tracking-tight transition-colors">
              <li className="flex gap-2"><span className="text-amber-400 font-black">01</span> Map Recipient</li>
              <li className="flex gap-2"><span className="text-amber-400 font-black">02</span> Show Category</li>
              <li className="flex gap-2"><span className="text-amber-400 font-black">03</span> Reveal Winner</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
