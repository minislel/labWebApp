export type TaskState = 'todo' | 'doing' | 'done';

export interface Task {
  id: string;
  name: string;
  description: string;
  storyId: string;
  realizedHours: number;
  startDate?: string;
  assigneeId: string | null;
  state: TaskState;
  createdAt: string;
}

export type TaskCreatePayload = Omit<Task, 'id' | 'createdAt'>;
