import type { User } from '../models/User';
import { UserRole } from '../enums/UserRole';

const MOCK_USERS = [
  {
    id: 'user-001',
    firstName: 'Jan',
    lastName: 'Kowalski',
    role: UserRole.ADMIN,
  },
  {
    id: 'user-002',
    firstName: 'Anna',
    lastName: 'Nowak',
    role: UserRole.DEVOPS,
  },
  {
    id: 'user-003',
    firstName: 'Piotr',
    lastName: 'Wiśniewski',
    role: UserRole.DEVELOPER,
  },
  {
    id: 'user-004',
    firstName: 'Katarzyna',
    lastName: 'Zielińska',
    role: UserRole.TESTER,
  },
];

class UserManager {
  private currentUser: User | null = null;

  constructor() {
    this.currentUser = { ...MOCK_USERS[0] };
  }

  getUser(): User | null {
    return this.currentUser ? { ...this.currentUser } : null;
  }

  getAllUsers(): User[] {
    return [...MOCK_USERS];
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
    this.currentUser = { ...MOCK_USERS[0] };
  }
}

export const userManager = new UserManager();
