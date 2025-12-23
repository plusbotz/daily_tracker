
import React from 'react';
import { format, startOfWeek, addDays, isSameDay, subDays, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Zap, CheckCircle2, XCircle, Moon } from 'lucide-react';
import { Task, DailyLog, LogStatus, StreakInfo } from '../types';

interface TrackerViewProps {
  tasks: Task[];
  logs: DailyLog[];
  onToggle: (taskId: string, date: string) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  streaks: Record<string, StreakInfo>;
  balance: number;
}

const TrackerView: React.FC<TrackerViewProps> = ({ 
  tasks, logs, onToggle, currentDate, setCurrentDate, streaks, balance 
}) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const getStatus = (taskId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return logs.find(l => l.taskId === taskId && l.date === dateStr)?.status || LogStatus.PENDING;
  };

  const isActiveDay = (task: Task, date: Date) => {
    const dayIndex = date.getDay(); // 0 is Sun, 1 is Mon...
    return task.activeDays.includes(dayIndex);
  };

  const renderStatusIcon = (status: LogStatus) => {
    switch (status) {
      case LogStatus.COMPLETED: return <CheckCircle2 className="w-6 h-6 text-indigo-400" />;
      case LogStatus.MISSED: return <XCircle className="w-6 h-6 text-red-500" />;
      case LogStatus.REST_USED: return <Moon className="w-6 h-6 text-amber-400 fill-amber-400/20" />;
      default: return <div className="w-6 h-6 rounded-full border-2 border-gray-700" />;
    }
  };

  const activeTasks = tasks.filter(t => t.status === 'active');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Daily Tracking</h1>
          <p className="text-gray-400 mt-1">Focus on today. Maintain the streak.</p>
        </div>
        <div className="flex items-center bg-gray-900 rounded-xl p-1 border border-gray-800">
          <button 
            onClick={() => setCurrentDate(subDays(currentDate, 7))}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-6 font-semibold min-w-[180px] text-center">
            {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </div>
          <button 
            onClick={() => setCurrentDate(addDays(currentDate, 7))}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {activeTasks.length === 0 ? (
        <div className="bg-gray-900/50 border-2 border-dashed border-gray-800 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
          <div className="bg-gray-800 p-4 rounded-2xl mb-4">
            <Zap className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-xl font-bold">No active tasks</h3>
          <p className="text-gray-500 mt-2 max-w-xs">Head over to Manage Tasks to create your first goal.</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/50">
                  <th className="p-6 font-bold text-sm uppercase tracking-widest text-gray-500">Task Details</th>
                  {days.map(day => (
                    <th key={day.toISOString()} className={`p-6 text-center ${isSameDay(day, new Date()) ? 'bg-indigo-500/5' : ''}`}>
                      <div className="text-xs uppercase font-bold tracking-tighter text-gray-500 mb-1">
                        {format(day, 'EEE')}
                      </div>
                      <div className={`text-xl font-bold ${isSameDay(day, new Date()) ? 'text-indigo-400' : ''}`}>
                        {format(day, 'd')}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {activeTasks.map(task => (
                  <tr key={task.id} className="group hover:bg-gray-800/20 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-10 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]`} />
                        <div>
                          <h4 className="font-bold text-lg leading-tight">{task.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 font-medium">
                              {task.category}
                            </span>
                            <span className="text-xs text-indigo-400 font-bold uppercase tracking-wide">
                              {task.multiplier}x
                            </span>
                            <span className="text-xs text-green-500 font-bold">
                              {streaks[task.id]?.currentStreak || 0}d streak
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    {days.map(day => {
                      const active = isActiveDay(task, day);
                      const status = getStatus(task.id, day);
                      return (
                        <td key={day.toISOString()} className={`p-6 text-center ${isSameDay(day, new Date()) ? 'bg-indigo-500/5' : ''}`}>
                          {active ? (
                            <button 
                              onClick={() => onToggle(task.id, format(day, 'yyyy-MM-dd'))}
                              className="inline-flex items-center justify-center p-2 rounded-xl hover:bg-gray-800 transition-all active:scale-95"
                            >
                              {renderStatusIcon(status)}
                            </button>
                          ) : (
                            <div className="text-gray-700 text-xs font-bold uppercase tracking-widest opacity-30 select-none">
                              Rest
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend & Summary */}
      <footer className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex items-center gap-4">
          <div className="bg-green-500/10 p-3 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-bold uppercase">Today's Progress</div>
            <div className="text-xl font-bold">
              {logs.filter(l => isSameDay(parseISO(l.date), new Date()) && l.status === LogStatus.COMPLETED).length} / {activeTasks.filter(t => isActiveDay(t, new Date())).length} Tasks
            </div>
          </div>
        </div>
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex items-center gap-4">
          <div className="bg-amber-500/10 p-3 rounded-xl">
            <Moon className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-bold uppercase">Rest Pool Balance</div>
            <div className="text-xl font-bold">{balance} RP Available</div>
          </div>
        </div>
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 flex items-center gap-2 text-sm text-gray-400">
           <div className="flex flex-col gap-1 w-full">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Click to toggle: <span className="text-gray-100 font-medium">Done → Rest → Miss → Undo</span></span>
             </div>
             <p className="text-xs opacity-60">Rest costs (10 RP × Multiplier). Streaks never break on rest days.</p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default TrackerView;
