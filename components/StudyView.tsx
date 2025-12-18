
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, DailyTask } from '../types';
import { GoogleGenAI } from '@google/genai';

const INITIAL_TASKS: DailyTask[] = [
  { id: '1', title: 'Deep Work: Core Concepts', status: 'pending', scheduledDay: 'today' },
  { id: '2', title: 'Skill Lab: Practical Exercise', status: 'pending', scheduledDay: 'today' },
  { id: '3', title: 'Review & Retrospection', status: 'pending', scheduledDay: 'today' },
];

const StudyView: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const [tasks, setTasks] = useState<DailyTask[]>(() => {
    const saved = localStorage.getItem('studentOS_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });
  const [agentMessage, setAgentMessage] = useState('Standby. Optimizing session constraints...');
  const [timeSpent, setTimeSpent] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  // Form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDuration, setTaskDuration] = useState('');

  const firstLoad = useRef(true);

  // Sync tasks to local storage and update agent feedback
  useEffect(() => {
    localStorage.setItem('studentOS_tasks', JSON.stringify(tasks));
    if (!firstLoad.current) {
        setAgentMessage("Adjusted plan based on your update.");
    }
    firstLoad.current = false;
  }, [tasks]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchInsight = async () => {
      if (!process.env.API_KEY || !firstLoad.current) return;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `StudentOS Agent. Profile: ${profile.name}, Learning: ${profile.background}. 
      Tasks: ${tasks.filter(t => t.status === 'pending' && t.scheduledDay === 'today').map(t => t.title).join(', ')}.
      Write ONE short, calm adjustment message (max 15 words) based on the tasks. Focus on discipline or focus.`;
      
      try {
        const res = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
        if (isMounted) {
          setAgentMessage(res.text.trim());
        }
      } catch (err) {
        if (isMounted) {
          setAgentMessage('Stay focused on your primary objective today.');
        }
      }
    };

    const timeoutId = setTimeout(fetchInsight, 500);
    const intervalId = setInterval(() => setTimeSpent(s => s + 1), 60000);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

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
    setTasks([...tasks, newTask]);
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

  return (
    <div className="space-y-12 w-full animate-in">
      <section className="text-center py-6">
        <div className="text-[100px] sm:text-[120px] font-thin leading-none tracking-tighter text-slate-100 tabular-nums">
          {Math.floor(timeSpent / 60)}h {timeSpent % 60}m
        </div>
        <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase tracking-[0.4em]">Concentration Period</p>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-50 pb-4">
          <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Priority Nodes</h3>
          <span className="text-[9px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase">Today ({todayTasks.length})</span>
        </div>

        <div className="space-y-4">
          {todayTasks.map(task => (
            <div key={task.id} className={`group p-6 rounded-[32px] border transition-all duration-300 ${
              task.status === 'done' ? 'bg-slate-50 border-slate-50 opacity-40' : 'bg-white border-slate-100 shadow-sm'
            }`}>
              {editingTaskId === task.id ? (
                <div className="flex flex-col gap-3">
                    <input 
                        className="bg-transparent text-lg font-semibold border-b border-indigo-200 outline-none"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        autoFocus
                    />
                    <div className="flex justify-between">
                        <input 
                            className="bg-transparent text-xs text-slate-400 outline-none"
                            placeholder="Duration (e.g. 1h)"
                            value={taskDuration}
                            onChange={(e) => setTaskDuration(e.target.value)}
                        />
                        <div className="flex gap-2">
                             <button onClick={resetForm} className="text-[9px] font-bold uppercase text-slate-400">Cancel</button>
                             <button onClick={() => replaceTask(task.id)} className="text-[9px] font-bold uppercase text-indigo-600">Update</button>
                        </div>
                    </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-grow">
                      <span className={`text-lg font-semibold tracking-tight ${task.status === 'done' ? 'line-through' : ''}`}>
                      {task.title}
                      </span>
                      {task.duration && <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{task.duration}</p>}
                  </div>
                  
                  <div className="flex gap-1.5 self-end sm:self-auto items-center">
                      {task.status === 'pending' ? (
                          <>
                              <button onClick={() => updateTaskStatus(task.id, 'done')} className="text-[9px] font-bold uppercase tracking-wide text-indigo-500 border border-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-colors">Done</button>
                              <div className="flex sm:hidden group-hover:flex gap-1 animate-in">
                                  <button onClick={() => startEditing(task)} className="text-[9px] font-bold uppercase tracking-wide text-slate-400 border border-slate-50 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors">Edit</button>
                                  <button onClick={() => moveTaskToTomorrow(task.id)} className="text-[9px] font-bold uppercase tracking-wide text-slate-300 border border-slate-50 px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors">Later</button>
                                  <button onClick={() => removeTask(task.id)} className="text-[9px] font-bold uppercase tracking-wide text-red-300 border border-red-50 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors">×</button>
                              </div>
                          </>
                      ) : (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">{task.status}</span>
                      )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isAdding ? (
            <div className="p-6 rounded-[32px] border bg-slate-50 border-dashed border-slate-200 animate-in">
                <div className="flex flex-col gap-3">
                    <input 
                        className="bg-transparent text-lg font-semibold border-b border-slate-200 outline-none focus:border-indigo-400"
                        placeholder="Task title..."
                        autoFocus
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    />
                    <div className="flex justify-between items-center">
                        <input 
                            className="bg-transparent text-xs text-slate-400 outline-none w-20"
                            placeholder="Duration (e.g. 1h)"
                            value={taskDuration}
                            onChange={(e) => setTaskDuration(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <button onClick={resetForm} className="text-[9px] font-bold uppercase text-slate-400">Cancel</button>
                            <button onClick={addTask} className="text-[9px] font-bold uppercase text-indigo-600 bg-white px-4 py-1.5 rounded-full shadow-sm">Save</button>
                        </div>
                    </div>
                </div>
            </div>
          ) : (
            <button 
                onClick={() => setIsAdding(true)}
                className="w-full p-4 rounded-full border border-dashed border-slate-100 text-slate-300 text-[10px] font-bold uppercase tracking-widest hover:border-slate-300 hover:text-slate-500 transition-all"
            >
                + Add node to session
            </button>
          )}
        </div>
      </section>

      <section className="bg-slate-900 rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden transition-all duration-700">
        <div className="relative z-10 space-y-2">
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.3em]">Neural Adjustment</p>
          <p className="text-xl font-medium italic leading-relaxed text-slate-200">"{agentMessage}"</p>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-[60px] rounded-full"></div>
      </section>
    </div>
  );
};

export default StudyView;
