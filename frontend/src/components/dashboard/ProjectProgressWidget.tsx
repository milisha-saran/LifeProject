import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useProjectProgress } from '@/lib/queries/dashboard';
import { Loader2, TrendingUp, Clock, Target } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function ProjectProgressWidget() {
  const { data: projectProgress, isLoading, error } = useProjectProgress();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Project Progress
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
            <TrendingUp className="h-5 w-5" />
            Project Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load project progress</p>
        </CardContent>
      </Card>
    );
  }

  const topProjects = projectProgress?.slice(0, 5) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Project Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topProjects.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No projects found</p>
            <Link 
              to="/projects" 
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              Create your first project
            </Link>
          </div>
        ) : (
          topProjects.map((project) => (
            <div key={project.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: project.color }}
                  />
                  <Link 
                    to="/projects" 
                    className="text-sm font-medium hover:underline"
                  >
                    {project.name}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={project.status === 'Completed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {project.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {project.progress}%
                  </span>
                </div>
              </div>
              <Progress value={project.progress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {project.completedGoalsCount}/{project.goalsCount} goals
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {project.completedHours}/{project.totalHours}h
                </div>
              </div>
            </div>
          ))
        )}
        {topProjects.length > 0 && (
          <div className="pt-2 border-t">
            <Link 
              to="/projects" 
              className="text-sm text-primary hover:underline"
            >
              View all projects →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}