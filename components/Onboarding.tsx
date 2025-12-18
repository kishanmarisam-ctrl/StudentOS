
import React, { useState } from 'react';
import { UserProfile, StudentBackground, RoleType, WorkMode } from '../types';
import { INDIA_LOCATIONS } from '../constants';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<UserProfile>>({
    skills: [],
    expectedSalary: 400000,
    radiusKm: 50,
    roleType: RoleType.FRESHER,
    mode: WorkMode.LOCAL,
    district: '',
  });

  const next = () => setStep(s => s + 1);

  const renderStep = () => {
    switch(step) {
      case 0:
        return (
          <div className="space-y-8 py-12 animate-in">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Calibration.</h2>
              <p className="text-slate-400 text-sm">Let's set your cognitive profile.</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-300 uppercase">Entity Label</label>
                <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full text-2xl font-medium border-b-2 border-slate-100 focus:border-indigo-500 outline-none py-2 transition-colors bg-transparent"
                    autoFocus
                    onChange={(e) => setData({...data, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-300 uppercase">Academic Vector</label>
                <select
                    className="w-full text-lg border-b-2 border-slate-100 focus:border-indigo-500 outline-none py-2 bg-transparent"
                    onChange={(e) => setData({...data, background: e.target.value as StudentBackground})}
                >
                    <option value="">Select Domain</option>
                    {Object.values(StudentBackground).map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
            </div>
            <button onClick={next} disabled={!data.name || !data.background} className="w-full bg-slate-900 text-white py-4 rounded-3xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-20">Process Vector</button>
          </div>
        );
      case 1:
        return (
          <div className="space-y-8 py-12 animate-in">
             <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Locality.</h2>
              <p className="text-slate-400 text-sm">Coordinate your primary operations center.</p>
            </div>
            <div className="grid grid-cols-1 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-300 uppercase">Region</label>
                  <select
                    className="w-full text-lg border-b-2 border-slate-100 focus:border-indigo-500 outline-none py-2 bg-transparent"
                    onChange={(e) => {
                        const stateName = e.target.value;
                        setData({...data, state: stateName, city: '', district: ''});
                    }}
                    >
                    <option value="">Select State</option>
                    {INDIA_LOCATIONS.map(loc => <option key={loc.state} value={loc.state}>{loc.state}</option>)}
                    </select>
               </div>
               <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-300 uppercase">Node</label>
                <select
                    disabled={!data.state}
                    className="w-full text-lg border-b-2 border-slate-100 focus:border-indigo-500 outline-none py-2 bg-transparent disabled:opacity-30"
                    onChange={(e) => {
                        const cityName = e.target.value;
                        const stateObj = INDIA_LOCATIONS.find(s => s.state === data.state);
                        const cityObj = stateObj?.cities.find(c => c.name === cityName);
                        setData({...data, city: cityName, lat: cityObj?.lat, lng: cityObj?.lng});
                    }}
                    >
                    <option value="">Select City</option>
                    {INDIA_LOCATIONS.find(s => s.state === data.state)?.cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
               </div>
            </div>
            <button onClick={next} disabled={!data.city} className="w-full bg-slate-900 text-white py-4 rounded-3xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-20">Pin Location</button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 py-12 text-center animate-in">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Calibrated.</h2>
              <p className="text-slate-400 text-sm">Your learning profile is set.</p>
            </div>
            <div className="flex justify-center py-8">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-50 border-t-indigo-500 animate-spin"></div>
                    <div className="absolute inset-4 rounded-full bg-slate-50 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                    </div>
                </div>
            </div>
            <button 
              onClick={() => onComplete(data as UserProfile)} 
              className="w-full bg-indigo-600 text-white py-4 rounded-3xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
            >
              Enter Workspace
            </button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md">
        {renderStep()}
      </div>
    </div>
  );
};

export default Onboarding;
