const STORAGE_KEY = 'manageme_active_project_id';

class ActiveProjectApi {
  get(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  }

  set(projectId: string): void {
    localStorage.setItem(STORAGE_KEY, projectId);
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const activeProjectApi = new ActiveProjectApi();
