import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const client = new OpenAI({
    baseURL: 'http://localhost:1234/v1',
  });

  const response = await client.completions.create({
    model: 'gpt-4.1',
    prompt: 'Write a one-sentence bedtime story about a unicorn.',
  });

  console.log(response.choices);
}
main().catch(console.error);
