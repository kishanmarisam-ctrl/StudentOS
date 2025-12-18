import React from 'react';

interface AgentStatusProps {
  status: 'idle' | 'scanning' | 'analyzing' | 'finished';
  message: string;
}

const AgentStatus: React.FC<AgentStatusProps> = ({ status, message }) => {
  if (status === 'idle') return null;

  return (
    <div className="w-full bg-white border border-blue-100 rounded-xl p-6 shadow-sm mb-6 flex items-center space-x-4">
      <div className="relative flex-shrink-0">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${status === 'finished' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
           {status === 'finished' ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
             </svg>
           ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${status !== 'finished' ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
           )}
        </div>
        {status !== 'finished' && (
             <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
             </span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Agent Status</h3>
        <p className="text-lg font-medium text-slate-900 animate-pulse-slow">{message}</p>
      </div>
    </div>
  );
};

export default AgentStatus;
