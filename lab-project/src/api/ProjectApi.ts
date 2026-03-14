import type { Project, ProjectCreatePayload } from '../models/Project';

const STORAGE_KEY = 'manageme_projects';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

class ProjectApi {
  private getAll(): Project[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Project[];
    } catch {
      return [];
    }
  }

  private saveAll(projects: Project[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  async list(): Promise<Project[]> {
    return this.getAll();
  }

  async getById(id: string): Promise<Project | undefined> {
    return this.getAll().find((p) => p.id === id);
  }

  async create(payload: ProjectCreatePayload): Promise<Project> {
    const projects = this.getAll();
    const newProject: Project = {
      id: generateId(),
      ...payload,
    };
    projects.push(newProject);
    this.saveAll(projects);
    return newProject;
  }

  async update(payload: Project): Promise<Project> {
    const projects = this.getAll();
    const index = projects.findIndex((p) => p.id === payload.id);
    if (index === -1) {
      throw new Error(`Projekt o id "${payload.id}" nie istnieje.`);
    }
    projects[index] = { ...payload };
    this.saveAll(projects);
    return projects[index];
  }

  async delete(id: string): Promise<void> {
    const projects = this.getAll();
    const filtered = projects.filter((p) => p.id !== id);
    if (filtered.length === projects.length) {
      throw new Error(`Projekt o id "${id}" nie istnieje.`);
    }
    this.saveAll(filtered);
  }
}

export const projectApi = new ProjectApi();
