import { z } from 'zod';
export declare const WorksheetSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    content: z.ZodString;
    type: z.ZodEnum<["exercise", "assessment", "journal", "goal_setting", "cognitive_restructuring"]>;
    category: z.ZodString;
    difficulty: z.ZodEnum<["beginner", "intermediate", "advanced"]>;
    estimatedTime: z.ZodNumber;
    isTemplate: z.ZodBoolean;
    createdBy: z.ZodString;
    isPublic: z.ZodBoolean;
    tags: z.ZodArray<z.ZodString, "many">;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    type: "exercise" | "assessment" | "journal" | "goal_setting" | "cognitive_restructuring";
    title: string;
    content: string;
    description: string;
    isPublic: boolean;
    createdBy: string;
    category: string;
    tags: string[];
    difficulty: "beginner" | "intermediate" | "advanced";
    estimatedTime: number;
    isTemplate: boolean;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    type: "exercise" | "assessment" | "journal" | "goal_setting" | "cognitive_restructuring";
    title: string;
    content: string;
    description: string;
    isPublic: boolean;
    createdBy: string;
    category: string;
    tags: string[];
    difficulty: "beginner" | "intermediate" | "advanced";
    estimatedTime: number;
    isTemplate: boolean;
}>;
export declare const CreateWorksheetDtoSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    content: z.ZodString;
    type: z.ZodEnum<["exercise", "assessment", "journal", "goal_setting", "cognitive_restructuring"]>;
    category: z.ZodString;
    difficulty: z.ZodDefault<z.ZodEnum<["beginner", "intermediate", "advanced"]>>;
    estimatedTime: z.ZodNumber;
    isTemplate: z.ZodDefault<z.ZodBoolean>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "exercise" | "assessment" | "journal" | "goal_setting" | "cognitive_restructuring";
    title: string;
    content: string;
    description: string;
    isPublic: boolean;
    category: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    estimatedTime: number;
    isTemplate: boolean;
    tags?: string[] | undefined;
}, {
    type: "exercise" | "assessment" | "journal" | "goal_setting" | "cognitive_restructuring";
    title: string;
    content: string;
    description: string;
    category: string;
    estimatedTime: number;
    isPublic?: boolean | undefined;
    tags?: string[] | undefined;
    difficulty?: "beginner" | "intermediate" | "advanced" | undefined;
    isTemplate?: boolean | undefined;
}>;
export declare const UpdateWorksheetDtoSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["exercise", "assessment", "journal", "goal_setting", "cognitive_restructuring"]>>;
    category: z.ZodOptional<z.ZodString>;
    difficulty: z.ZodOptional<z.ZodEnum<["beginner", "intermediate", "advanced"]>>;
    estimatedTime: z.ZodOptional<z.ZodNumber>;
    isTemplate: z.ZodOptional<z.ZodBoolean>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type?: "exercise" | "assessment" | "journal" | "goal_setting" | "cognitive_restructuring" | undefined;
    title?: string | undefined;
    content?: string | undefined;
    description?: string | undefined;
    isPublic?: boolean | undefined;
    category?: string | undefined;
    tags?: string[] | undefined;
    difficulty?: "beginner" | "intermediate" | "advanced" | undefined;
    estimatedTime?: number | undefined;
    isTemplate?: boolean | undefined;
}, {
    type?: "exercise" | "assessment" | "journal" | "goal_setting" | "cognitive_restructuring" | undefined;
    title?: string | undefined;
    content?: string | undefined;
    description?: string | undefined;
    isPublic?: boolean | undefined;
    category?: string | undefined;
    tags?: string[] | undefined;
    difficulty?: "beginner" | "intermediate" | "advanced" | undefined;
    estimatedTime?: number | undefined;
    isTemplate?: boolean | undefined;
}>;
export declare const WorksheetAssignmentSchema: z.ZodObject<{
    id: z.ZodString;
    worksheetId: z.ZodString;
    clientId: z.ZodString;
    therapistId: z.ZodString;
    assignedAt: z.ZodString;
    dueDate: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["assigned", "in_progress", "completed", "overdue"]>;
    completedAt: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "completed" | "in_progress" | "assigned" | "overdue";
    therapistId: string;
    clientId: string;
    priority: "low" | "medium" | "high";
    worksheetId: string;
    assignedAt: string;
    notes?: string | undefined;
    completedAt?: string | undefined;
    dueDate?: string | undefined;
}, {
    id: string;
    status: "completed" | "in_progress" | "assigned" | "overdue";
    therapistId: string;
    clientId: string;
    worksheetId: string;
    assignedAt: string;
    notes?: string | undefined;
    completedAt?: string | undefined;
    dueDate?: string | undefined;
    priority?: "low" | "medium" | "high" | undefined;
}>;
export declare const CreateAssignmentDtoSchema: z.ZodObject<{
    worksheetId: z.ZodString;
    clientId: z.ZodString;
    dueDate: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
}, "strip", z.ZodTypeAny, {
    clientId: string;
    priority: "low" | "medium" | "high";
    worksheetId: string;
    notes?: string | undefined;
    dueDate?: string | undefined;
}, {
    clientId: string;
    worksheetId: string;
    notes?: string | undefined;
    dueDate?: string | undefined;
    priority?: "low" | "medium" | "high" | undefined;
}>;
export declare const UpdateAssignmentDtoSchema: z.ZodObject<{
    dueDate: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["assigned", "in_progress", "completed", "overdue"]>>;
    notes: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "completed" | "in_progress" | "assigned" | "overdue" | undefined;
    notes?: string | undefined;
    dueDate?: string | undefined;
    priority?: "low" | "medium" | "high" | undefined;
}, {
    status?: "completed" | "in_progress" | "assigned" | "overdue" | undefined;
    notes?: string | undefined;
    dueDate?: string | undefined;
    priority?: "low" | "medium" | "high" | undefined;
}>;
export declare const WorksheetSubmissionSchema: z.ZodObject<{
    id: z.ZodString;
    assignmentId: z.ZodString;
    responses: z.ZodRecord<z.ZodString, z.ZodAny>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    submittedAt: z.ZodString;
    feedback: z.ZodOptional<z.ZodString>;
    score: z.ZodOptional<z.ZodNumber>;
    reviewedAt: z.ZodOptional<z.ZodString>;
    reviewedBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    assignmentId: string;
    responses: Record<string, any>;
    submittedAt: string;
    reviewedAt?: string | undefined;
    reviewedBy?: string | undefined;
    attachments?: string[] | undefined;
    feedback?: string | undefined;
    score?: number | undefined;
}, {
    id: string;
    assignmentId: string;
    responses: Record<string, any>;
    submittedAt: string;
    reviewedAt?: string | undefined;
    reviewedBy?: string | undefined;
    attachments?: string[] | undefined;
    feedback?: string | undefined;
    score?: number | undefined;
}>;
export declare const CreateSubmissionDtoSchema: z.ZodObject<{
    assignmentId: z.ZodString;
    responses: z.ZodRecord<z.ZodString, z.ZodAny>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    assignmentId: string;
    responses: Record<string, any>;
    attachments?: string[] | undefined;
}, {
    assignmentId: string;
    responses: Record<string, any>;
    attachments?: string[] | undefined;
}>;
export declare const ReviewSubmissionDtoSchema: z.ZodObject<{
    feedback: z.ZodOptional<z.ZodString>;
    score: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    feedback?: string | undefined;
    score?: number | undefined;
}, {
    feedback?: string | undefined;
    score?: number | undefined;
}>;
export declare const WorksheetQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    type: z.ZodOptional<z.ZodEnum<["exercise", "assessment", "journal", "goal_setting", "cognitive_restructuring"]>>;
    category: z.ZodOptional<z.ZodString>;
    difficulty: z.ZodOptional<z.ZodEnum<["beginner", "intermediate", "advanced"]>>;
    isTemplate: z.ZodOptional<z.ZodBoolean>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
    createdBy: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<["title", "createdAt", "updatedAt", "difficulty"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    type?: "exercise" | "assessment" | "journal" | "goal_setting" | "cognitive_restructuring" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "title" | "difficulty" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    isPublic?: boolean | undefined;
    createdBy?: string | undefined;
    category?: string | undefined;
    tags?: string[] | undefined;
    search?: string | undefined;
    difficulty?: "beginner" | "intermediate" | "advanced" | undefined;
    isTemplate?: boolean | undefined;
}, {
    type?: "exercise" | "assessment" | "journal" | "goal_setting" | "cognitive_restructuring" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "title" | "difficulty" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    isPublic?: boolean | undefined;
    createdBy?: string | undefined;
    category?: string | undefined;
    tags?: string[] | undefined;
    search?: string | undefined;
    difficulty?: "beginner" | "intermediate" | "advanced" | undefined;
    isTemplate?: boolean | undefined;
}>;
export declare const AssignmentQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    clientId: z.ZodOptional<z.ZodString>;
    therapistId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["assigned", "in_progress", "completed", "overdue"]>>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    dueDateFrom: z.ZodOptional<z.ZodString>;
    dueDateTo: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<["assignedAt", "dueDate", "priority", "status"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "completed" | "in_progress" | "assigned" | "overdue" | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "status" | "dueDate" | "priority" | "assignedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    priority?: "low" | "medium" | "high" | undefined;
    dueDateFrom?: string | undefined;
    dueDateTo?: string | undefined;
}, {
    status?: "completed" | "in_progress" | "assigned" | "overdue" | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "status" | "dueDate" | "priority" | "assignedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    priority?: "low" | "medium" | "high" | undefined;
    dueDateFrom?: string | undefined;
    dueDateTo?: string | undefined;
}>;
export declare const WorksheetIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const AssignmentIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const SubmissionIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
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
export declare const WorksheetsQueryDtoSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    type: z.ZodOptional<z.ZodEnum<["exercise", "assessment", "journal", "goal_setting", "cognitive_restructuring"]>>;
    category: z.ZodOptional<z.ZodString>;
    difficulty: z.ZodOptional<z.ZodEnum<["beginner", "intermediate", "advanced"]>>;
    isTemplate: z.ZodOptional<z.ZodBoolean>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
    createdBy: z.ZodOptional<z.ZodString>;
    clientId: z.ZodOptional<z.ZodString>;
    therapistId: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<["title", "createdAt", "updatedAt", "difficulty", "dueDate"]>>;
    sortOrder: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    type?: "exercise" | "assessment" | "journal" | "goal_setting" | "cognitive_restructuring" | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "title" | "dueDate" | "difficulty" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    isPublic?: boolean | undefined;
    createdBy?: string | undefined;
    category?: string | undefined;
    tags?: string[] | undefined;
    search?: string | undefined;
    difficulty?: "beginner" | "intermediate" | "advanced" | undefined;
    isTemplate?: boolean | undefined;
}, {
    type?: "exercise" | "assessment" | "journal" | "goal_setting" | "cognitive_restructuring" | undefined;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "title" | "dueDate" | "difficulty" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    isPublic?: boolean | undefined;
    createdBy?: string | undefined;
    category?: string | undefined;
    tags?: string[] | undefined;
    search?: string | undefined;
    difficulty?: "beginner" | "intermediate" | "advanced" | undefined;
    isTemplate?: boolean | undefined;
}>;
export declare const WorksheetParamsDtoSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const WorksheetCreateInputDtoSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    content: z.ZodString;
    type: z.ZodEnum<["exercise", "assessment", "journal", "goal_setting", "cognitive_restructuring"]>;
    category: z.ZodString;
    difficulty: z.ZodDefault<z.ZodEnum<["beginner", "intermediate", "advanced"]>>;
    estimatedTime: z.ZodNumber;
    isTemplate: z.ZodDefault<z.ZodBoolean>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    instructions: z.ZodOptional<z.ZodString>;
    clientId: z.ZodOptional<z.ZodString>;
    therapistId: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>>;
}, "strip", z.ZodTypeAny, {
    type: "exercise" | "assessment" | "journal" | "goal_setting" | "cognitive_restructuring";
    title: string;
    content: string;
    description: string;
    isPublic: boolean;
    category: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    estimatedTime: number;
    isTemplate: boolean;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    dueDate?: string | undefined;
    priority?: "low" | "medium" | "high" | undefined;
    tags?: string[] | undefined;
    instructions?: string | undefined;
}, {
    type: "exercise" | "assessment" | "journal" | "goal_setting" | "cognitive_restructuring";
    title: string;
    content: string;
    description: string;
    category: string;
    estimatedTime: number;
    therapistId?: string | undefined;
    clientId?: string | undefined;
    isPublic?: boolean | undefined;
    dueDate?: string | undefined;
    priority?: "low" | "medium" | "high" | undefined;
    tags?: string[] | undefined;
    difficulty?: "beginner" | "intermediate" | "advanced" | undefined;
    isTemplate?: boolean | undefined;
    instructions?: string | undefined;
}>;
export declare const WorksheetUpdateInputDtoSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["exercise", "assessment", "journal", "goal_setting", "cognitive_restructuring"]>>;
    category: z.ZodOptional<z.ZodString>;
    difficulty: z.ZodOptional<z.ZodEnum<["beginner", "intermediate", "advanced"]>>;
    estimatedTime: z.ZodOptional<z.ZodNumber>;
    isTemplate: z.ZodOptional<z.ZodBoolean>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    instructions: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
}, "strip", z.ZodTypeAny, {
    type?: "exercise" | "assessment" | "journal" | "goal_setting" | "cognitive_restructuring" | undefined;
    title?: string | undefined;
    content?: string | undefined;
    description?: string | undefined;
    isPublic?: boolean | undefined;
    category?: string | undefined;
    dueDate?: string | undefined;
    priority?: "low" | "medium" | "high" | undefined;
    tags?: string[] | undefined;
    difficulty?: "beginner" | "intermediate" | "advanced" | undefined;
    estimatedTime?: number | undefined;
    isTemplate?: boolean | undefined;
    instructions?: string | undefined;
}, {
    type?: "exercise" | "assessment" | "journal" | "goal_setting" | "cognitive_restructuring" | undefined;
    title?: string | undefined;
    content?: string | undefined;
    description?: string | undefined;
    isPublic?: boolean | undefined;
    category?: string | undefined;
    dueDate?: string | undefined;
    priority?: "low" | "medium" | "high" | undefined;
    tags?: string[] | undefined;
    difficulty?: "beginner" | "intermediate" | "advanced" | undefined;
    estimatedTime?: number | undefined;
    isTemplate?: boolean | undefined;
    instructions?: string | undefined;
}>;
export declare const WorksheetSubmissionCreateInputDtoSchema: z.ZodObject<{
    worksheetId: z.ZodString;
    responses: z.ZodRecord<z.ZodString, z.ZodAny>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    notes: z.ZodOptional<z.ZodString>;
    timeSpent: z.ZodOptional<z.ZodNumber>;
    isCompleted: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isCompleted: boolean;
    worksheetId: string;
    responses: Record<string, any>;
    attachments?: string[] | undefined;
    notes?: string | undefined;
    timeSpent?: number | undefined;
}, {
    worksheetId: string;
    responses: Record<string, any>;
    attachments?: string[] | undefined;
    notes?: string | undefined;
    isCompleted?: boolean | undefined;
    timeSpent?: number | undefined;
}>;
export declare const SubmissionParamsDtoSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type WorksheetsQueryDto = z.infer<typeof WorksheetsQueryDtoSchema>;
export type WorksheetParamsDto = z.infer<typeof WorksheetParamsDtoSchema>;
export type WorksheetCreateInputDto = z.infer<typeof WorksheetCreateInputDtoSchema>;
export type WorksheetUpdateInputDto = z.infer<typeof WorksheetUpdateInputDtoSchema>;
export type WorksheetSubmissionCreateInputDto = z.infer<typeof WorksheetSubmissionCreateInputDtoSchema>;
export type SubmissionParamsDto = z.infer<typeof SubmissionParamsDtoSchema>;
//# sourceMappingURL=worksheets.d.ts.map