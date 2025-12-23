
export type TaskCategory = 'Gym' | 'Content' | 'Study' | 'Health' | 'Business' | 'Other';

export enum LogStatus {
  COMPLETED = 'COMPLETED',
  MISSED = 'MISSED',
  REST_USED = 'REST_USED',
  PENDING = 'PENDING'
}

export interface Task {
  id: string;
  name: string;
  category: TaskCategory;
  activeDays: number[]; // 0-6 (Sun-Sat)
  multiplier: number;
  status: 'active' | 'paused';
  createdAt: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  taskId: string;
  status: LogStatus;
}

export interface RestTransaction {
  id: string;
  amount: number;
  type: 'EARNED' | 'SPENT';
  reason: string;
  date: string;
}

export interface StreakInfo {
  taskId: string;
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  totalMissed: number;
  totalRestUsed: number;
}

export interface DashboardStats {
  totalRP: number;
  earnedRP: number;
  spentRP: number;
  productivityScore: number;
  completionRate: number;
}
