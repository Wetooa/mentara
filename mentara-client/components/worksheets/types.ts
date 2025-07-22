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
  // Backend returns singular submission
  const latestSubmission = assignment.submission;
  
  // Map materials from backend arrays to frontend objects
  const materials: TaskFile[] = (assignment.materialUrls || []).map((url: string, index: number) => ({
    id: `material-${index}`,
    filename: assignment.materialNames?.[index] || 'Unknown',
    url,
    type: 'material'
  }));

  // Map submission files to myWork
  const myWork: TaskFile[] = latestSubmission ? [
    {
      id: latestSubmission.id,
      filename: latestSubmission.fileNames?.[0] || 'Submission',
      url: latestSubmission.fileUrls?.[0] || '',
      type: 'submission',
      submittedAt: latestSubmission.submittedAt
    }
  ] : [];

  // Determine status based on worksheet status and due date
  let status: Task['status'] = 'assigned';
  if (assignment.status === 'SUBMITTED') {
    status = 'completed';
  } else if (new Date(assignment.dueDate) < new Date()) {
    status = 'past_due';
  } else {
    status = 'assigned';
  }
  
  return {
    id: assignment.id,
    title: assignment.title || 'Untitled Worksheet',
    // Handle nested user structures from backend
    therapistName: assignment.therapist?.user 
      ? `${assignment.therapist.user.firstName} ${assignment.therapist.user.lastName}`
      : assignment.therapist?.firstName 
      ? `${assignment.therapist.firstName} ${assignment.therapist.lastName}`
      : 'Unknown Therapist',
    patientName: assignment.client?.user 
      ? `${assignment.client.user.firstName} ${assignment.client.user.lastName}`
      : assignment.user?.firstName 
      ? `${assignment.user.firstName} ${assignment.user.lastName}`
      : 'Unknown Patient',
    date: assignment.dueDate,
    status,
    isCompleted: assignment.status === 'SUBMITTED',
    instructions: assignment.instructions,
    materials,
    myWork,
    submittedAt: latestSubmission?.submittedAt,
    feedback: latestSubmission?.feedback || assignment.feedback,
  };
}
