import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { AIConfig } from './types';

const envPaths = [
  '.env',
  '.env.local',
  path.join(process.env.HOME || process.env.USERPROFILE || '', '.gitraven.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

export const DEFAULT_CONFIG: AIConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  baseURL: process.env.OPENAI_BASE_URL,
  maxTokens: 500,
  temperature: 0.3,
};

export const COMMIT_TYPES = {
  feat: 'A new feature',
  fix: 'A bug fix',
  docs: 'Documentation only changes',
  style:
    'Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)',
  refactor: 'A code change that neither fixes a bug nor adds a feature',
  test: 'Adding missing tests or correcting existing tests',
  chore:
    'Changes to the build process or auxiliary tools and libraries such as documentation generation',
  perf: 'A code change that improves performance',
  ci: 'Changes to our CI configuration files and scripts',
  build: 'Changes that affect the build system or external dependencies',
  revert: 'Reverts a previous commit',
} as const;

export const MAX_DESCRIPTION_LENGTH = 72;
export const MAX_BODY_LINE_LENGTH = 100;
