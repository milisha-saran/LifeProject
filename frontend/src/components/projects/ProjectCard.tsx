import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import { type Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: number) => void;
  onView: (projectId: number) => void;
}

const getStatusColor = (status: Project['status']) => {
  switch (status) {
    case 'Not Started':
      return 'secondary';
    case 'In Progress':
      return 'default';
    case 'Completed':
      return 'outline';
    default:
      return 'secondary';
  }
};

export function ProjectCard({ project, onEdit, onDelete, onView }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-6 h-6 rounded-full shadow-sm" 
            style={{ backgroundColor: project.color }}
          />
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {project.name}
          </h3>
        </div>
        <Badge 
          variant={getStatusColor(project.status)}
          className="text-xs font-medium"
        >
          {project.status}
        </Badge>
      </div>
      
      {project.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>
      )}
      
      <div className="space-y-2 text-sm text-gray-500 mb-6">
        <div className="flex justify-between">
          <span>Weekly Hours:</span>
          <span className="font-medium text-gray-700">{project.weekly_hours}h</span>
        </div>
        
        <div className="flex justify-between">
          <span>Start Date:</span>
          <span className="font-medium text-gray-700">{formatDate(project.start_date)}</span>
        </div>
        
        {project.end_date && (
          <div className="flex justify-between">
            <span>End Date:</span>
            <span className="font-medium text-gray-700">{formatDate(project.end_date)}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(project.id)}
          className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-lg"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(project)}
            className="hover:bg-gray-50 rounded-lg"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(project.id)}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}