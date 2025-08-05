import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Target, CheckSquare, Repeat, Zap } from 'lucide-react';
import { Link } from '@tanstack/react-router';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
  color: string;
  description: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'new-project',
    label: 'New Project',
    icon: Target,
    to: '/projects',
    color: 'bg-blue-500 hover:bg-blue-600',
    description: 'Start a new project'
  },
  {
    id: 'add-chore',
    label: 'Add Chore',
    icon: Repeat,
    to: '/chores',
    color: 'bg-orange-500 hover:bg-orange-600',
    description: 'Create a recurring chore'
  },
  {
    id: 'new-habit',
    label: 'New Habit',
    icon: Zap,
    to: '/habits',
    color: 'bg-green-500 hover:bg-green-600',
    description: 'Build a new habit'
  },
  {
    id: 'view-calendar',
    label: 'Calendar',
    icon: Calendar,
    to: '/calendar',
    color: 'bg-purple-500 hover:bg-purple-600',
    description: 'View your schedule'
  }
];

export function QuickActionsWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.id} to={action.to}>
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-200"
                >
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{action.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </div>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2">
              Need help getting started?
            </p>
            <Button variant="ghost" size="sm" className="text-xs">
              View Getting Started Guide
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}