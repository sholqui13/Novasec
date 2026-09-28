export interface LoginCredentials {
  readonly username: string;
  readonly password: string;
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid username or password');
    this.name = 'InvalidCredentialsError';
  }
}
