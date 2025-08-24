import { simpleGit, SimpleGit } from 'simple-git';
import { GitDiff, GitFile } from './types';

export class GitAnalyzer {
  private git: SimpleGit;

  constructor(workingDir?: string) {
    this.git = simpleGit(workingDir || process.cwd());
  }

  async isGitRepository(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch {
      return false;
    }
  }

  async getStagedChanges(): Promise<GitDiff> {
    try {
      const status = await this.git.status();
      const stagedFiles = [
        ...status.staged,
        ...status.created,
        ...status.modified.filter((file) => status.staged.includes(file)),
      ];

      if (stagedFiles.length === 0) {
        throw new Error('No staged changes found. Please stage your changes with "git add" first.');
      }

      // Get diff for staged changes
      const diff = await this.git.diff(['--cached', '--numstat']);
      const diffDetails = await this.git.diff(['--cached']);

      const files = await this.parseDiffOutput(diff, diffDetails, stagedFiles);

      const totalInsertions = files.reduce((sum, file) => sum + file.insertions, 0);
      const totalDeletions = files.reduce((sum, file) => sum + file.deletions, 0);

      return {
        files,
        insertions: totalInsertions,
        deletions: totalDeletions,
        totalChanges: totalInsertions + totalDeletions,
      };
    } catch (error) {
      throw new Error(
        `Failed to analyze git changes: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getLastCommitMessage(): Promise<string> {
    try {
      const log = await this.git.log({ maxCount: 1 });
      return log.latest?.message || '';
    } catch {
      return '';
    }
  }

  async commitChanges(message: string): Promise<void> {
    try {
      await this.git.commit(message);
    } catch (error) {
      throw new Error(
        `Failed to commit changes: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async hasUnstagedChanges(): Promise<boolean> {
    try {
      const status = await this.git.status();
      return (
        status.modified.length > 0 ||
        status.not_added.length > 0 ||
        status.deleted.length > 0 ||
        status.renamed.length > 0
      );
    } catch {
      return false;
    }
  }

  async stageAllChanges(): Promise<void> {
    try {
      await this.git.add('.');
    } catch (error) {
      throw new Error(
        `Failed to stage changes: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async pushChanges(): Promise<void> {
    try {
      await this.git.push();
    } catch (error) {
      throw new Error(
        `Failed to push changes: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async parseDiffOutput(
    numstat: string,
    diffDetails: string,
    _stagedFiles: string[]
  ): Promise<GitFile[]> {
    const files: GitFile[] = [];
    const numstatLines = numstat
      .trim()
      .split('\n')
      .filter((line) => line.length > 0);

    for (const line of numstatLines) {
      const [insertions, deletions, filePath] = line.split('\t');

      if (!filePath) continue;

      let status: GitFile['status'] = 'modified';
      const actualPath = filePath;
      let oldPath: string | undefined;

      if (insertions === '-' && deletions === '-') {
        continue;
      }

      if (!(await this.git.show([`HEAD:${filePath}`]).catch(() => false))) {
        status = 'added';
      }

      // Check for renames in diff details
      const renameMatch = diffDetails.match(
        new RegExp(`diff --git a/(.*?) b/${filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
      );
      if (renameMatch && renameMatch[1] !== filePath) {
        status = 'renamed';
        oldPath = renameMatch[1];
      }

      const fileChanges = this.extractFileChanges(diffDetails, filePath);

      files.push({
        path: actualPath,
        status,
        insertions: parseInt(insertions) || 0,
        deletions: parseInt(deletions) || 0,
        changes: fileChanges,
        oldPath,
      });
    }

    return files;
  }

  private extractFileChanges(diffDetails: string, filePath: string): string {
    const fileStartPattern = new RegExp(
      `diff --git.*?${filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
      'g'
    );
    const matches = [...diffDetails.matchAll(fileStartPattern)];

    if (matches.length === 0) return '';

    const startIndex = matches[0].index || 0;
    const nextFileMatch = diffDetails.indexOf('diff --git', startIndex + 1);
    const endIndex = nextFileMatch === -1 ? diffDetails.length : nextFileMatch;

    const fileDiff = diffDetails.substring(startIndex, endIndex);

    const lines = fileDiff.split('\n');
    const changes: string[] = [];

    for (const line of lines) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        changes.push(line.substring(1).trim());
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        changes.push(`[REMOVED] ${line.substring(1).trim()}`);
      }
    }

    return changes.slice(0, 20).join('\n'); // Limit to first 20 changes
  }
}
