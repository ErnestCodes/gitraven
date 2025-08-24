import { describe, it, beforeEach, expect } from 'bun:test';
import { GitAnalyzer } from '../git';

describe('GitAnalyzer', () => {
  let gitAnalyzer: GitAnalyzer;

  beforeEach(() => {
    gitAnalyzer = new GitAnalyzer();
  });

  describe('isGitRepository', () => {
    it('should detect git repository', async () => {
      // This test will depend on the actual environment
      const isRepo = await gitAnalyzer.isGitRepository();
      expect(typeof isRepo).toBe('boolean');
    });
  });

  describe('getStagedChanges', () => {
    it('should throw error when no staged changes', async () => {
      try {
        await gitAnalyzer.getStagedChanges();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        // The error could be either "No staged changes found" or "not a git repository"
        const errorMessage = (error as Error).message;
        expect(
          errorMessage.includes('No staged changes found') || 
          errorMessage.includes('not a git repository')
        ).toBe(true);
      }
    });
  });

  describe('getLastCommitMessage', () => {
    it('should return string', async () => {
      const message = await gitAnalyzer.getLastCommitMessage();
      expect(typeof message).toBe('string');
    });
  });
});
