export interface CommitOption {
  message: string;
  description: string;
}

export class CommitlyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CommitlyError';
  }
}
