export interface TaskFile {
  id: string;
  filename: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  therapistName: string;
  date: string;
  status: "upcoming" | "past_due" | "completed";
  isCompleted: boolean;
  instructions?: string;
  materials?: TaskFile[];
  myWork?: TaskFile[];
  submittedAt?: string;
}
