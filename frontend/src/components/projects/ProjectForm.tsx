import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { projectSchema, type ProjectFormData } from '@/lib/validations/project';
import { type Project, type ProjectStatus } from '@/types/project';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const statusOptions: ProjectStatus[] = ['Not Started', 'In Progress', 'Completed'];

const colorOptions = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#EF4444', label: 'Red' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Yellow' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#F97316', label: 'Orange' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#84CC16', label: 'Lime' },
];

export function ProjectForm({ project, onSubmit, onCancel, isLoading }: ProjectFormProps) {
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      weekly_hours: project?.weekly_hours || 1,
      start_date: project?.start_date ? new Date(project.start_date) : new Date(),
      end_date: project?.end_date ? new Date(project.end_date) : undefined,
      status: project?.status || 'Not Started',
      color: project?.color || '#3B82F6',
    },
  });

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Failed to submit project:', error);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 p-6 rounded-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                  <span className="text-blue-600">📋</span>
                  Project Name
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter project name" 
                    className="bg-white/80 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                  <span className="text-purple-600">📝</span>
                  Description (Optional)
                </FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter project description" 
                    className="bg-white/80 border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weekly_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                  <span className="text-green-600">⏱️</span>
                  Weekly Hours
                </FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    max="168" 
                    placeholder="Enter weekly hours"
                    className="bg-white/80 border-gray-200 focus:border-green-400 focus:ring-green-400/20 rounded-lg"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                    <span className="text-blue-600">📅</span>
                    Start Date
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      className="bg-white/80 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-lg"
                      {...field}
                      value={field.value ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                    <span className="text-purple-600">🏁</span>
                    End Date (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      className="bg-white/80 border-gray-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-lg"
                      {...field}
                      value={field.value ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                    <span className="text-orange-600">🎯</span>
                    Status
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/80 border-gray-200 focus:border-orange-400 focus:ring-orange-400/20 rounded-lg">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-gray-200 rounded-lg shadow-lg">
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status} className="hover:bg-gray-50">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold flex items-center gap-2">
                    <span className="text-pink-600">🎨</span>
                    Color
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/80 border-gray-200 focus:border-pink-400 focus:ring-pink-400/20 rounded-lg">
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-gray-200 rounded-lg shadow-lg">
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value} className="hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-5 h-5 rounded-full shadow-sm border border-gray-200" 
                              style={{ backgroundColor: color.value }}
                            />
                            <span className="font-medium">{color.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="rounded-lg border-gray-300 hover:bg-gray-50 px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="rounded-lg brand-gradient text-white shadow-md hover:shadow-lg px-6"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{project ? '✏️' : '✨'}</span>
                  {project ? 'Update Project' : 'Create Project'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}