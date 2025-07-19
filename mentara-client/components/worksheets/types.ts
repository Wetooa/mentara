import { WorksheetAssignment, WorksheetSubmission } from "@mentara-commons";

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
  assignment: WorksheetAssignment & { 
    worksheet?: { title: string; content?: string }; 
    submissions?: WorksheetSubmission[];
    therapist?: { name: string };
    client?: { name: string };
  }
): Task {
  const latestSubmission = assignment.submissions?.[0];
  
  return {
    id: assignment.id,
    title: assignment.worksheet?.title || 'Untitled Worksheet',
    therapistName: assignment.therapist?.name,
    patientName: assignment.client?.name,
    date: assignment.dueDate || assignment.assignedAt,
    status: assignment.status,
    isCompleted: assignment.status === 'completed',
    instructions: assignment.worksheet?.content,
    materials: [], // Would need to be populated from related data
    myWork: [], // Would need to be populated from submissions
    submittedAt: latestSubmission?.submittedAt,
    feedback: latestSubmission?.feedback,
  };
}
