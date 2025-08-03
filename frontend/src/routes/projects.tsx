import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProjectList } from '@/components/projects/ProjectList';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { useUpdateProject } from '@/lib/queries/projects';
import { type Project, type ProjectFormData } from '@/types/project';
import { toast } from 'sonner';

export const Route = createFileRoute('/projects')({
  component: ProjectsPage,
});

function ProjectsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const updateProjectMutation = useUpdateProject();

  const handleViewProject = (projectId: number) => {
    setSelectedProjectId(projectId);
  };

  const handleBackToList = () => {
    setSelectedProjectId(null);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProject = async (data: ProjectFormData) => {
    if (!selectedProject) return;
    
    try {
      await updateProjectMutation.mutateAsync({ 
        id: selectedProject.id, 
        data 
      });
      setIsEditDialogOpen(false);
      setSelectedProject(null);
      toast.success('Project updated successfully');
    } catch (error) {
      toast.error('Failed to update project');
      throw error;
    }
  };

  if (selectedProjectId) {
    return (
      <>
        <ProjectDetail
          projectId={selectedProjectId}
          onBack={handleBackToList}
          onEdit={handleEditProject}
        />
        
        {/* Edit Project Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update your project details.
              </DialogDescription>
            </DialogHeader>
            {selectedProject && (
              <ProjectForm
                project={selectedProject}
                onSubmit={handleUpdateProject}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setSelectedProject(null);
                }}
                isLoading={updateProjectMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <ProjectList onViewProject={handleViewProject} />
  );
}
