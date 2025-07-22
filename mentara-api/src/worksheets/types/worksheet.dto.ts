/**
 * Worksheets Module DTOs - Data Transfer Objects for worksheet operations
 * These are pure TypeScript interfaces without validation logic
 */

// Worksheet creation DTO
export interface WorksheetCreateInputDto {
  title: string;
  description: string;
  content: string;
  type: 'assignment' | 'exercise' | 'reflection' | 'assessment' | 'homework' | 'journal';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags?: string[];
  estimatedDuration?: number; // in minutes
  instructions?: string;
  attachments?: string[];
  isTemplate?: boolean;
  templateCategory?: string;
  clientIds?: string[]; // For assignment to specific clients
  dueDate?: string; // ISO string
  reminderEnabled?: boolean;
  reminderTime?: string; // ISO string
  maxAttempts?: number;
  gradingEnabled?: boolean;
  passingScore?: number;
  metadata?: {
    therapeuticGoals?: string[];
    skillsTargeted?: string[];
    progressIndicators?: string[];
    resources?: string[];
  };
}

// Worksheet update DTO
export interface WorksheetUpdateInputDto {
  title?: string;
  description?: string;
  content?: string;
  type?: 'assignment' | 'exercise' | 'reflection' | 'assessment' | 'homework' | 'journal';
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  tags?: string[];
  estimatedDuration?: number;
  instructions?: string;
  attachments?: string[];
  isTemplate?: boolean;
  templateCategory?: string;
  dueDate?: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
  maxAttempts?: number;
  gradingEnabled?: boolean;
  passingScore?: number;
  isActive?: boolean;
  metadata?: {
    therapeuticGoals?: string[];
    skillsTargeted?: string[];
    progressIndicators?: string[];
    resources?: string[];
  };
}

// Worksheet submission creation DTO
export interface WorksheetSubmissionCreateInputDto {
  worksheetId: string;
  responses: {
    questionId?: string;
    questionText?: string;
    answer: string;
    answerType: 'text' | 'number' | 'boolean' | 'multiple_choice' | 'rating' | 'file';
    metadata?: {
      timeSpent?: number; // seconds spent on this question
      confidence?: number; // 1-5 scale
      difficulty?: number; // 1-5 scale
    };
  }[];
  attachments?: string[];
  notes?: string;
  isComplete: boolean;
  timeSpent?: number; // total time spent in minutes
  submittedAt?: string; // ISO string
}

// Worksheet submission update DTO
export interface WorksheetSubmissionUpdateInputDto {
  responses?: {
    questionId?: string;
    questionText?: string;
    answer: string;
    answerType: 'text' | 'number' | 'boolean' | 'multiple_choice' | 'rating' | 'file';
    metadata?: {
      timeSpent?: number;
      confidence?: number;
      difficulty?: number;
    };
  }[];
  attachments?: string[];
  notes?: string;
  isComplete?: boolean;
  timeSpent?: number;
  submittedAt?: string;
  score?: number;
  feedback?: string;
  graded?: boolean;
  gradedAt?: string;
}

// Response DTOs
export interface WorksheetResponseDto {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'assignment' | 'exercise' | 'reflection' | 'assessment' | 'homework' | 'journal';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  estimatedDuration?: number;
  instructions?: string;
  attachments: string[];
  isTemplate: boolean;
  templateCategory?: string;
  authorId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  dueDate?: string;
  reminderEnabled: boolean;
  reminderTime?: string;
  maxAttempts?: number;
  gradingEnabled: boolean;
  passingScore?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedCount?: number;
  completedCount?: number;
  averageScore?: number;
  metadata?: {
    therapeuticGoals?: string[];
    skillsTargeted?: string[];
    progressIndicators?: string[];
    resources?: string[];
  };
}

export interface WorksheetSubmissionResponseDto {
  id: string;
  worksheetId: string;
  worksheet: {
    id: string;
    title: string;
    type: string;
    difficulty: string;
    category: string;
    maxAttempts?: number;
    gradingEnabled: boolean;
    passingScore?: number;
  };
  clientId: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  responses: {
    questionId?: string;
    questionText?: string;
    answer: string;
    answerType: string;
    metadata?: {
      timeSpent?: number;
      confidence?: number;
      difficulty?: number;
    };
  }[];
  attachments: string[];
  notes?: string;
  isComplete: boolean;
  timeSpent?: number;
  submittedAt?: string;
  score?: number;
  feedback?: string;
  graded: boolean;
  gradedAt?: string;
  gradedById?: string;
  grader?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  attemptNumber: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'graded';
  createdAt: string;
  updatedAt: string;
}

// Query DTOs
export interface WorksheetQueryDto {
  type?: 'assignment' | 'exercise' | 'reflection' | 'assessment' | 'homework' | 'journal';
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  tags?: string[];
  authorId?: string;
  isTemplate?: boolean;
  templateCategory?: string;
  isActive?: boolean;
  assignedToClient?: string;
  dueFrom?: string;
  dueTo?: string;
  sortBy?: 'created' | 'updated' | 'due_date' | 'difficulty' | 'completion_rate';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface WorksheetSubmissionQueryDto {
  worksheetId?: string;
  clientId?: string;
  status?: 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'graded';
  isComplete?: boolean;
  graded?: boolean;
  submittedFrom?: string;
  submittedTo?: string;
  sortBy?: 'submitted' | 'score' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Statistics DTOs
export interface WorksheetStatsDto {
  totalWorksheets: number;
  templatesCount: number;
  assignmentsCount: number;
  averageCompletionRate: number;
  averageScore?: number;
  popularCategories: {
    category: string;
    count: number;
  }[];
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
}