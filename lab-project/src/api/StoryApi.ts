import type { Story, StoryCreatePayload } from '../models/Story';

const STORAGE_KEY = 'manageme_stories';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

class StoryApi {
  private getAll(): Story[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Story[];
    } catch {
      return [];
    }
  }

  private saveAll(stories: Story[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
  }

  async listByProject(projectId: string): Promise<Story[]> {
    return this.getAll().filter((s) => s.projectId === projectId);
  }

  async getById(id: string): Promise<Story | undefined> {
    return this.getAll().find((s) => s.id === id);
  }

  async create(payload: StoryCreatePayload): Promise<Story> {
    const stories = this.getAll();
    const newStory: Story = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...payload,
    };
    stories.push(newStory);
    this.saveAll(stories);
    return newStory;
  }

  async update(payload: Story): Promise<Story> {
    const stories = this.getAll();
    const index = stories.findIndex((s) => s.id === payload.id);
    if (index === -1) {
      throw new Error(`Historyjka o id "${payload.id}" nie istnieje.`);
    }
    stories[index] = { ...payload };
    this.saveAll(stories);
    return stories[index];
  }

  async delete(id: string): Promise<void> {
    const stories = this.getAll();
    const filtered = stories.filter((s) => s.id !== id);
    if (filtered.length === stories.length) {
      throw new Error(`Historyjka o id "${id}" nie istnieje.`);
    }
    this.saveAll(filtered);
  }
}

export const storyApi = new StoryApi();
