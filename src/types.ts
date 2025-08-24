export interface GitDiff {
  files: GitFile[];
  insertions: number;
  deletions: number;
  totalChanges: number;
}

export interface GitFile {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  insertions: number;
  deletions: number;
  changes: string;
  oldPath?: string; // for renamed files
}

export interface CommitMessage {
  type: CommitType;
  scope?: string;
  description: string;
  body?: string;
  footer?: string;
  breakingChange?: boolean;
}

export type CommitType =
  | 'feat' // New features
  | 'fix' // Bug fixes
  | 'docs' // Documentation changes
  | 'style' // Code style changes (formatting, etc.)
  | 'refactor' // Code refactoring
  | 'test' // Adding or updating tests
  | 'chore' // Maintenance tasks
  | 'perf' // Performance improvements
  | 'ci' // CI/CD changes
  | 'build' // Build system changes
  | 'revert'; // Reverting changes

export interface AIConfig {
  apiKey: string;
  model: string;
  baseURL?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GenerateOptions {
  dryRun?: boolean;
  prompt?: string;
  model?: string;
  scope?: string;
  type?: CommitType;
  interactive?: boolean;
}

export interface AnalysisResult {
  summary: string;
  suggestedType: CommitType;
  suggestedScope?: string;
  breakingChange: boolean;
  confidence: number;
}
