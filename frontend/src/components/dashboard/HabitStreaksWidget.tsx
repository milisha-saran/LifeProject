import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHabitStreaks } from '@/lib/queries/dashboard';
import { Loader2, Flame, Target, TrendingUp } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { format, isToday } from 'date-fns';

export function HabitStreaksWidget() {
  const { data: habitStreaks, isLoading, error } = useHabitStreaks();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Habit Streaks
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Habit Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load habit streaks</p>
        </CardContent>
      </Card>
    );
  }

  const topStreaks = habitStreaks?.slice(0, 6) || [];

  const getStreakColor = (streakCount: number) => {
    if (streakCount >= 30) return 'text-purple-600';
    if (streakCount >= 14) return 'text-blue-600';
    if (streakCount >= 7) return 'text-green-600';
    if (streakCount >= 3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getStreakBadge = (streakCount: number) => {
    if (streakCount >= 30) return { label: 'Master', variant: 'default' as const };
    if (streakCount >= 14) return { label: 'Strong', variant: 'secondary' as const };
    if (streakCount >= 7) return { label: 'Building', variant: 'outline' as const };
    if (streakCount >= 3) return { label: 'Starting', variant: 'outline' as const };
    return { label: 'New', variant: 'outline' as const };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5" />
          Habit Streaks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topStreaks.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No habits found</p>
            <Link 
              to="/habits" 
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              Create your first habit
            </Link>
          </div>
        ) : (
          topStreaks.map((habit) => {
            const streakBadge = getStreakBadge(habit.streakCount);
            const nextDueDate = new Date(habit.nextDue);
            const isDueToday = isToday(nextDueDate);
            
            return (
              <div 
                key={habit.id} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  habit.isOverdue 
                    ? 'border-red-200 bg-red-50' 
                    : isDueToday 
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <Flame className={`h-4 w-4 ${getStreakColor(habit.streakCount)}`} />
                    <span className={`font-bold text-lg ${getStreakColor(habit.streakCount)}`}>
                      {habit.streakCount}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link 
                      to="/habits"
                      className="text-sm font-medium hover:underline truncate block"
                    >
                      {habit.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={streakBadge.variant} className="text-xs">
                        {streakBadge.label}
                      </Badge>
                      <span className={`text-xs ${
                        habit.isOverdue 
                          ? 'text-red-600' 
                          : isDueToday 
                          ? 'text-blue-600' 
                          : 'text-muted-foreground'
                      }`}>
                        {habit.isOverdue 
                          ? 'Overdue' 
                          : isDueToday 
                          ? 'Due today' 
                          : `Due ${format(nextDueDate, 'MMM d')}`
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    {habit.lastCompleted && (
                      <>Last: {format(new Date(habit.lastCompleted), 'MMM d')}</>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {topStreaks.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <Link 
                to="/habits" 
                className="text-sm text-primary hover:underline"
              >
                View all habits →
              </Link>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Keep it up!
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}