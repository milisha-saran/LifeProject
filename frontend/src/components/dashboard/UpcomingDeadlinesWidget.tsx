import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUpcomingDeadlines } from '@/lib/queries/dashboard';
import { Loader2, Calendar, AlertTriangle, Clock } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { formatDistanceToNow, format, isToday, isTomorrow } from 'date-fns';

export function UpcomingDeadlinesWidget() {
  const { data: deadlines, isLoading, error } = useUpcomingDeadlines();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Deadlines
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
            <Calendar className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load deadlines</p>
        </CardContent>
      </Card>
    );
  }

  const upcomingDeadlines = deadlines?.slice(0, 8) || [];

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const getTypeRoute = (type: string) => {
    switch (type) {
      case 'project': return '/projects';
      case 'chore': return '/chores';
      case 'habit': return '/habits';
      default: return '/';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return '📋';
      case 'chore': return '🧹';
      case 'habit': return '✅';
      default: return '📅';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingDeadlines.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
            <p className="text-xs text-muted-foreground mt-1">
              You're all caught up! 🎉
            </p>
          </div>
        ) : (
          upcomingDeadlines.map((deadline) => (
            <div 
              key={`${deadline.type}-${deadline.id}`} 
              className={`flex items-center justify-between p-3 rounded-lg border ${
                deadline.isOverdue 
                  ? 'border-red-200 bg-red-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="text-lg">
                  {getTypeIcon(deadline.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link 
                      to={getTypeRoute(deadline.type)}
                      className="text-sm font-medium hover:underline truncate"
                    >
                      {deadline.name}
                    </Link>
                    {deadline.isOverdue && (
                      <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs capitalize">
                      {deadline.type}
                    </Badge>
                    <span className={`text-xs ${
                      deadline.isOverdue ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      {deadline.isOverdue ? 'Overdue' : formatDueDate(deadline.dueDate)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {deadline.color && (
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: deadline.color }}
                  />
                )}
                <Badge 
                  variant={deadline.status === 'Completed' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {deadline.status}
                </Badge>
              </div>
            </div>
          ))
        )}
        {upcomingDeadlines.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex justify-between text-sm">
              <Link to="/chores" className="text-primary hover:underline">
                View chores →
              </Link>
              <Link to="/habits" className="text-primary hover:underline">
                View habits →
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}