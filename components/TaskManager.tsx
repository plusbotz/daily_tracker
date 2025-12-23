
import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Shield, Activity, Calendar } from 'lucide-react';
import { Task, TaskCategory } from '../types';

interface TaskManagerProps {
  tasks: Task[];
  onAdd: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

const CATEGORIES: TaskCategory[] = ['Gym', 'Content', 'Study', 'Health', 'Business', 'Other'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, onAdd, onDelete, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    category: 'Other' as TaskCategory,
    activeDays: [1, 2, 3, 4, 5],
    multiplier: 1,
    status: 'active' as const
  });

  const handleAdd = () => {
    if (!newTask.name) return;
    onAdd(newTask);
    setIsAdding(false);
    setNewTask({
      name: '',
      category: 'Other',
      activeDays: [1, 2, 3, 4, 5],
      multiplier: 1,
      status: 'active'
    });
  };

  const toggleDay = (dayIndex: number) => {
    const newDays = newTask.activeDays.includes(dayIndex)
      ? newTask.activeDays.filter(d => d !== dayIndex)
      : [...newTask.activeDays, dayIndex];
    setNewTask({ ...newTask, activeDays: newDays });
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goal Architect</h1>
          <p className="text-gray-400 mt-1">Design your habits. Set the priority.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/40"
        >
          <Plus className="w-5 h-5" />
          <span>New Habit</span>
        </button>
      </header>

      {isAdding && (
        <div className="bg-gray-900 border border-indigo-500/30 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Shield className="w-32 h-32 text-indigo-500" />
          </div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-400" />
            Define Task Parameters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Task Name</label>
                <input 
                  type="text" 
                  value={newTask.name}
                  onChange={e => setNewTask({...newTask, name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. Morning Deep Work"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                  <select 
                    value={newTask.category}
                    onChange={e => setNewTask({...newTask, category: e.target.value as TaskCategory})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Multiplier</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={newTask.multiplier}
                    onChange={e => setNewTask({...newTask, multiplier: Number(e.target.value)})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Schedule</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day, i) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(i)}
                    className={`flex-1 py-3 px-2 rounded-xl border font-bold text-sm transition-all ${
                      newTask.activeDays.includes(i) 
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-inner' 
                        : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-500'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 italic mt-2">
                Importance Multiplier affects productivity score weighting and rest point costs.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button 
              onClick={() => setIsAdding(false)}
              className="px-6 py-3 font-bold text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleAdd}
              className="px-10 py-3 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-500 transition-all flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              Build Habit
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tasks.map(task => (
          <div key={task.id} className="bg-gray-900 border border-gray-800 rounded-3xl p-6 group hover:border-indigo-500/50 transition-all shadow-xl">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold">{task.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${task.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-800 text-gray-500'}`}>
                    {task.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{task.category}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-700" />
                  <span className="text-sm font-bold text-indigo-400">{task.multiplier}x Priority</span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onUpdate(task.id, { status: task.status === 'active' ? 'paused' : 'active' })}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-indigo-400 transition-colors"
                  title={task.status === 'active' ? 'Pause' : 'Activate'}
                >
                  <Activity className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onDelete(task.id)}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-1.5">
                {DAYS.map((day, i) => (
                  <div 
                    key={day}
                    className={`flex-1 h-1.5 rounded-full ${task.activeDays.includes(i) ? 'bg-indigo-500' : 'bg-gray-800'}`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                <span>Schedule</span>
                <span className="text-gray-400">{task.activeDays.length} Days / Week</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskManager;
