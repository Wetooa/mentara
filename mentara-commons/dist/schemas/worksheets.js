"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmissionParamsDtoSchema = exports.WorksheetSubmissionCreateInputDtoSchema = exports.WorksheetUpdateInputDtoSchema = exports.WorksheetCreateInputDtoSchema = exports.WorksheetParamsDtoSchema = exports.WorksheetsQueryDtoSchema = exports.SubmissionIdParamSchema = exports.AssignmentIdParamSchema = exports.WorksheetIdParamSchema = exports.AssignmentQuerySchema = exports.WorksheetQuerySchema = exports.ReviewSubmissionDtoSchema = exports.CreateSubmissionDtoSchema = exports.WorksheetSubmissionSchema = exports.UpdateAssignmentDtoSchema = exports.CreateAssignmentDtoSchema = exports.WorksheetAssignmentSchema = exports.UpdateWorksheetDtoSchema = exports.CreateWorksheetDtoSchema = exports.WorksheetSchema = void 0;
const zod_1 = require("zod");
// Worksheet Schema
exports.WorksheetSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    content: zod_1.z.string(),
    type: zod_1.z.enum(['exercise', 'assessment', 'journal', 'goal_setting', 'cognitive_restructuring']),
    category: zod_1.z.string(),
    difficulty: zod_1.z.enum(['beginner', 'intermediate', 'advanced']),
    estimatedTime: zod_1.z.number().min(1),
    isTemplate: zod_1.z.boolean(),
    createdBy: zod_1.z.string().uuid(),
    isPublic: zod_1.z.boolean(),
    tags: zod_1.z.array(zod_1.z.string()),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime()
});
// Create Worksheet Schema
exports.CreateWorksheetDtoSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: zod_1.z.string().min(1, 'Description is required').max(1000, 'Description too long'),
    content: zod_1.z.string().min(1, 'Content is required'),
    type: zod_1.z.enum(['exercise', 'assessment', 'journal', 'goal_setting', 'cognitive_restructuring']),
    category: zod_1.z.string().min(1, 'Category is required'),
    difficulty: zod_1.z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
    estimatedTime: zod_1.z.number().min(1, 'Estimated time must be at least 1 minute'),
    isTemplate: zod_1.z.boolean().default(false),
    isPublic: zod_1.z.boolean().default(false),
    tags: zod_1.z.array(zod_1.z.string()).optional()
});
// Update Worksheet Schema
exports.UpdateWorksheetDtoSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
    description: zod_1.z.string().min(1, 'Description is required').max(1000, 'Description too long').optional(),
    content: zod_1.z.string().min(1, 'Content is required').optional(),
    type: zod_1.z.enum(['exercise', 'assessment', 'journal', 'goal_setting', 'cognitive_restructuring']).optional(),
    category: zod_1.z.string().min(1, 'Category is required').optional(),
    difficulty: zod_1.z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    estimatedTime: zod_1.z.number().min(1, 'Estimated time must be at least 1 minute').optional(),
    isTemplate: zod_1.z.boolean().optional(),
    isPublic: zod_1.z.boolean().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional()
});
// Worksheet Assignment Schema
exports.WorksheetAssignmentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    worksheetId: zod_1.z.string().uuid(),
    clientId: zod_1.z.string().uuid(),
    therapistId: zod_1.z.string().uuid(),
    assignedAt: zod_1.z.string().datetime(),
    dueDate: zod_1.z.string().datetime().optional(),
    status: zod_1.z.enum(['assigned', 'in_progress', 'completed', 'overdue']),
    completedAt: zod_1.z.string().datetime().optional(),
    notes: zod_1.z.string().optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high']).default('medium')
});
// Create Assignment Schema
exports.CreateAssignmentDtoSchema = zod_1.z.object({
    worksheetId: zod_1.z.string().uuid('Invalid worksheet ID format'),
    clientId: zod_1.z.string().uuid('Invalid client ID format'),
    dueDate: zod_1.z.string().datetime('Invalid date format').optional(),
    notes: zod_1.z.string().max(1000, 'Notes too long').optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high']).default('medium')
});
// Update Assignment Schema
exports.UpdateAssignmentDtoSchema = zod_1.z.object({
    dueDate: zod_1.z.string().datetime('Invalid date format').optional(),
    status: zod_1.z.enum(['assigned', 'in_progress', 'completed', 'overdue']).optional(),
    notes: zod_1.z.string().max(1000, 'Notes too long').optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high']).optional()
});
// Worksheet Submission Schema
exports.WorksheetSubmissionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    assignmentId: zod_1.z.string().uuid(),
    responses: zod_1.z.record(zod_1.z.any()),
    attachments: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    submittedAt: zod_1.z.string().datetime(),
    feedback: zod_1.z.string().optional(),
    score: zod_1.z.number().min(0).max(100).optional(),
    reviewedAt: zod_1.z.string().datetime().optional(),
    reviewedBy: zod_1.z.string().uuid().optional()
});
// Create Submission Schema
exports.CreateSubmissionDtoSchema = zod_1.z.object({
    assignmentId: zod_1.z.string().uuid('Invalid assignment ID format'),
    responses: zod_1.z.record(zod_1.z.any()),
    attachments: zod_1.z.array(zod_1.z.string().uuid()).optional()
});
// Review Submission Schema
exports.ReviewSubmissionDtoSchema = zod_1.z.object({
    feedback: zod_1.z.string().max(2000, 'Feedback too long').optional(),
    score: zod_1.z.number().min(0, 'Score must be non-negative').max(100, 'Score cannot exceed 100').optional()
});
// Worksheet Query Parameters
exports.WorksheetQuerySchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    type: zod_1.z.enum(['exercise', 'assessment', 'journal', 'goal_setting', 'cognitive_restructuring']).optional(),
    category: zod_1.z.string().optional(),
    difficulty: zod_1.z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    isTemplate: zod_1.z.boolean().optional(),
    isPublic: zod_1.z.boolean().optional(),
    createdBy: zod_1.z.string().uuid().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['title', 'createdAt', 'updatedAt', 'difficulty']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
// Assignment Query Parameters
exports.AssignmentQuerySchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    clientId: zod_1.z.string().uuid().optional(),
    therapistId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(['assigned', 'in_progress', 'completed', 'overdue']).optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high']).optional(),
    dueDateFrom: zod_1.z.string().datetime().optional(),
    dueDateTo: zod_1.z.string().datetime().optional(),
    sortBy: zod_1.z.enum(['assignedAt', 'dueDate', 'priority', 'status']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
// Parameter Schemas
exports.WorksheetIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid worksheet ID format')
});
exports.AssignmentIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid assignment ID format')
});
exports.SubmissionIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid submission ID format')
});
// Additional DTOs for WorksheetsController endpoints
exports.WorksheetsQueryDtoSchema = zod_1.z.object({
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    type: zod_1.z.enum(['exercise', 'assessment', 'journal', 'goal_setting', 'cognitive_restructuring']).optional(),
    category: zod_1.z.string().optional(),
    difficulty: zod_1.z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    isTemplate: zod_1.z.boolean().optional(),
    isPublic: zod_1.z.boolean().optional(),
    createdBy: zod_1.z.string().uuid().optional(),
    clientId: zod_1.z.string().uuid().optional(), // For filtering worksheets assigned to specific client
    therapistId: zod_1.z.string().uuid().optional(), // For filtering worksheets created by specific therapist
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['title', 'createdAt', 'updatedAt', 'difficulty', 'dueDate']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional()
});
exports.WorksheetParamsDtoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid worksheet ID format')
});
exports.WorksheetCreateInputDtoSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: zod_1.z.string().min(1, 'Description is required').max(1000, 'Description too long'),
    content: zod_1.z.string().min(1, 'Content is required'),
    type: zod_1.z.enum(['exercise', 'assessment', 'journal', 'goal_setting', 'cognitive_restructuring']),
    category: zod_1.z.string().min(1, 'Category is required'),
    difficulty: zod_1.z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
    estimatedTime: zod_1.z.number().min(1, 'Estimated time must be at least 1 minute'),
    isTemplate: zod_1.z.boolean().default(false),
    isPublic: zod_1.z.boolean().default(false),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    instructions: zod_1.z.string().optional(),
    // Enhanced fields for controller endpoints
    clientId: zod_1.z.string().uuid('Invalid client ID format').optional(), // For assigning to specific client
    therapistId: zod_1.z.string().uuid('Invalid therapist ID format').optional(), // For tracking creator
    dueDate: zod_1.z.string().datetime().optional(), // For assignments
    priority: zod_1.z.enum(['low', 'medium', 'high']).default('medium').optional()
});
exports.WorksheetUpdateInputDtoSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
    description: zod_1.z.string().min(1, 'Description is required').max(1000, 'Description too long').optional(),
    content: zod_1.z.string().min(1, 'Content is required').optional(),
    type: zod_1.z.enum(['exercise', 'assessment', 'journal', 'goal_setting', 'cognitive_restructuring']).optional(),
    category: zod_1.z.string().min(1, 'Category is required').optional(),
    difficulty: zod_1.z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    estimatedTime: zod_1.z.number().min(1, 'Estimated time must be at least 1 minute').optional(),
    isTemplate: zod_1.z.boolean().optional(),
    isPublic: zod_1.z.boolean().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    instructions: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high']).optional()
});
exports.WorksheetSubmissionCreateInputDtoSchema = zod_1.z.object({
    worksheetId: zod_1.z.string().uuid('Invalid worksheet ID format'),
    responses: zod_1.z.record(zod_1.z.any()),
    attachments: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    notes: zod_1.z.string().max(2000, 'Notes too long').optional(),
    timeSpent: zod_1.z.number().min(1, 'Time spent must be at least 1 minute').optional(), // in minutes
    isCompleted: zod_1.z.boolean().default(true)
});
exports.SubmissionParamsDtoSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid submission ID format')
});
//# sourceMappingURL=worksheets.js.map