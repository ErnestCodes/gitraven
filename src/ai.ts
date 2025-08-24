import OpenAI from 'openai';
import { GitDiff, CommitMessage, AIConfig, AnalysisResult, GenerateOptions } from './types';
import { COMMIT_TYPES, MAX_DESCRIPTION_LENGTH } from './config';

export class AICommitGenerator {
  private openai: OpenAI;
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;

    if (!config.apiKey) {
      throw new Error(
        'OpenAI API key is required. Please set OPENAI_API_KEY environment variable.'
      );
    }

    this.openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
  }

  async analyzeChanges(gitDiff: GitDiff): Promise<AnalysisResult> {
    const prompt = this.buildAnalysisPrompt(gitDiff);

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert software engineer who analyzes git changes and provides structured analysis.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      return this.parseAnalysisResponse(content);
    } catch (error) {
      throw new Error(
        `AI analysis failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async generateCommitMessage(
    gitDiff: GitDiff,
    options: GenerateOptions = {}
  ): Promise<CommitMessage> {
    const analysis = await this.analyzeChanges(gitDiff);
    const prompt = this.buildCommitPrompt(gitDiff, analysis, options);

    try {
      const response = await this.openai.chat.completions.create({
        model: options.model || this.config.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI service');
      }

      return this.parseCommitResponse(content, analysis);
    } catch (error) {
      throw new Error(
        `Commit generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private getSystemPrompt(): string {
    return `You are an expert at writing exceptional conventional commit messages. Follow these rules strictly:

1. COMPLETE DESCRIPTIONS: Write comprehensive, specific descriptions that fully explain the change
2. Use conventional commit format: type(scope): description
3. Keep description under ${MAX_DESCRIPTION_LENGTH} characters but make it as descriptive as possible
4. Use present tense, imperative mood ("add" not "added" or "adds")
5. Don't capitalize first letter of description
6. No period at the end of description
7. Available types: ${Object.keys(COMMIT_TYPES).join(', ')}
8. Scope should be meaningful and specific (e.g., auth, api, ui, database, config)
9. ALWAYS include a detailed body explaining what changed and why
10. Body should explain the business value, problem solved, or improvement made
11. Use BREAKING CHANGE: prefix for breaking changes

QUALITY EXAMPLES:
- feat(auth): implement comprehensive JWT token validation with refresh mechanism
- fix(api): resolve race condition in user creation causing duplicate accounts
- docs(api): add detailed endpoint documentation with request/response examples
- refactor(database): optimize user query performance by adding composite indexes

BODY GUIDELINES:
- Explain the motivation for the change
- Describe what was changed at a high level
- Mention any side effects or important considerations
- Reference any issues or tickets when applicable`;
  }

  private buildAnalysisPrompt(gitDiff: GitDiff): string {
    const filesSummary = gitDiff.files
      .map((file) => {
        const status = file.status === 'renamed' ? `renamed from ${file.oldPath}` : file.status;
        return `- ${file.path} (${status}, +${file.insertions}/-${file.deletions})`;
      })
      .join('\n');

    return `Analyze these git changes and respond with ONLY a JSON object:

Files changed:
${filesSummary}

Changes preview:
${gitDiff.files
  .slice(0, 3)
  .map((file) => `${file.path}:\n${file.changes.split('\n').slice(0, 5).join('\n')}`)
  .join('\n\n')}

Respond with JSON only:
{
  "summary": "Brief description of what changed",
  "suggestedType": "one of: ${Object.keys(COMMIT_TYPES).join(', ')}",
  "suggestedScope": "optional scope like auth, api, ui",
  "breakingChange": true/false,
  "confidence": 0.0-1.0
}`;
  }

  private buildCommitPrompt(
    gitDiff: GitDiff,
    analysis: AnalysisResult,
    options: GenerateOptions
  ): string {
    let prompt = `Generate a conventional commit message for these changes:

Analysis: ${analysis.summary}
Suggested type: ${analysis.suggestedType}
${analysis.suggestedScope ? `Suggested scope: ${analysis.suggestedScope}` : ''}
Breaking change: ${analysis.breakingChange}

Files changed (${gitDiff.files.length}):
${gitDiff.files.map((file) => `- ${file.path} (${file.status}, +${file.insertions}/-${file.deletions})`).join('\n')}

Key changes:
${gitDiff.files
  .slice(0, 3)
  .map((file) => `${file.path}:\n${file.changes.split('\n').slice(0, 10).join('\n')}`)
  .join('\n\n')}`;

    if (options.prompt) {
      prompt += `\n\nAdditional context: ${options.prompt}`;
    }

    if (options.type) {
      prompt += `\n\nRequired type: ${options.type}`;
    }

    if (options.scope) {
      prompt += `\n\nRequired scope: ${options.scope}`;
    }

    prompt += `\n\nGenerate a HIGH-QUALITY commit message in this JSON format:
{
  "type": "commit type",
  "scope": "specific meaningful scope",
  "description": "comprehensive description under ${MAX_DESCRIPTION_LENGTH} chars explaining what was changed",
  "body": "REQUIRED: detailed explanation of what changed, why it was needed, and what problem it solves. Include business context and impact.",
  "breakingChange": true/false,
  "footer": "optional footer for issues/breaking changes or additional notes"
}

REQUIREMENTS:
- Description must be specific and complete
- Body is REQUIRED and should be 2-4 sentences explaining the change comprehensively
- Focus on the business value and user impact
- Make it clear what problem this solves`;

    return prompt;
  }

  private parseAnalysisResponse(content: string): AnalysisResult {
    try {
      const parsed = JSON.parse(content.trim());
      return {
        summary: parsed.summary || 'Code changes detected',
        suggestedType: parsed.suggestedType || 'chore',
        suggestedScope: parsed.suggestedScope,
        breakingChange: parsed.breakingChange || false,
        confidence: parsed.confidence || 0.5,
      };
    } catch {
      // Fallback parsing
      return {
        summary: 'Code changes detected',
        suggestedType: 'chore',
        breakingChange: false,
        confidence: 0.3,
      };
    }
  }

  private parseCommitResponse(content: string, analysis: AnalysisResult): CommitMessage {
    try {
      const parsed = JSON.parse(content.trim());
      return {
        type: parsed.type || analysis.suggestedType,
        scope: parsed.scope || analysis.suggestedScope,
        description: parsed.description || analysis.summary,
        body: parsed.body,
        footer: parsed.footer,
        breakingChange: parsed.breakingChange || analysis.breakingChange,
      };
    } catch {
      // Fallback to analysis
      return {
        type: analysis.suggestedType,
        scope: analysis.suggestedScope,
        description: analysis.summary.substring(0, MAX_DESCRIPTION_LENGTH),
        breakingChange: analysis.breakingChange,
      };
    }
  }

  formatCommitMessage(commit: CommitMessage): string {
    let message = commit.type;

    if (commit.scope) {
      message += `(${commit.scope})`;
    }

    if (commit.breakingChange) {
      message += '!';
    }

    message += `: ${commit.description}`;

    if (commit.body) {
      message += `\n\n${commit.body}`;
    }

    if (commit.footer) {
      message += `\n\n${commit.footer}`;
    }

    if (commit.breakingChange && !commit.footer?.includes('BREAKING CHANGE:')) {
      message += `\n\nBREAKING CHANGE: ${commit.description}`;
    }

    return message;
  }
}
