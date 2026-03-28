export const UserRole = {
  ADMIN: 'ADMIN',
  DEVOPS: 'DEVOPS',
  DEVELOPER: 'DEVELOPER',
  TESTER: 'TESTER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];


