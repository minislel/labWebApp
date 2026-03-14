import type { User } from '../models/User';

const MOCK_USER: User = {
  id: 'user-001',
  firstName: 'Jan',
  lastName: 'Kowalski',
};

class UserManager {
  private currentUser: User | null = null;

  constructor() {
    this.currentUser = { ...MOCK_USER };
  }

  getUser(): User | null {
    return this.currentUser ? { ...this.currentUser } : null;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  getFullName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  logout(): void {
    this.currentUser = null;
  }

  loginMock(): void {
    this.currentUser = { ...MOCK_USER };
  }
}

export const userManager = new UserManager();
