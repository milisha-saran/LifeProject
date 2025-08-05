import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRecentActivity } from '@/lib/queries/dashboard';
import { Loader2, Activity, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function RecentActivityWidget() {
  const { data: activities, isLoading, error } = useRecentActivity();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
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
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load recent activity</p>
        </CardContent>
      </Card>
    );
  }

  const recentActivities = activities?.slice(0, 6) || [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed': return '✅';
      case 'habit_completed': return '🔥';
      case 'chore_completed': return '🧹';
      case 'project_created': return '📋';
      case 'goal_created': return '🎯';
      default: return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_completed': return 'bg-green-100 text-green-800';
      case 'habit_completed': return 'bg-orange-100 text-orange-800';
      case 'chore_completed': return 'bg-blue-100 text-blue-800';
      case 'project_created': return 'bg-purple-100 text-purple-800';
      case 'goal_created': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'task_completed': return 'Task';
      case 'habit_completed': return 'Habit';
      case 'chore_completed': return 'Chore';
      case 'project_created': return 'Project';
      case 'goal_created': return 'Goal';
      default: return 'Activity';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start completing tasks to see your activity here
            </p>
          </div>
        ) : (
          recentActivities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50"
            >
              <div className="text-lg flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    className={`text-xs ${getActivityColor(activity.type)}`}
                    variant="secondary"
                  >
                    {getActivityLabel(activity.type)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-900">
                  {activity.description}
                </p>
              </div>
            </div>
          ))
        )}
        {recentActivities.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Keep up the great work! 🎉
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}