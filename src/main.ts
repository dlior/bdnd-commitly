import { Command } from 'commander';
import { config } from 'dotenv';
import { printError, printInfo, printSuccess, selectCommitMessage } from './cli';
import { checkGitRepo, commitChanges, getGitDiff } from './git';
import { generateCommitMessages, initializeOpenAI } from './openai';
import { CommitlyError } from './types';

config();

const program = new Command();

async function main(): Promise<void> {
  try {
    printInfo('= bdnd-commitly - AI-powered conventional commits\n');
    await checkGitRepo();
    printInfo('Git repository detected');
    const diff = await getGitDiff();
    printInfo('Staged changes found');
    const openai = await initializeOpenAI();
    printInfo('OpenAI client initialized');
    printInfo('= Generating commit messages...');
    const commits = await generateCommitMessages(openai, diff);
    const selectedMessage = await selectCommitMessage(commits);
    await commitChanges(selectedMessage);
    printSuccess(`\nSuccessfully committed with message: "${selectedMessage}"`);
  } catch (error) {
    if (error instanceof CommitlyError) {
      printError(`\nError: ${error.message}`);
      process.exit(1);
    } else {
      printError(`\nUnexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  }
}

program
  .name('bdnd-commitly')
  .description('AI-powered conventional commit message generator')
  .version('1.0.0')
  .action(main);

program.parse();
