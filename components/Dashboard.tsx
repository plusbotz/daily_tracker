
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, 
  ResponsiveContainer, 
  PieChart, Pie, Cell,
  LineChart, Line,
  AreaChart, Area
} from 'recharts';
import { format, subDays, startOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { Task, DailyLog, StreakInfo, RestTransaction, LogStatus } from '../types';
import { Trophy, TrendingUp, Wallet, Flame } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  logs: DailyLog[];
  streaks: Record<string, StreakInfo>;
  balance: number;
  transactions: RestTransaction[];
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

const Dashboard: React.FC<DashboardProps> = ({ tasks, logs, streaks, balance, transactions }) => {
  
  // 1. Productivity Score (Importance Weighted)
  const stats = useMemo(() => {
    let totalPossible = 0;
    let totalActual = 0;
    
    tasks.forEach(task => {
      const streak = streaks[task.id];
      if (!streak) return;
      
      // Weight by multiplier
      totalActual += (streak.totalCompleted * task.multiplier);
      // Total possible is harder to calculate exactly without full schedule history, 
      // but we can estimate based on total logs exists or streak resets.
      // Let's use a simpler "Current Performance Efficiency"
    });

    const completionRate = logs.length > 0 
      ? (logs.filter(l => l.status === LogStatus.COMPLETED).length / logs.length) * 100 
      : 0;

    return { completionRate };
  }, [tasks, logs, streaks]);

  // 2. Category Pie Chart Data
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(t => {
      const streak = streaks[t.id];
      if (!streak) return;
      counts[t.category] = (counts[t.category] || 0) + streak.totalCompleted;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks, streaks]);

  // 3. Weekly Trend (Last 7 Days)
  const weeklyTrend = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = logs.filter(l => l.date === dateStr && l.status === LogStatus.COMPLETED).length;
      return {
        name: format(date, 'EEE'),
        completed: count
      };
    });
  }, [logs]);

  // 4. RP History
  const rpTrend = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const date = subDays(new Date(), 13 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const earned = transactions
        .filter(t => t.date === dateStr && t.type === 'EARNED')
        .reduce((sum, t) => sum + t.amount, 0);
      const spent = transactions
        .filter(t => t.date === dateStr && t.type === 'SPENT')
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        date: format(date, 'MMM d'),
        earned,
        spent
      };
    });
  }, [transactions]);

  // 5. Leaderboard (Streaks)
  // Fix: Explicitly cast Object.values(streaks) to StreakInfo[] to resolve 'unknown' type errors
  const leaderboard = (Object.values(streaks) as StreakInfo[])
    .sort((a, b) => b.currentStreak - a.currentStreak)
    .slice(0, 5)
    .map(s => ({
      name: tasks.find(t => t.id === s.taskId)?.name || 'Unknown',
      streak: s.currentStreak,
      longest: s.longestStreak
    }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-bold">Command Center</h1>
        <p className="text-gray-400 mt-1">Real-time performance analytics engine.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-lg hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Success</span>
          </div>
          <div className="text-3xl font-black">{Math.round(stats.completionRate)}%</div>
          <div className="text-xs text-gray-500 mt-1 font-bold">Total Completion Rate</div>
        </div>
        
        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-lg hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-500/10 p-2 rounded-xl text-amber-400">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Wealth</span>
          </div>
          <div className="text-3xl font-black">{balance} RP</div>
          <div className="text-xs text-gray-500 mt-1 font-bold">Rest Pool Balance</div>
        </div>

        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-lg hover:border-green-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500/10 p-2 rounded-xl text-green-400">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hottest</span>
          </div>
          {/* Fix: Explicitly cast Object.values(streaks) to StreakInfo[] to resolve 'unknown' type errors */}
          <div className="text-3xl font-black">{Math.max(...(Object.values(streaks) as StreakInfo[]).map(s => s.currentStreak), 0)}d</div>
          <div className="text-xs text-gray-500 mt-1 font-bold">Longest Active Streak</div>
        </div>

        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-lg hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500/10 p-2 rounded-xl text-purple-400">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Milestones</span>
          </div>
          <div className="text-3xl font-black">{transactions.filter(t => t.type === 'EARNED').length}</div>
          <div className="text-xs text-gray-500 mt-1 font-bold">Streak Rewards Claimed</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Completion Bar Chart */}
        <div className="lg:col-span-2 bg-gray-900 rounded-3xl border border-gray-800 p-8">
          <h3 className="text-lg font-bold mb-8">Weekly Completion Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#1f2937'}}
                  contentStyle={{backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px'}}
                />
                <Bar dataKey="completed" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Performance Pie Chart */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-8">
          <h3 className="text-lg font-bold mb-8 text-center">Workload Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {categoryData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                <span className="text-[10px] text-gray-500 font-bold uppercase">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RP Economy History Line Chart */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-8">
          <h3 className="text-lg font-bold mb-8">Rest Point Economy</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rpTrend}>
                <defs>
                  <linearGradient id="colorEarned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                <Tooltip 
                   contentStyle={{backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px'}}
                />
                <Area type="monotone" dataKey="earned" stroke="#10b981" fillOpacity={1} fill="url(#colorEarned)" strokeWidth={3} />
                <Area type="monotone" dataKey="spent" stroke="#ef4444" fillOpacity={1} fill="url(#colorSpent)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Longest Streak Leaderboard */}
        <div className="bg-gray-900 rounded-3xl border border-gray-800 p-8">
          <h3 className="text-lg font-bold mb-8">Current Leaderboard</h3>
          <div className="space-y-4">
            {leaderboard.map((item, i) => (
              <div key={item.name} className="flex items-center gap-4 bg-gray-800/30 p-4 rounded-2xl border border-gray-800/50">
                <div className="text-2xl font-black text-gray-700 w-8">{i + 1}</div>
                <div className="flex-1">
                  <div className="font-bold">{item.name}</div>
                  <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">All-time record: {item.longest}d</div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-black text-indigo-400">{item.streak}d</div>
                  <div className="text-[10px] text-indigo-500 font-bold uppercase">Current</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
