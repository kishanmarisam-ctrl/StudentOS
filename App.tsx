import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import StudyView from './components/StudyView';
import CareerView from './components/CareerView';
import { UserProfile, StudentMode } from './types';

const getSavedProfile = (): UserProfile | null => {
  try {
    const saved = localStorage.getItem('studentOS_profile');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(getSavedProfile);
  const [mode, setMode] = useState<StudentMode>(StudentMode.STUDY);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    const fullProfile = { ...newProfile, onboarded: true };
    setProfile(fullProfile);
    localStorage.setItem('studentOS_profile', JSON.stringify(fullProfile));
  };

  const resetProfile = () => {
    localStorage.removeItem('studentOS_profile');
    setProfile(null);
    setMode(StudentMode.STUDY);
  };

  const showOnboarding = !profile || !profile.onboarded;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 font-sans flex flex-col">
      {/* Environment Status Banner */}
      <div className="w-full bg-slate-50 border-b border-slate-100 py-1.5 px-4 flex justify-between items-center z-50">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
          StudentOS v1.0 • {showOnboarding ? 'CALIBRATION' : mode.toUpperCase()}
        </span>
        <div className="flex items-center gap-1.5">
          {!process.env.API_KEY && (
            <span className="text-[8px] font-bold text-orange-400 border border-orange-100 px-1.5 py-0.5 rounded">OFFLINE MODE</span>
          )}
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
      </div>

      {!showOnboarding && (
        <nav className="max-w-2xl w-full mx-auto px-6 pt-10 pb-6 flex flex-col items-center gap-6">
          <h1 className="text-2xl font-black tracking-tighter text-slate-900">StudentOS</h1>
          
          <div className="flex items-center bg-slate-100/50 p-1 rounded-full border border-slate-100 shadow-sm w-56">
            <button
              onClick={() => setMode(StudentMode.STUDY)}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all ${
                mode === StudentMode.STUDY ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Study
            </button>
            <button
              onClick={() => setMode(StudentMode.CAREER)}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all ${
                mode === StudentMode.CAREER ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Career
            </button>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main className="flex-grow max-w-2xl w-full mx-auto px-6 pb-20 animate-in">
        {showOnboarding ? (
          <Onboarding onComplete={handleOnboardingComplete} />
        ) : (
          <div className="w-full">
            {mode === StudentMode.STUDY ? (
              <StudyView profile={profile} />
            ) : (
              <CareerView profile={profile} />
            )}
          </div>
        )}
      </main>

      {/* Persistent Reset Control */}
      <footer className="w-full flex justify-center py-8 bg-white border-t border-slate-50">
        <button onClick={resetProfile} className="text-[8px] uppercase tracking-[0.5em] text-slate-200 hover:text-slate-400 transition-colors font-bold">
          System Factory Reset
        </button>
      </footer>
    </div>
  );
};

export default App;