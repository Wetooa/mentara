import { z } from 'zod';

// Worksheet Schema
export const WorksheetSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  content: z.string(),
  type: z.enum(['exercise', 'assessment', 'journal', 'goal_setting', 'cognitive_restructuring']),
  category: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedTime: z.number().min(1),
  isTemplate: z.boolean(),
  createdBy: z.string().uuid(),
  isPublic: z.boolean(),
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// Create Worksheet Schema
export const CreateWorksheetDtoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['exercise', 'assessment', 'journal', 'goal_setting', 'cognitive_restructuring']),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  estimatedTime: z.number().min(1, 'Estimated time must be at least 1 minute'),
  isTemplate: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).optional()
});

// Update Worksheet Schema
export const UpdateWorksheetDtoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  type: z.enum(['exercise', 'assessment', 'journal', 'goal_setting', 'cognitive_restructuring']).optional(),
  category: z.string().min(1, 'Category is required').optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  estimatedTime: z.number().min(1, 'Estimated time must be at least 1 minute').optional(),
  isTemplate: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional()
});

// Worksheet Assignment Schema
export const WorksheetAssignmentSchema = z.object({
  id: z.string().uuid(),
  worksheetId: z.string().uuid(),
  clientId: z.string().uuid(),
  therapistId: z.string().uuid(),
  assignedAt: z.string().datetime(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(['assigned', 'in_progress', 'completed', 'overdue']),
  completedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});

// Create Assignment Schema
export const CreateAssignmentDtoSchema = z.object({
  worksheetId: z.string().uuid('Invalid worksheet ID format'),
  clientId: z.string().uuid('Invalid client ID format'),
  dueDate: z.string().datetime('Invalid date format').optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});

// Update Assignment Schema
export const UpdateAssignmentDtoSchema = z.object({
  dueDate: z.string().datetime('Invalid date format').optional(),
  status: z.enum(['assigned', 'in_progress', 'completed', 'overdue']).optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
  priority: z.enum(['low', 'medium', 'high']).optional()
});

// Worksheet Submission Schema
export const WorksheetSubmissionSchema = z.object({
  id: z.string().uuid(),
  assignmentId: z.string().uuid(),
  responses: z.record(z.any()),
  attachments: z.array(z.string().uuid()).optional(),
  submittedAt: z.string().datetime(),
  feedback: z.string().optional(),
  score: z.number().min(0).max(100).optional(),
  reviewedAt: z.string().datetime().optional(),
  reviewedBy: z.string().uuid().optional()
});

// Create Submission Schema
export const CreateSubmissionDtoSchema = z.object({
  assignmentId: z.string().uuid('Invalid assignment ID format'),
  responses: z.record(z.any()),
  attachments: z.array(z.string().uuid()).optional()
});

// Review Submission Schema
export const ReviewSubmissionDtoSchema = z.object({
  feedback: z.string().max(2000, 'Feedback too long').optional(),
  score: z.number().min(0, 'Score must be non-negative').max(100, 'Score cannot exceed 100').optional()
});

// Worksheet Query Parameters
export const WorksheetQuerySchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  type: z.enum(['exercise', 'assessment', 'journal', 'goal_setting', 'cognitive_restructuring']).optional(),
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  isTemplate: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  createdBy: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt', 'difficulty']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Assignment Query Parameters
export const AssignmentQuerySchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  clientId: z.string().uuid().optional(),
  therapistId: z.string().uuid().optional(),
  status: z.enum(['assigned', 'in_progress', 'completed', 'overdue']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
  sortBy: z.enum(['assignedAt', 'dueDate', 'priority', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Parameter Schemas
export const WorksheetIdParamSchema = z.object({
  id: z.string().uuid('Invalid worksheet ID format')
});

export const AssignmentIdParamSchema = z.object({
  id: z.string().uuid('Invalid assignment ID format')
});

export const SubmissionIdParamSchema = z.object({
  id: z.string().uuid('Invalid submission ID format')
});

// Export type inference helpers
export type Worksheet = z.infer<typeof WorksheetSchema>;
export type CreateWorksheetDto = z.infer<typeof CreateWorksheetDtoSchema>;
export type UpdateWorksheetDto = z.infer<typeof UpdateWorksheetDtoSchema>;
export type WorksheetAssignment = z.infer<typeof WorksheetAssignmentSchema>;
export type CreateAssignmentDto = z.infer<typeof CreateAssignmentDtoSchema>;
export type UpdateAssignmentDto = z.infer<typeof UpdateAssignmentDtoSchema>;
export type WorksheetSubmission = z.infer<typeof WorksheetSubmissionSchema>;
export type CreateSubmissionDto = z.infer<typeof CreateSubmissionDtoSchema>;
export type ReviewSubmissionDto = z.infer<typeof ReviewSubmissionDtoSchema>;
export type WorksheetQuery = z.infer<typeof WorksheetQuerySchema>;
export type AssignmentQuery = z.infer<typeof AssignmentQuerySchema>;
export type WorksheetIdParam = z.infer<typeof WorksheetIdParamSchema>;
export type AssignmentIdParam = z.infer<typeof AssignmentIdParamSchema>;
export type SubmissionIdParam = z.infer<typeof SubmissionIdParamSchema>;

// Additional DTOs for WorksheetsController endpoints
export const WorksheetsQueryDtoSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  type: z.enum(['exercise', 'assessment', 'journal', 'goal_setting', 'cognitive_restructuring']).optional(),
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  isTemplate: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  createdBy: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(), // For filtering worksheets assigned to specific client
  therapistId: z.string().uuid().optional(), // For filtering worksheets created by specific therapist
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt', 'difficulty', 'dueDate']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const WorksheetParamsDtoSchema = z.object({
  id: z.string().uuid('Invalid worksheet ID format')
});

export const WorksheetCreateInputDtoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['exercise', 'assessment', 'journal', 'goal_setting', 'cognitive_restructuring']),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  estimatedTime: z.number().min(1, 'Estimated time must be at least 1 minute'),
  isTemplate: z.boolean().default(false),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  instructions: z.string().optional(),
  // Enhanced fields for controller endpoints
  clientId: z.string().uuid('Invalid client ID format').optional(), // For assigning to specific client
  therapistId: z.string().uuid('Invalid therapist ID format').optional(), // For tracking creator
  dueDate: z.string().datetime().optional(), // For assignments
  priority: z.enum(['low', 'medium', 'high']).default('medium').optional()
});

export const WorksheetUpdateInputDtoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  type: z.enum(['exercise', 'assessment', 'journal', 'goal_setting', 'cognitive_restructuring']).optional(),
  category: z.string().min(1, 'Category is required').optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  estimatedTime: z.number().min(1, 'Estimated time must be at least 1 minute').optional(),
  isTemplate: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  instructions: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional()
});

export const WorksheetSubmissionCreateInputDtoSchema = z.object({
  worksheetId: z.string().uuid('Invalid worksheet ID format'),
  responses: z.record(z.any()),
  attachments: z.array(z.string().uuid()).optional(),
  notes: z.string().max(2000, 'Notes too long').optional(),
  timeSpent: z.number().min(1, 'Time spent must be at least 1 minute').optional(), // in minutes
  isCompleted: z.boolean().default(true)
});

export const SubmissionParamsDtoSchema = z.object({
  id: z.string().uuid('Invalid submission ID format')
});

// Type exports for new DTOs
export type WorksheetsQueryDto = z.infer<typeof WorksheetsQueryDtoSchema>;
export type WorksheetParamsDto = z.infer<typeof WorksheetParamsDtoSchema>;
export type WorksheetCreateInputDto = z.infer<typeof WorksheetCreateInputDtoSchema>;
export type WorksheetUpdateInputDto = z.infer<typeof WorksheetUpdateInputDtoSchema>;
export type WorksheetSubmissionCreateInputDto = z.infer<typeof WorksheetSubmissionCreateInputDtoSchema>;
export type SubmissionParamsDto = z.infer<typeof SubmissionParamsDtoSchema>;