import { describe, it, beforeEach, expect } from 'bun:test';
import { AICommitGenerator } from '../ai';
import { CommitMessage } from '../types';

describe('AICommitGenerator', () => {
  const mockConfig = {
    apiKey: 'test-key',
    model: 'gpt-3.5-turbo',
    maxTokens: 500,
    temperature: 0.3,
  };

  describe('formatCommitMessage', () => {
    let generator: AICommitGenerator;

    beforeEach(() => {
      generator = new AICommitGenerator(mockConfig);
    });

    it('should format basic commit message', () => {
      const commit: CommitMessage = {
        type: 'feat',
        scope: 'auth',
        description: 'implement JWT validation',
        breakingChange: false,
      };

      const formatted = generator.formatCommitMessage(commit);
      expect(formatted).toBe('feat(auth): implement JWT validation');
    });

    it('should format commit with body', () => {
      const commit: CommitMessage = {
        type: 'fix',
        description: 'resolve memory leak',
        body: 'Fixed issue with event listeners not being cleaned up',
        breakingChange: false,
      };

      const formatted = generator.formatCommitMessage(commit);
      expect(formatted).toBe(
        'fix: resolve memory leak\n\nFixed issue with event listeners not being cleaned up'
      );
    });

    it('should format breaking change', () => {
      const commit: CommitMessage = {
        type: 'feat',
        scope: 'api',
        description: 'change authentication method',
        breakingChange: true,
      };

      const formatted = generator.formatCommitMessage(commit);
      expect(formatted).toBe(
        'feat(api)!: change authentication method\n\nBREAKING CHANGE: change authentication method'
      );
    });

    it('should format with footer', () => {
      const commit: CommitMessage = {
        type: 'fix',
        description: 'resolve login issue',
        footer: 'Closes #123',
        breakingChange: false,
      };

      const formatted = generator.formatCommitMessage(commit);
      expect(formatted).toBe('fix: resolve login issue\n\nCloses #123');
    });
  });

  describe('constructor', () => {
    it('should throw error without API key', () => {
      expect(() => {
        new AICommitGenerator({ ...mockConfig, apiKey: '' });
      }).toThrow('OpenAI API key is required');
    });
  });
});
