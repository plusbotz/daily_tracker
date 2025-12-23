
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Settings, 
  Zap, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Trash2,
  Calendar
} from 'lucide-react';
import { Task, DailyLog, LogStatus, TaskCategory } from './types';
import { computeEngine, calculateRestCost } from './engine';
import TrackerView from './components/TrackerView';
import TaskManager from './components/TaskManager';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tracker' | 'dashboard' | 'tasks'>('tracker');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Load persistence
  useEffect(() => {
    const savedTasks = localStorage.getItem('sf_tasks');
    const savedLogs = localStorage.getItem('sf_logs');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  // Save persistence
  useEffect(() => {
    localStorage.setItem('sf_tasks', JSON.stringify(tasks));
    localStorage.setItem('sf_logs', JSON.stringify(logs));
  }, [tasks, logs]);

  // Derived state from engine
  const { streaks, rpTransactions, balance } = useMemo(() => computeEngine(tasks, logs), [tasks, logs]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    setLogs(logs.filter(l => l.taskId !== id));
  };

  const toggleLog = (taskId: string, date: string) => {
    const existingIndex = logs.findIndex(l => l.taskId === taskId && l.date === date);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (existingIndex > -1) {
      const currentStatus = logs[existingIndex].status;
      let nextStatus: LogStatus = LogStatus.PENDING;

      if (currentStatus === LogStatus.COMPLETED) {
        // Try REST if balance is enough
        const cost = calculateRestCost(task.multiplier);
        if (balance >= cost) {
          nextStatus = LogStatus.REST_USED;
        } else {
          nextStatus = LogStatus.MISSED;
        }
      } else if (currentStatus === LogStatus.REST_USED) {
        nextStatus = LogStatus.MISSED;
      } else if (currentStatus === LogStatus.MISSED) {
        nextStatus = LogStatus.PENDING;
      } else {
        nextStatus = LogStatus.COMPLETED;
      }

      if (nextStatus === LogStatus.PENDING) {
        setLogs(logs.filter((_, i) => i !== existingIndex));
      } else {
        const newLogs = [...logs];
        newLogs[existingIndex].status = nextStatus;
        setLogs(newLogs);
      }
    } else {
      setLogs([...logs, { taskId, date, status: LogStatus.COMPLETED }]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-950 text-gray-100">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-20 lg:w-64 bg-gray-900 border-r border-gray-800 flex md:flex-col items-center py-4 px-2 md:py-8 sticky top-0 z-50">
        <div className="hidden lg:flex items-center gap-3 px-4 mb-10 w-full">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">StreakFlow</span>
        </div>
        
        <div className="flex-1 flex md:flex-col gap-2 w-full px-2">
          <button 
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all w-full ${activeTab === 'tracker' ? 'bg-indigo-600/10 text-indigo-400' : 'hover:bg-gray-800 text-gray-400'}`}
          >
            <CheckSquare className="w-6 h-6" />
            <span className="hidden lg:block font-medium">Daily Tracker</span>
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all w-full ${activeTab === 'dashboard' ? 'bg-indigo-600/10 text-indigo-400' : 'hover:bg-gray-800 text-gray-400'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="hidden lg:block font-medium">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-4 p-3 rounded-xl transition-all w-full ${activeTab === 'tasks' ? 'bg-indigo-600/10 text-indigo-400' : 'hover:bg-gray-800 text-gray-400'}`}
          >
            <Settings className="w-6 h-6" />
            <span className="hidden lg:block font-medium">Manage Tasks</span>
          </button>
        </div>

        <div className="hidden md:flex flex-col gap-4 mt-auto w-full px-4 py-6 border-t border-gray-800">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Rest Pool</span>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-black ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {balance}
              </span>
              <span className="text-xs text-gray-400">RP</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {activeTab === 'tracker' && (
          <TrackerView 
            tasks={tasks} 
            logs={logs} 
            onToggle={toggleLog} 
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            streaks={streaks}
            balance={balance}
          />
        )}
        {activeTab === 'tasks' && (
          <TaskManager 
            tasks={tasks} 
            onAdd={addTask} 
            onDelete={deleteTask} 
            onUpdate={updateTask} 
          />
        )}
        {activeTab === 'dashboard' && (
          <Dashboard 
            tasks={tasks} 
            logs={logs} 
            streaks={streaks} 
            balance={balance} 
            transactions={rpTransactions}
          />
        )}
      </main>
    </div>
  );
};

export default App;
