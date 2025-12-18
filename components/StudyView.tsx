import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, DailyTask } from '../types';
import { GoogleGenAI } from '@google/genai';

const INITIAL_TASKS: DailyTask[] = [
  { id: '1', title: 'Deep Work: Core Concepts', status: 'pending', scheduledDay: 'today' },
  { id: '2', title: 'Skill Lab: Practical Exercise', status: 'pending', scheduledDay: 'today' },
  { id: '3', title: 'Review & Retrospection', status: 'pending', scheduledDay: 'today' },
];

const StudyView: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  // 1. Task State Ownership: Initializing from localStorage or defaults
  const [tasks, setTasks] = useState<DailyTask[]>(() => {
    try {
      const saved = localStorage.getItem('studentOS_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });
  
  const [agentMessage, setAgentMessage] = useState('OS Standby. Monitoring focus period.');
  const [timeSpent, setTimeSpent] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDuration, setTaskDuration] = useState('');

  const firstLoad = useRef(true);

  // Sync tasks to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('studentOS_tasks', JSON.stringify(tasks));
    if (!firstLoad.current) {
      setAgentMessage("Plan recalibrated based on your input.");
    }
    firstLoad.current = false;
  }, [tasks]);

  // 2. Agent Interaction: READ-ONLY logic
  useEffect(() => {
    let isMounted = true;
    
    const fetchInsight = async () => {
      // AI logic only reads state, never writes to 'tasks'
      if (!process.env.API_KEY) return;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `StudentOS Agent. Profile: ${profile.name}, Learning: ${profile.background}. 
      Tasks: ${tasks.filter(t => t.status === 'pending' && t.scheduledDay === 'today').map(t => t.title).join(', ')}.
      Write ONE short, calm adjustment message (max 15 words) about the current plan.`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      try {
        const res = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
        clearTimeout(timeoutId);
        if (isMounted) {
          setAgentMessage(res.text.trim());
        }
      } catch (err) {
        if (isMounted) {
          setAgentMessage('System stable. Maintain primary objective.');
        }
      }
    };

    const intervalId = setInterval(() => setTimeSpent(s => s + 1), 60000);
    const agentTimeoutId = setTimeout(fetchInsight, 2000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
      clearTimeout(agentTimeoutId);
    };
  }, [profile.name, profile.background]); // Only refetch if profile changes

  // 3. Functional Task Operations (CRUD)
  const updateTaskStatus = (id: string, status: DailyTask['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const addTask = () => {
    if (!taskTitle.trim()) return;
    const newTask: DailyTask = {
        id: Math.random().toString(36).substr(2, 9),
        title: taskTitle,
        duration: taskDuration || undefined,
        status: 'pending',
        scheduledDay: 'today'
    };
    setTasks(prev => [...prev, newTask]);
    resetForm();
  };

  const replaceTask = (id: string) => {
    if (!taskTitle.trim()) return;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title: taskTitle, duration: taskDuration || undefined } : t));
    resetForm();
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const moveTaskToTomorrow = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, scheduledDay: 'tomorrow' } : t));
  };

  const resetForm = () => {
    setTaskTitle('');
    setTaskDuration('');
    setIsAdding(false);
    setEditingTaskId(null);
  };

  const startEditing = (task: DailyTask) => {
    setTaskTitle(task.title);
    setTaskDuration(task.duration || '');
    setEditingTaskId(task.id);
  };

  const todayTasks = tasks.filter(t => t.scheduledDay === 'today');
  const tomorrowCount = tasks.filter(t => t.scheduledDay === 'tomorrow').length;

  return (
    <div className="space-y-12 w-full animate-in">
      <section className="text-center py-10">
        <div className="text-[100px] sm:text-[130px] font-thin leading-none tracking-tighter text-slate-100 tabular-nums select-none">
          {Math.floor(timeSpent / 60)}h {timeSpent % 60}m
        </div>
        <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase tracking-[0.6em]">Session Clock</p>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-50 pb-4">
          <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Current Plan</h3>
          <div className="flex gap-2">
            {tomorrowCount > 0 && (
                <span className="text-[8px] bg-slate-50 text-slate-300 px-2 py-1 rounded-full font-bold uppercase tracking-widest">Tomorrow: {tomorrowCount}</span>
            )}
            <span className="text-[10px] bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full font-bold uppercase tracking-tight">Today</span>
          </div>
        </div>

        <div className="space-y-4">
          {todayTasks.map(task => (
            <div key={task.id} className={`group p-8 rounded-[40px] border transition-all duration-300 ${
              task.status === 'done' ? 'bg-slate-50 border-slate-50 opacity-40' : 'bg-white border-slate-100 shadow-sm'
            }`}>
              {editingTaskId === task.id ? (
                <div className="flex flex-col gap-4 animate-in">
                    <input 
                        className="bg-transparent text-xl font-bold tracking-tight border-b-2 border-indigo-200 outline-none p-1 w-full"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        autoFocus
                    />
                    <div className="flex justify-between items-center">
                        <input 
                            className="bg-transparent text-[10px] font-bold text-slate-400 outline-none uppercase tracking-widest"
                            placeholder="Duration (e.g. 1h)"
                            value={taskDuration}
                            onChange={(e) => setTaskDuration(e.target.value)}
                        />
                        <div className="flex gap-4">
                             <button onClick={resetForm} className="text-[10px] font-bold uppercase text-slate-400">Cancel</button>
                             <button onClick={() => replaceTask(task.id)} className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">Save Change</button>
                        </div>
                    </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-grow">
                      <span className={`text-xl font-bold tracking-tight block ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.title}
                      </span>
                      {task.duration && <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">{task.duration}</p>}
                  </div>
                  
                  <div className="flex gap-2 self-end sm:self-auto items-center">
                      {task.status === 'pending' ? (
                          <>
                              <button 
                                onClick={() => updateTaskStatus(task.id, 'done')} 
                                className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 border border-indigo-100 px-4 py-2 rounded-full hover:bg-indigo-50 transition-colors"
                              >
                                Done
                              </button>
                              
                              {/* Task Management Actions - Always accessible */}
                              <div className="flex gap-1 animate-in">
                                  <button 
                                    onClick={() => startEditing(task)} 
                                    title="Replace"
                                    className="text-[10px] font-bold uppercase text-slate-400 bg-slate-50 px-3 py-2 rounded-full hover:bg-slate-100 transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => moveTaskToTomorrow(task.id)} 
                                    title="Tomorrow"
                                    className="text-[10px] font-bold uppercase text-slate-400 bg-slate-50 px-3 py-2 rounded-full hover:bg-slate-100 transition-colors"
                                  >
                                    Later
                                  </button>
                                  <button 
                                    onClick={() => removeTask(task.id)} 
                                    title="Remove"
                                    className="text-[10px] font-bold uppercase text-red-400 bg-red-50/50 px-3 py-2 rounded-full hover:bg-red-50 transition-colors"
                                  >
                                    ×
                                  </button>
                              </div>
                          </>
                      ) : (
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">{task.status}</span>
                      )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isAdding ? (
            <div className="p-8 rounded-[40px] border bg-slate-50/50 border-dashed border-slate-200 animate-in">
                <div className="flex flex-col gap-4">
                    <input 
                        className="bg-transparent text-xl font-bold tracking-tight border-b-2 border-slate-300 outline-none focus:border-indigo-400 p-1 w-full"
                        placeholder="Describe objective..."
                        autoFocus
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    />
                    <div className="flex justify-between items-center">
                        <input 
                            className="bg-transparent text-[10px] font-bold text-slate-400 outline-none w-32 uppercase tracking-widest"
                            placeholder="Duration (e.g. 1h)"
                            value={taskDuration}
                            onChange={(e) => setTaskDuration(e.target.value)}
                        />
                        <div className="flex gap-4">
                            <button onClick={resetForm} className="text-[10px] font-bold uppercase text-slate-400">Cancel</button>
                            <button onClick={addTask} className="text-[10px] font-bold uppercase text-indigo-600 tracking-widest bg-white px-6 py-2 rounded-full shadow-sm border border-indigo-50">Add Node</button>
                        </div>
                    </div>
                </div>
            </div>
          ) : (
            <button 
                onClick={() => setIsAdding(true)}
                className="w-full p-8 rounded-[40px] border border-dashed border-slate-100 text-slate-300 text-[10px] font-bold uppercase tracking-[0.5em] hover:border-slate-300 hover:text-slate-500 transition-all flex items-center justify-center gap-2"
            >
                <span className="text-lg">+</span> Inject Task
            </button>
          )}
        </div>
      </section>

      {/* Agent Feedback - Informational Only */}
      <section className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em]">Neural Vector</p>
          </div>
          <p className="text-2xl font-medium italic leading-snug text-slate-100">"{agentMessage}"</p>
        </div>
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full"></div>
      </section>
    </div>
  );
};

export default StudyView;