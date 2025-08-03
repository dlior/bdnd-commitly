import chalk from 'chalk';
import inquirer from 'inquirer';
import { CommitlyError, type CommitOption } from './types';

export async function selectCommitMessage(commits: CommitOption[]): Promise<string> {
  console.log(chalk.cyan('\n> Generated commit messages:\n'));
  const choices = commits.map((commit) => ({
    name: `${chalk.green(commit.message)}\n   ${chalk.gray(commit.description)}`,
    value: commit.message,
    short: commit.message,
  }));
  choices.push({
    name: chalk.red('L Cancel'),
    value: 'CANCEL',
    short: 'Cancel',
  });
  const { selectedCommit } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedCommit',
      message: 'Select a commit message:',
      choices,
      pageSize: 10,
    },
  ]);
  if (selectedCommit === 'CANCEL') {
    throw new CommitlyError('Commit cancelled by user');
  }
  return selectedCommit;
}

export function printInfo(msg: string) {
  console.log(chalk.gray(msg));
}

export function printSuccess(msg: string) {
  console.log(chalk.green(msg));
}

export function printError(msg: string) {
  console.error(chalk.red(msg));
}
