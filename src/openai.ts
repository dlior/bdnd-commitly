import OpenAI from 'openai';
import { CommitlyError, type CommitOption } from './types';

export async function initializeOpenAI(): Promise<OpenAI> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new CommitlyError('OpenAI API key not found. Please set OPENAI_API_KEY environment variable.');
  }

  return new OpenAI({ apiKey, baseURL: 'http://localhost:1234/v1' });
}

export async function generateCommitMessages(openai: OpenAI, diff: string): Promise<CommitOption[]> {
  const prompt = `
  You are a helpful assistant skilled in software development and git practices.

  Based on the following git diff, generate **3 conventional commit messages** that follow the format:  
  **type: description**

  Use only these conventional commit types:
  - feat: A new feature
  - fix: A bug fix
  - docs: Documentation only changes
  - style: Changes that do not affect the meaning of the code (e.g. formatting)
  - refactor: A code change that neither fixes a bug nor adds a feature
  - perf: A code change that improves performance
  - test: Adding or fixing tests
  - chore: Changes to the build process or auxiliary tools

  ### Requirements:
  - Return **exactly 3** distinct commit messages.
  - Each must include:
    - A "message" field with the conventional commit string.
    - A "description" field explaining what the commit changes in more detail.
  - Output must be valid **JSON**: an array of 3 objects.
  - Do **not** include explanations, markdown, or extra text.

  ### Example output:
  [
    {
      "message": "feat: add user authentication system",
      "description": "Implements login and logout functionality using JWT tokens"
    }
  ]
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates conventional commit messages. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new CommitlyError('No response from OpenAI API');
    }

    try {
      const commits = JSON.parse(content) as CommitOption[];

      if (!Array.isArray(commits) || commits.length !== 3) {
        throw new CommitlyError('Invalid response format from OpenAI');
      }

      return commits;
    } catch (_) {
      throw new CommitlyError('Failed to parse OpenAI response as JSON');
    }
  } catch (error) {
    if (error instanceof CommitlyError) {
      throw error;
    }

    throw new CommitlyError(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
