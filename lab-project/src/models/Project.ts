export interface Project {
  id: string;
  name: string;
  description: string;
}

export type ProjectCreatePayload = Omit<Project, 'id'>;
