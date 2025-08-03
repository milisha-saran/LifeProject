import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name must be less than 100 characters'),
  description: z.string().optional(),
  weekly_hours: z.number().min(1, 'Must allocate at least 1 hour per week').max(168, 'Cannot exceed 168 hours per week'),
  start_date: z.date(),
  end_date: z.date().optional(),
  status: z.enum(['Not Started', 'In Progress', 'Completed']),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
}).refine((data) => {
  if (data.end_date && data.start_date) {
    return data.end_date >= data.start_date;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
});

export type ProjectFormData = z.infer<typeof projectSchema>;