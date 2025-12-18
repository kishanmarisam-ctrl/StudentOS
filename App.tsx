import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import StudyView from './components/StudyView';
import CareerView from './components/CareerView';
import { UserProfile, StudentMode } from './types';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mode, setMode] = useState<StudentMode>(StudentMode.STUDY);

  useEffect(() => {
    // Immediate state restoration
    try {
      const saved = localStorage.getItem('studentOS_profile');
      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    }
    setIsInitializing(false);
  }, []);

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

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-400 font-medium">
        System Initializing...
      </div>
    );
  }

  const showOnboarding = !profile || !profile.onboarded;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 font-sans flex flex-col">
      {/* Debug Mode Banner - Required for visibility check */}
      <div className="w-full bg-slate-50 border-b border-slate-100 py-1.5 px-4 flex justify-between items-center z-50">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Environment: {showOnboarding ? 'Onboarding' : `Active / Mode: ${mode}`}
        </span>
        <div className="flex gap-2">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      </div>

      {!showOnboarding && (
        <nav className="max-w-2xl w-full mx-auto px-6 pt-8 pb-4 flex flex-col items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-300">StudentOS</h1>
          
          <div className="flex items-center bg-slate-50 p-1 rounded-full border border-slate-100 shadow-sm w-48">
            <button
              onClick={() => setMode(StudentMode.STUDY)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
                mode === StudentMode.STUDY ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Study
            </button>
            <button
              onClick={() => setMode(StudentMode.CAREER)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
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
          <div className="w-full h-full">
            {mode === StudentMode.STUDY ? (
              <StudyView profile={profile} />
            ) : (
              <CareerView profile={profile} />
            )}
          </div>
        )}
      </main>

      {/* Subtle Reset Link */}
      <footer className="w-full flex justify-center py-6 bg-white">
        <button onClick={resetProfile} className="text-[9px] uppercase tracking-[0.3em] text-slate-300 hover:text-slate-500 transition-colors font-bold">
          Purge Environment
        </button>
      </footer>
    </div>
  );
};

export default App;