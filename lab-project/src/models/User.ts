import { UserRole } from "../enums/UserRole";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}
