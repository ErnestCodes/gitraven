// Main entry point for the GitRaven library
import { GitAnalyzer } from './git';
import { AICommitGenerator } from './ai';
import { DEFAULT_CONFIG, COMMIT_TYPES } from './config';

export { GitAnalyzer, AICommitGenerator, DEFAULT_CONFIG, COMMIT_TYPES };
export * from './types';

// Default export for library usage
export default {
  GitAnalyzer,
  AICommitGenerator,
  DEFAULT_CONFIG,
  COMMIT_TYPES,
};
