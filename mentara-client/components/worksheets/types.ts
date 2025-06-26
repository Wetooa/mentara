export interface TaskFile {
  id: string;
  filename: string;
  url: string;
  uploading?: boolean; // For showing upload progress
}

export interface Task {
  id: string;
  title: string;
  therapistName?: string;
  patientName?: string;
  date: string;
  status: "upcoming" | "past_due" | "completed" | "assigned";
  isCompleted: boolean;
  instructions?: string;
  materials?: TaskFile[];
  myWork?: TaskFile[];
  submittedAt?: string;
  feedback?: string;
}
