import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, MatchResult, StudentBackground } from '../types';
import { MOCK_JOBS } from '../constants';
import { evaluateJob } from '../services/matchingEngine';
import { generateAgentAnalysis } from '../services/geminiService';

const CareerView: React.FC<{ profile: UserProfile }> = ({ profile: initialProfile }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>(initialProfile);
  const [aiSyncing, setAiSyncing] = useState(false);

  const isProfileIncomplete = profile.skills.length === 0;

  // Perform local matching synchronously
  useEffect(() => {
    if (isProfileIncomplete) return;
    
    // Immediate deterministic match
    const results = MOCK_JOBS.map(job => evaluateJob(job, profile))
      .filter((res): res is MatchResult => res !== null);

    const strongMatches = results.filter(r => r.score >= 80).sort((a, b) => b.score - a.score);
    const mediumMatches = results.filter(r => r.score >= 60 && r.score < 80).sort((a, b) => b.score - a.score);
    
    const lastJobId = localStorage.getItem('studentOS_last_job_id');
    let selected: MatchResult | null = null;

    if (strongMatches.length > 0) {
        selected = (strongMatches[0].job.id === lastJobId && strongMatches.length > 1) ? strongMatches[1] : strongMatches[0];
    } else if (mediumMatches.length > 0) {
        const index = new Date().getHours() % mediumMatches.length;
        selected = (mediumMatches[index].job.id === lastJobId && mediumMatches.length > 1) ? mediumMatches[(index + 1) % mediumMatches.length] : mediumMatches[index];
    }

    if (selected) {
      localStorage.setItem('studentOS_last_job_id', selected.job.id);
      const initialMatch = { ...selected, aiAnalysis: 'Syncing OS context...', totalEvaluated: results.length };
      setMatch(initialMatch);

      // Async AI enrichment
      if (process.env.API_KEY) {
        setAiSyncing(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        generateAgentAnalysis(selected, profile).then(analysis => {
          clearTimeout(timeoutId);
          setMatch(prev => prev ? { ...prev, aiAnalysis: analysis } : null);
          setAiSyncing(false);
        }).catch(() => {
          setMatch(prev => prev ? { ...prev, aiAnalysis: 'Recommendation stabilized by local radar.' } : null);
          setAiSyncing(false);
        });
      } else {
        setMatch(prev => prev ? { ...prev, aiAnalysis: 'Local radar match confirmed.' } : null);
      }
    } else {
      setMatch(null);
    }
  }, [profile, isProfileIncomplete]);

  const handleProfileSave = () => {
    setProfile(tempProfile);
    localStorage.setItem('studentOS_profile', JSON.stringify({ ...tempProfile, onboarded: true }));
    setIsEditingProfile(false);
  };

  if (isProfileIncomplete || isEditingProfile) {
    return (
      <div className="space-y-10 animate-in">
        <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.5em]">Calibration</p>
            <h2 className="text-4xl font-black tracking-tighter">Career Scope</h2>
        </div>

        <div className="space-y-8 bg-white p-10 rounded-[48px] border border-slate-100 shadow-xl">
            <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Domain</label>
                <select 
                    className="w-full text-xl font-bold outline-none border-b-2 border-slate-100 focus:border-indigo-400 bg-transparent py-2"
                    value={tempProfile.background}
                    onChange={(e) => setTempProfile({...tempProfile, background: e.target.value as StudentBackground})}
                >
                    {Object.values(StudentBackground).map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
            </div>

            <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skill Stack (Comma Separated)</label>
                <input 
                    className="w-full text-xl font-bold outline-none border-b-2 border-slate-100 focus:border-indigo-400 bg-transparent py-2"
                    placeholder="e.g. React, Python"
                    value={tempProfile.skills.join(', ')}
                    onChange={(e) => setTempProfile({...tempProfile, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})}
                />
            </div>

            <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Reach: {tempProfile.radiusKm} km</label>
                <input 
                    type="range" min="10" max="250" step="10"
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    value={tempProfile.radiusKm}
                    onChange={(e) => setTempProfile({...tempProfile, radiusKm: Number(e.target.value)})}
                />
            </div>

            <button 
                onClick={handleProfileSave}
                className="w-full bg-slate-900 text-white py-5 rounded-[32px] font-bold text-lg hover:bg-indigo-600 shadow-xl shadow-slate-100 transition-all transform active:scale-95"
            >
                Confirm Calibrations
            </button>
            {isEditingProfile && (
                <button onClick={() => setIsEditingProfile(false)} className="w-full text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em] mt-4">Discard</button>
            )}
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-40 space-y-8 animate-in">
        <h2 className="text-7xl font-thin tracking-tighter text-slate-100 select-none">Void.</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed">No high-probability signals detected in current range.</p>
        <button onClick={() => setIsEditingProfile(true)} className="px-8 py-3 bg-slate-50 text-[10px] font-bold text-indigo-500 uppercase tracking-widest rounded-full hover:bg-indigo-50 transition-colors">Broaden Scope</button>
      </div>
    );
  }

  return (
    <div className="space-y-12 w-full animate-in">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.5em]">Primary Target</p>
              {aiSyncing && <span className="text-[8px] font-bold text-indigo-400 animate-pulse">SYNCING...</span>}
            </div>
            <h2 className="text-5xl sm:text-6xl font-black tracking-tighter leading-[0.9] text-slate-900">{match.job.title}</h2>
            <p className="text-2xl text-slate-400 font-bold tracking-tight">{match.job.company}</p>
        </div>
        <button 
            onClick={() => setIsEditingProfile(true)}
            className="text-[9px] font-bold text-slate-400 border border-slate-100 px-4 py-2 rounded-full hover:bg-slate-50 transition-colors uppercase tracking-widest"
        >
            Edit
        </button>
      </div>

      <div className="bg-slate-50/50 px-6 py-3 rounded-full w-fit flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Scanned {match.totalEvaluated} Roles • Showing #1 Rank
        </span>
      </div>

      <div className="grid grid-cols-2 gap-10 py-12 border-y border-slate-50">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Geo node</p>
          <p className="font-bold text-slate-700 text-xl tracking-tight">{match.job.location}</p>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Yield</p>
          <p className="font-bold text-slate-700 text-xl tracking-tight">₹{(match.job.salary / 100000).toFixed(1)}L <span className="text-slate-400 text-xs font-medium">/ annum</span></p>
        </div>
      </div>

      <section className="space-y-6">
        <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.5em]">Agent Intelligence</h3>
        <p className="text-2xl font-medium italic leading-snug text-slate-800">
          "{match.aiAnalysis}"
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {match.missingSkills.length > 0 && (
            <section className="bg-slate-50 p-8 rounded-[48px] space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capability Gaps</h3>
            <div className="flex flex-wrap gap-2">
                {match.missingSkills.map(s => (
                <span key={s} className="px-4 py-2 bg-white border border-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-wide">{s}</span>
                ))}
            </div>
            </section>
        )}
        
        <div className="bg-indigo-50/20 p-8 rounded-[48px] flex flex-col justify-center items-center text-center space-y-2">
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Fit Vector</p>
            <p className={`text-4xl font-black tracking-tighter ${match.probability === 'High' ? 'text-indigo-600' : 'text-slate-500'}`}>
                {match.probability}
            </p>
        </div>
      </div>

      <button
        onClick={() => window.open(match.job.applyUrl, '_blank')}
        className="w-full bg-slate-900 text-white py-8 rounded-[48px] text-xl font-bold shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all transform hover:-translate-y-1 active:scale-[0.98]"
      >
        Initialize Application
      </button>
    </div>
  );
};

export default CareerView;