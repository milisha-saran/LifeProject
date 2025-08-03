import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { ProjectForm } from './ProjectForm';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/lib/queries/projects';
import { type Project, type ProjectFormData } from '@/types/project';
import { toast } from 'sonner';

interface ProjectListProps {
  onViewProject?: (projectId: number) => void;
}

export function ProjectList({ onViewProject }: ProjectListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { data: projects, isLoading, error } = useProjects();
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const handleCreateProject = async (data: ProjectFormData) => {
    try {
      await createProjectMutation.mutateAsync(data);
      setIsCreateDialogOpen(false);
      toast.success('Project created successfully');
    } catch (error) {
      toast.error('Failed to create project');
      throw error;
    }
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

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    
    try {
      await deleteProjectMutation.mutateAsync(selectedProject.id);
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (projectId: number) => {
    const project = projects?.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleViewProject = (projectId: number) => {
    onViewProject?.(projectId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Failed to load projects</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Projects</span> 📋
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Organize and track your important projects
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="rounded-lg brand-gradient text-white shadow-md hover:shadow-lg px-6 py-3"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Project
            </Button>
          </div>

          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteClick}
                  onView={handleViewProject}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 shadow-lg border-0 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl">📋</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No projects yet</h3>
                <p className="text-gray-600 mb-6">
                  Start organizing your work by creating your first project
                </p>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="rounded-lg brand-gradient text-white shadow-md hover:shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first project
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-6 border-b border-gray-100">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">✨</span>
              </div>
              Create New Project
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-lg">
              Add a new project to organize your goals and tasks.
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            onSubmit={handleCreateProject}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createProjectMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-6 border-b border-gray-100">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">✏️</span>
              </div>
              Edit Project
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-lg">
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white border-0 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-6 border-b border-gray-100">
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🗑️</span>
              </div>
              Delete Project
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{selectedProject?.name}"</span>? 
              <br />
              <span className="text-red-600 font-medium">This action cannot be undone</span> and will also delete all associated goals and tasks.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedProject(null);
              }}
              className="rounded-lg border-gray-300 hover:bg-gray-50 px-6"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
              disabled={deleteProjectMutation.isPending}
              className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-6"
            >
              {deleteProjectMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>🗑️</span>
                  Delete Project
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}