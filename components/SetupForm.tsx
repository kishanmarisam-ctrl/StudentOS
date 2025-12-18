import React, { useState, useEffect } from 'react';
import { UserProfile, RoleType, WorkMode, StudentBackground } from '../types';
import { INITIAL_SKILLS, INDIA_LOCATIONS } from '../constants';

interface SetupFormProps {
  onComplete: (profile: UserProfile) => void;
}

const SetupForm: React.FC<SetupFormProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [roleType, setRoleType] = useState<RoleType>(RoleType.INTERN);
  const [background, setBackground] = useState<StudentBackground>(StudentBackground.ENGINEERING);
  
  // Location States
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  
  const [radiusKm, setRadiusKm] = useState(25);
  const [expectedSalary, setExpectedSalary] = useState(300000); // 3 LPA default
  const [salaryError, setSalaryError] = useState<string | null>(null);
  const [mode, setMode] = useState<WorkMode>(WorkMode.LOCAL);
  const [customSkill, setCustomSkill] = useState('');

  // Reset child dropdowns when parent changes
  useEffect(() => {
    setCity('');
    setDistrict('');
  }, [state]);

  useEffect(() => {
    setDistrict('');
  }, [city]);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && customSkill.trim()) {
          e.preventDefault();
          if (!selectedSkills.includes(customSkill.trim())) {
              setSelectedSkills([...selectedSkills, customSkill.trim()]);
          }
          setCustomSkill('');
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Salary Validation
    if (expectedSalary < 1000) {
        setSalaryError("Minimum salary must be at least ₹1,000");
        return;
    }
    if (expectedSalary > 5000000) {
        setSalaryError("Maximum salary allowed is ₹50,00,000");
        return;
    }

    // Logic to find coordinates:
    // 1. Find State object
    const stateObj = INDIA_LOCATIONS.find(s => s.state === state);
    // 2. Find City object
    const cityObj = stateObj?.cities.find(c => c.name === city);
    
    // Default to city lat/lng
    const lat = cityObj?.lat || 0;
    const lng = cityObj?.lng || 0;

    onComplete({
      name,
      skills: selectedSkills,
      roleType,
      state,
      city,
      district,
      location: `${city}, ${state}`, // Legacy support
      radiusKm,
      expectedSalary,
      mode,
      background,
      lat,
      lng
    });
  };

  const selectedStateData = INDIA_LOCATIONS.find(s => s.state === state);
  const selectedCityData = selectedStateData?.cities.find(c => c.name === city);

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-600">
          JobRadar India
        </h1>
        <p className="text-slate-500 mt-2">AI Scout for Indian Students & Freshers</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul Verma"
          />
        </div>

        {/* Student Background */}
        <div>
           <label className="block text-sm font-medium text-slate-700 mb-1">Education Background</label>
           <select 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                value={background}
                onChange={(e) => setBackground(e.target.value as StudentBackground)}
            >
                {Object.values(StudentBackground).map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                ))}
            </select>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Skills (Select or Type)</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {INITIAL_SKILLS.slice(0, 8).map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  selectedSkills.includes(skill)
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
          <input 
            type="text"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={addCustomSkill}
            placeholder="Type skill & press Enter (e.g. Tally, Java)..."
            className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        {/* Location Section - 3 Levels */}
        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 space-y-4">
            <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wide">Location Preferences (India Only)</h3>
            
            {/* Level 1: State */}
            <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">State / UT</label>
                <select
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                >
                    <option value="">-- Select State --</option>
                    {INDIA_LOCATIONS.map(loc => (
                        <option key={loc.state} value={loc.state}>{loc.state}</option>
                    ))}
                </select>
            </div>

            {/* Level 2: City */}
            <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">City</label>
                <select
                    required
                    disabled={!state}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                >
                    <option value="">-- Select City --</option>
                    {selectedStateData?.cities.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                </select>
            </div>

            {/* Level 3: District */}
            <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">District / Area</label>
                <select
                    required
                    disabled={!city}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                >
                    <option value="">-- Select District --</option>
                    {selectedCityData?.districts.map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>
            
            {/* Radius */}
            <div>
                 <label className="block text-xs font-bold text-slate-600 mb-1">Search Radius: {radiusKm} km</label>
                 <input
                    type="range"
                    min="5"
                    max="100"
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                />
            </div>
        </div>

        {/* Role & Mode Row */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Role</label>
                <select 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                    value={roleType}
                    onChange={(e) => setRoleType(e.target.value as RoleType)}
                >
                    {Object.values(RoleType).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Work Mode</label>
                <select 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                    value={mode}
                    onChange={(e) => setMode(e.target.value as WorkMode)}
                >
                    {Object.values(WorkMode).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
        </div>

        {/* Salary */}
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Min. Annual Salary (₹)</label>
             <div className="relative">
                <span className="absolute left-4 top-2 text-slate-500 font-bold">₹</span>
                <input
                    type="number"
                    min="1000"
                    max="5000000"
                    inputMode="numeric"
                    className={`w-full pl-8 pr-4 py-2 border rounded-lg outline-none transition ${
                        salaryError 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                        : 'border-slate-300 focus:ring-2 focus:ring-orange-500'
                    }`}
                    value={expectedSalary}
                    onChange={(e) => {
                        const val = Number(e.target.value);
                        setExpectedSalary(val);
                        
                        // Custom Validation Logic (Immediate Feedback)
                        if (e.target.value !== '' && val < 1000) {
                            setSalaryError("Minimum salary must be at least ₹1,000");
                        } else if (val > 5000000) {
                            setSalaryError("Maximum salary allowed is ₹50,00,000");
                        } else {
                            setSalaryError(null);
                        }
                    }}
                    placeholder="e.g. 300000"
                />
             </div>
             {salaryError ? (
                <p className="text-xs text-red-600 mt-1 font-medium">{salaryError}</p>
             ) : (
                <p className="text-xs text-slate-500 mt-1 text-right">Enter annual salary in INR (₹1,000 – ₹50,00,000)</p>
             )}
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition hover:scale-[1.02] active:scale-95"
        >
          Activate Indian Scout
        </button>
      </form>
    </div>
  );
};

export default SetupForm;