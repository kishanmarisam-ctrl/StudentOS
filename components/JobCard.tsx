import React, { useState } from 'react';
import { MatchResult } from '../types';

interface JobCardProps {
  result: MatchResult;
}

const JobCard: React.FC<JobCardProps> = ({ result }) => {
  const { job, score, probability, aiAnalysis, missingSkills } = result;
  const [isApplying, setIsApplying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (s >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getProbColor = (p: string) => {
      if (p === 'High') return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white';
      if (p === 'Medium') return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white';
      return 'bg-slate-200 text-slate-600';
  }

  // INR Formatter
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent clicks
    
    setIsApplying(true);
    setFeedback(null);

    // UX delay for tactile feel (150ms)
    setTimeout(() => {
        setIsApplying(false);
        if (job.applyUrl) {
            window.open(job.applyUrl, "_blank", "noopener,noreferrer");
        } else {
            setFeedback("External application link not available for this listing.");
            // Auto-hide error after 4 seconds
            setTimeout(() => setFeedback(null), 4000);
        }
    }, 150);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-slate-50 relative">
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${getProbColor(probability)}`}>
                {probability} Probability
            </div>
            <div className={`px-2 py-1 rounded-md text-sm font-bold border ${getScoreColor(score)}`}>
                {score}% Match
            </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 pr-24 leading-tight">{job.title}</h3>
        <p className="text-slate-500 font-medium">{job.company}</p>
        
        <div className="mt-4 flex flex-wrap gap-y-2 items-center text-sm text-slate-600">
            <div className="flex items-center mr-4">
                <svg className="w-4 h-4 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {job.isRemote ? 'Remote (India)' : `${job.location} (${job.distanceKm}km)`}
            </div>
            <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {formatINR(job.salary)}/yr
            </div>
        </div>
      </div>

      {/* Agent Analysis */}
      <div className="p-5 bg-indigo-50/50 flex-grow">
        <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                </div>
            </div>
            <div>
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide mb-1">Agent Explanation</h4>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                    "{aiAnalysis || 'Analyzing...'}"
                </p>
            </div>
        </div>
      </div>

      {/* Skills Gap */}
      {missingSkills.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-red-50/30">
             <div className="flex items-center justify-between mb-2">
                 <h4 className="text-xs font-bold text-red-800 uppercase tracking-wide">Skill Gap Detected</h4>
             </div>
             <div className="flex flex-wrap gap-2">
                 {missingSkills.map(skill => (
                     <span key={skill} className="px-2 py-1 bg-white border border-red-200 text-red-600 text-xs rounded-md font-medium">
                         Missing: {skill}
                     </span>
                 ))}
             </div>
             <p className="mt-2 text-xs text-slate-500">Learning these could improve your score significantly.</p>
          </div>
      )}
      
      {/* Actions */}
      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <button 
            onClick={handleApply}
            disabled={isApplying}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm transform active:scale-95 flex items-center justify-center gap-2 ${
                isApplying ? 'bg-slate-700 scale-95 cursor-wait' : 'bg-slate-900 hover:bg-slate-800 text-white'
            } text-white`}
        >
            {isApplying && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {isApplying ? 'Opening Application...' : 'Apply Now'}
        </button>
        
        {feedback && (
             <div className="mt-3 text-center animate-pulse">
                <span className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100 inline-block">
                    {feedback}
                </span>
             </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;