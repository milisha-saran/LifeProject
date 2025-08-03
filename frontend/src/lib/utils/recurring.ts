import { type FrequencyType } from '@/types/recurring';

export const getFrequencyLabel = (frequencyType: FrequencyType, frequencyValue: number): string => {
  switch (frequencyType) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'biweekly':
      return 'Biweekly';
    case 'monthly':
      return 'Monthly';
    case 'custom':
      return `Every ${frequencyValue} day${frequencyValue > 1 ? 's' : ''}`;
    default:
      return 'Unknown';
  }
};

export const isOverdue = (nextDueDate: string): boolean => {
  const today = new Date();
  const dueDate = new Date(nextDueDate);
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
};

export const isDueToday = (nextDueDate: string): boolean => {
  const today = new Date();
  const dueDate = new Date(nextDueDate);
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate.getTime() === today.getTime();
};

export const getDaysUntilDue = (nextDueDate: string): number => {
  const today = new Date();
  const dueDate = new Date(nextDueDate);
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatTimeEstimate = (etaHours?: number): string => {
  if (!etaHours) return '';
  
  if (etaHours < 1) {
    const minutes = Math.round(etaHours * 60);
    return `${minutes}m`;
  } else if (etaHours === 1) {
    return '1h';
  } else if (etaHours < 24) {
    const hours = Math.floor(etaHours);
    const minutes = Math.round((etaHours - hours) * 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  } else {
    const days = Math.floor(etaHours / 24);
    const remainingHours = Math.floor(etaHours % 24);
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
};

export const getStreakColor = (streakCount: number): string => {
  if (streakCount === 0) return 'text-gray-500';
  if (streakCount < 7) return 'text-blue-600';
  if (streakCount < 30) return 'text-green-600';
  if (streakCount < 100) return 'text-purple-600';
  return 'text-yellow-600';
};

export const getStreakEmoji = (streakCount: number): string => {
  if (streakCount === 0) return '⭕';
  if (streakCount < 7) return '🔥';
  if (streakCount < 30) return '💪';
  if (streakCount < 100) return '🏆';
  return '👑';
};