export type UserRole = 'analyst' | 'supervisor';

export interface User {
  readonly id: string;
  readonly username: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
  readonly jobTitle?: string;
  readonly initials: string;
  readonly avatarUrl?: string;
}
