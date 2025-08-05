import React from 'react';
import type { CalendarFilters as FilterType } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '@/lib/api/projects';
import { Filter, Eye, EyeOff } from 'lucide-react';

interface CalendarFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
}

export const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  const toggleEventType = (type: 'showTasks' | 'showChores' | 'showHabits') => {
    onFiltersChange({
      ...filters,
      [type]: !filters[type],
    });
  };

  const toggleProject = (projectId: number) => {
    const isSelected = filters.projectIds.includes(projectId);
    const newProjectIds = isSelected
      ? filters.projectIds.filter(id => id !== projectId)
      : [...filters.projectIds, projectId];
    
    onFiltersChange({
      ...filters,
      projectIds: newProjectIds,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      showTasks: true,
      showChores: true,
      showHabits: true,
      projectIds: [],
    });
  };

  const hasActiveFilters = !filters.showTasks || !filters.showChores || !filters.showHabits || filters.projectIds.length > 0;

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Event Type Filters */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Event Types</h4>
        <div className="space-y-2">
          <FilterToggle
            label="Tasks"
            icon="📋"
            active={filters.showTasks}
            onClick={() => toggleEventType('showTasks')}
            color="bg-blue-100 text-blue-800"
          />
          <FilterToggle
            label="Chores"
            icon="🧹"
            active={filters.showChores}
            onClick={() => toggleEventType('showChores')}
            color="bg-green-100 text-green-800"
          />
          <FilterToggle
            label="Habits"
            icon="⭐"
            active={filters.showHabits}
            onClick={() => toggleEventType('showHabits')}
            color="bg-purple-100 text-purple-800"
          />
        </div>
      </div>

      {/* Project Filters */}
      {projects.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Projects</h4>
          <div className="space-y-2">
            {projects.map(project => (
              <FilterToggle
                key={project.id}
                label={project.name}
                active={filters.projectIds.length === 0 || filters.projectIds.includes(project.id)}
                onClick={() => toggleProject(project.id)}
                color="bg-gray-100 text-gray-800"
                colorDot={project.color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters</h4>
          <div className="flex flex-wrap gap-1">
            {!filters.showTasks && (
              <Badge variant="secondary" className="text-xs">
                Tasks Hidden
              </Badge>
            )}
            {!filters.showChores && (
              <Badge variant="secondary" className="text-xs">
                Chores Hidden
              </Badge>
            )}
            {!filters.showHabits && (
              <Badge variant="secondary" className="text-xs">
                Habits Hidden
              </Badge>
            )}
            {filters.projectIds.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filters.projectIds.length} Project{filters.projectIds.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface FilterToggleProps {
  label: string;
  icon?: string;
  active: boolean;
  onClick: () => void;
  color?: string;
  colorDot?: string;
}

const FilterToggle: React.FC<FilterToggleProps> = ({
  label,
  icon,
  active,
  onClick,
  color,
  colorDot,
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`w-full justify-start h-auto p-2 ${active ? 'bg-gray-100' : 'opacity-50'}`}
    >
      <div className="flex items-center gap-2 w-full">
        {active ? (
          <Eye className="h-3 w-3 text-gray-600" />
        ) : (
          <EyeOff className="h-3 w-3 text-gray-400" />
        )}
        
        {icon && <span className="text-sm">{icon}</span>}
        
        {colorDot && (
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: colorDot }}
          />
        )}
        
        <span className="text-sm truncate">{label}</span>
      </div>
    </Button>
  );
};