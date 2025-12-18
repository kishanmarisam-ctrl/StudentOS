import React, { useState, useEffect } from 'react';
import { UserProfile, MatchResult, StudentBackground } from '../types';
import { MOCK_JOBS } from '../constants';
import { evaluateJob } from '../services/matchingEngine';
import { generateAgentAnalysis } from '../services/geminiService';

const CareerView: React.FC<{ profile: UserProfile }> = ({ profile: initialProfile }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>(initialProfile);

  const isProfileIncomplete = profile.skills.length === 0;

  useEffect(() => {
    if (isProfileIncomplete) {
        setLoading(false);
        return;
    }
    
    let isMounted = true;
    const selectBestOpportunity = async () => {
      setLoading(true);
      try {
        // 1. Evaluation & Filtering
        const results = MOCK_JOBS.map(job => evaluateJob(job, profile))
          .filter((res): res is MatchResult => res !== null);

        // 2. Bucketing Logic
        const strongMatches = results.filter(r => r.score >= 80).sort((a, b) => b.score - a.score);
        const mediumMatches = results.filter(r => r.score >= 60 && r.score < 80).sort((a, b) => b.score - a.score);
        
        // 3. Rotation & Memory Logic
        const lastJobId = localStorage.getItem('studentOS_last_job_id');
        let selected: MatchResult | null = null;

        if (strongMatches.length > 0) {
            // Pick top strong, unless it was shown last and there is an alternative strong
            selected = (strongMatches[0].job.id === lastJobId && strongMatches.length > 1) 
                ? strongMatches[1] 
                : strongMatches[0];
        } else if (mediumMatches.length > 0) {
            // Pick a medium match. If multiple, rotate based on current hour to ensure session variety
            const hour = new Date().getHours();
            const index = hour % mediumMatches.length;
            
            selected = (mediumMatches[index].job.id === lastJobId && mediumMatches.length > 1)
                ? mediumMatches[(index + 1) % mediumMatches.length]
                : mediumMatches[index];
        }

        if (selected && isMounted) {
          localStorage.setItem('studentOS_last_job_id', selected.job.id);
          
          setMatch({ 
            ...selected, 
            aiAnalysis: 'Synthesizing recommendation...', 
            totalEvaluated: results.length 
          });
          
          setLoading(false);

          if (process.env.API_KEY) {
            const analysis = await generateAgentAnalysis(selected, profile);
            if (isMounted) {
              setMatch(prev => prev ? { ...prev, aiAnalysis: analysis } : null);
            }
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    };

    // Small delay to simulate "Radar Sweep" feel
    const timer = setTimeout(selectBestOpportunity, 800);
    return () => { 
      isMounted = false; 
      clearTimeout(timer);
    };
  }, [profile, isProfileIncomplete]);

  const handleProfileSave = () => {
    setProfile(tempProfile);
    localStorage.setItem('studentOS_profile', JSON.stringify({ ...tempProfile, onboarded: true }));
    setIsEditingProfile(false);
  };

  if (isProfileIncomplete || isEditingProfile) {
    return (
      <div className="space-y-8 animate-in">
        <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">Calibration</p>
            <h2 className="text-3xl font-bold tracking-tighter">Career Parameters</h2>
        </div>

        <div className="space-y-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Degree / Focus</label>
                <select 
                    className="w-full text-lg font-medium outline-none border-b-2 border-slate-50 focus:border-indigo-400 bg-transparent py-2"
                    value={tempProfile.background}
                    onChange={(e) => setTempProfile({...tempProfile, background: e.target.value as StudentBackground})}
                >
                    {Object.values(StudentBackground).map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Skills (Comma separated)</label>
                <input 
                    className="w-full text-lg font-medium outline-none border-b-2 border-slate-50 focus:border-indigo-400 bg-transparent py-2"
                    placeholder="e.g. React, Java, Sales"
                    value={tempProfile.skills.join(', ')}
                    onChange={(e) => setTempProfile({...tempProfile, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})}
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Job Search Radius: {tempProfile.radiusKm} km</label>
                <input 
                    type="range" min="10" max="200" step="10"
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    value={tempProfile.radiusKm}
                    onChange={(e) => setTempProfile({...tempProfile, radiusKm: Number(e.target.value)})}
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Min Expected Salary (Annual ₹)</label>
                <input 
                    type="number"
                    className="w-full text-lg font-medium outline-none border-b-2 border-slate-50 focus:border-indigo-400 bg-transparent py-2"
                    value={tempProfile.expectedSalary}
                    onChange={(e) => setTempProfile({...tempProfile, expectedSalary: Number(e.target.value)})}
                />
            </div>

            <button 
                onClick={handleProfileSave}
                className="w-full bg-slate-900 text-white py-4 rounded-3xl font-bold hover:bg-indigo-600 transition-all"
            >
                Confirm Calibration
            </button>
            {isEditingProfile && (
                <button onClick={() => setIsEditingProfile(false)} className="w-full text-[10px] font-bold text-slate-300 uppercase mt-2">Discard Changes</button>
            )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6 animate-in">
        <div className="w-12 h-12 rounded-full border-2 border-slate-100 border-t-indigo-500 animate-spin"></div>
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">Executing Radar Sweep</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-32 space-y-6 animate-in">
        <h2 className="text-6xl font-thin tracking-tighter text-slate-100">Zero.</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-balance max-w-xs mx-auto">No roles worth your attention right now.</p>
        <button onClick={() => setIsEditingProfile(true)} className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest underline decoration-2 underline-offset-4">Adjust Search Parameters</button>
      </div>
    );
  }

  return (
    <div className="space-y-10 w-full animate-in">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">Optimized Match</p>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tighter leading-none">{match.job.title}</h2>
            <p className="text-xl text-slate-400 font-medium tracking-tight">{match.job.company}</p>
        </div>
        <button 
            onClick={() => setIsEditingProfile(true)}
            className="text-[9px] font-bold text-slate-300 border border-slate-100 px-3 py-1 rounded-full hover:border-indigo-200 hover:text-indigo-400 transition-colors"
        >
            Edit Profile
        </button>
      </div>

      <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full w-fit">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Evaluated {match.totalEvaluated} opportunities. Showing the best available match.
        </span>
      </div>

      <div className="grid grid-cols-2 gap-8 py-10 border-y border-slate-50">
        <div className="space-y-1">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Geo Node</p>
          <p className="font-semibold text-slate-600 text-lg">{match.job.location}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Yield / Year</p>
          <p className="font-semibold text-slate-600 text-lg">₹{(match.job.salary / 100000).toFixed(1)}L</p>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">OS Recommendation</h3>
        <p className="text-xl text-slate-700 leading-relaxed font-medium italic">
          {match.aiAnalysis}
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {match.missingSkills.length > 0 && (
            <section className="bg-slate-50 p-6 rounded-[40px] space-y-3">
            <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Competency Gaps</h3>
            <div className="flex flex-wrap gap-2">
                {match.missingSkills.map(s => (
                <span key={s} className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-wide">{s}</span>
                ))}
            </div>
            </section>
        )}
        
        <div className="bg-indigo-50/30 p-6 rounded-[40px] flex flex-col justify-center items-center text-center space-y-1">
            <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-[0.3em]">Fit Probability</p>
            <p className={`text-2xl font-black ${match.probability === 'High' ? 'text-indigo-600' : 'text-slate-400'}`}>
                {match.probability}
            </p>
        </div>
      </div>

      <button
        onClick={() => window.open(match.job.applyUrl, '_blank')}
        className="w-full bg-slate-900 text-white py-6 rounded-[40px] text-lg font-bold shadow-2xl hover:bg-indigo-600 transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98]"
      >
        Initiate Application
      </button>
    </div>
  );
};

export default CareerView;