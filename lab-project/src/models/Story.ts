export type StoryPriority = 'low' | 'medium' | 'high';
export type StoryState = 'todo' | 'doing' | 'done';

export interface Story {
  id: string;
  name: string;
  description: string;
  priority: StoryPriority;
  projectId: string;
  createdAt: string;
  state: StoryState;
  ownerId: string;
  assigneeId: string;
  taskIds: string[];
}

export type StoryCreatePayload = Omit<Story, 'id' | 'createdAt' | 'assigneeId' | 'taskIds'>;
