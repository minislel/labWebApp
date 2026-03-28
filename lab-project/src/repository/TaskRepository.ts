import type { Task, TaskCreatePayload } from '../models/Task';

const STORAGE_KEY = 'manageme_tasks';

class TaskRepository {
  private getTasks(): Task[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private setTasks(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  async listByStory(storyId: string): Promise<Task[]> {
    return this.getTasks().filter((t) => t.storyId === storyId);
  }

  async getById(id: string): Promise<Task | null> {
    return this.getTasks().find((t) => t.id === id) || null;
  }

  async create(payload: TaskCreatePayload): Promise<Task> {
    const tasks = this.getTasks();
    const newTask: Task = {
      ...payload,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    this.setTasks(tasks);
    return newTask;
  }

  async update(task: Task): Promise<Task> {
    const tasks = this.getTasks();
    const index = tasks.findIndex((t) => t.id === task.id);
    if (index === -1) throw new Error('Task not found');
    tasks[index] = task;
    this.setTasks(tasks);
    return task;
  }

  async delete(id: string): Promise<void> {
    const tasks = this.getTasks();
    const filtered = tasks.filter((t) => t.id !== id);
    if (tasks.length === filtered.length) throw new Error('Task not found');
    this.setTasks(filtered);
  }
}

export const taskRepository = new TaskRepository();
