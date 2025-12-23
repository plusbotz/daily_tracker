
import { Task, DailyLog, LogStatus, RestTransaction, StreakInfo } from './types';

/**
 * Calculations for the Rest Point Economy
 * Milestone rewards:
 * 15  -> +3 RP
 * 30  -> +6 RP
 * 60  -> +9 RP
 * 90  -> +18 RP
 * 120 -> +36 RP
 * 150 -> +72 RP
 * Pattern after 60: Double previous reward every 30 days
 */
export const calculateMilestoneReward = (streak: number): number => {
  if (streak === 15) return 3;
  if (streak === 30) return 6;
  if (streak === 60) return 9;
  if (streak > 60 && streak % 30 === 0) {
    const steps = (streak - 60) / 30;
    return 9 * Math.pow(2, steps);
  }
  return 0;
};

export const calculateRestCost = (multiplier: number): number => {
  return 10 * multiplier;
};

/**
 * Deterministic Engine to rebuild streaks and calculate RP balance
 */
export const computeEngine = (
  tasks: Task[],
  logs: DailyLog[]
): {
  streaks: Record<string, StreakInfo>;
  rpTransactions: RestTransaction[];
  balance: number;
} => {
  const streaks: Record<string, StreakInfo> = {};
  const rpTransactions: RestTransaction[] = [];
  let balance = 0;

  // Initialize streak info for each task
  tasks.forEach(task => {
    streaks[task.id] = {
      taskId: task.id,
      currentStreak: 0,
      longestStreak: 0,
      totalCompleted: 0,
      totalMissed: 0,
      totalRestUsed: 0
    };
  });

  // Sort logs by date ascending to process chronologically
  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));

  sortedLogs.forEach(log => {
    const task = tasks.find(t => t.id === log.taskId);
    if (!task) return;

    const streakData = streaks[task.id];

    if (log.status === LogStatus.COMPLETED) {
      streakData.currentStreak += 1;
      streakData.totalCompleted += 1;
      if (streakData.currentStreak > streakData.longestStreak) {
        streakData.longestStreak = streakData.currentStreak;
      }

      // Check milestones
      const reward = calculateMilestoneReward(streakData.currentStreak);
      if (reward > 0) {
        const trans: RestTransaction = {
          id: `earn-${log.taskId}-${log.date}`,
          amount: reward,
          type: 'EARNED',
          reason: `Milestone: ${streakData.currentStreak} day streak (${task.name})`,
          date: log.date
        };
        rpTransactions.push(trans);
        balance += reward;
      }
    } else if (log.status === LogStatus.REST_USED) {
      streakData.totalRestUsed += 1;
      // Streak continues, but check if user had enough balance
      const cost = calculateRestCost(task.multiplier);
      const trans: RestTransaction = {
        id: `spend-${log.taskId}-${log.date}`,
        amount: cost,
        type: 'SPENT',
        reason: `Rest usage: ${task.name}`,
        date: log.date
      };
      rpTransactions.push(trans);
      balance -= cost;
      // Streak does not break, does not increment
    } else if (log.status === LogStatus.MISSED) {
      streakData.totalMissed += 1;
      streakData.currentStreak = 0; // Streak resets
    }
  });

  return { streaks, rpTransactions, balance };
};
