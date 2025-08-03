import simpleGit from 'simple-git';
import { CommitlyError } from './types';

const git = simpleGit();

export async function checkGitRepo(): Promise<void> {
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    throw new CommitlyError('Not a git repository. Please run this command from within a git repository.');
  }
}

export async function getGitDiff(): Promise<string> {
  const status = await git.status();
  if (status.files.length === 0) {
    throw new CommitlyError('No changes detected. Stage some changes first with "git add".');
  }
  const diff = await git.diff(['--cached']);
  if (!diff.trim()) {
    throw new CommitlyError(
      'No staged changes found. Stage your changes with "git add" before generating commit messages.',
    );
  }
  return diff;
}

export async function commitChanges(message: string): Promise<void> {
  try {
    await git.commit(message);
  } catch (error) {
    throw new CommitlyError(`Failed to commit: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
