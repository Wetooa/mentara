import type { Worksheet, WorksheetSubmission } from "@/types/api/worksheets";

export interface TaskFile {
  id?: string;
  type?: string;
  title?: string;
  filename?: string;
  description?: string;
  content?: string;
  url?: string;
  uploading?: boolean; // For showing upload progress
  submittedAt?: string;
  feedback?: string;
  score?: number;
}

export interface Task {
  id: string;
  title: string;
  therapistName?: string;
  patientName?: string;
  date: string;
  status: "upcoming" | "past_due" | "completed" | "assigned" | "in_progress" | "overdue";
  isCompleted: boolean;
  instructions?: string;
  materials?: TaskFile[];
  myWork?: TaskFile[];
  submittedAt?: string;
  feedback?: string;
}

// Utility function to transform API types to Task types
export function transformWorksheetAssignmentToTask(
  assignment: Worksheet
): Task {
  const latestSubmission = assignment.submissions?.[0];
  
  return {
    id: assignment.id,
    title: assignment.title || 'Untitled Worksheet',
    therapistName: `${assignment.therapist.firstName} ${assignment.therapist.lastName}`,
    patientName: `${assignment.user.firstName} ${assignment.user.lastName}`,
    date: assignment.dueDate,
    status: assignment.isCompleted ? 'completed' : 'in_progress',
    isCompleted: assignment.isCompleted,
    instructions: assignment.instructions,
    materials: [], // Would need to be populated from assignment.materials
    myWork: [], // Would need to be populated from submissions
    submittedAt: latestSubmission?.submittedAt,
    feedback: assignment.feedback,
  };
}
