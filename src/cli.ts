#!/usr/bin/env bun

import { Command } from 'commander';
import { GitAnalyzer } from './git';
import { AICommitGenerator } from './ai';
import { DEFAULT_CONFIG, COMMIT_TYPES } from './config';
import { GenerateOptions } from './types';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

const program = new Command();

program.name('gitraven').description('AI-powered commit message generator').version('1.0.0');

program
  .command('generate', { isDefault: true })
  .description('Generate commit message for staged changes')
  .option('-d, --dry-run', 'Preview commit message without committing')
  .option('-p, --prompt <text>', 'Additional context for AI')
  .option('-m, --model <model>', 'OpenAI model to use', DEFAULT_CONFIG.model)
  .option('-s, --scope <scope>', 'Force specific scope')
  .option('-t, --type <type>', 'Force specific commit type')
  .option('-i, --interactive', 'Interactive mode with options')
  .option('-a, --auto-stage', 'Automatically stage changes if no staged changes found')
  .option('--push', 'Automatically push after successful commit')
  .option('--no-push', 'Disable auto-push (overrides --push)')
  .option('-A, --all', 'Equivalent to --auto-stage --push')
  .action(async (options) => {
    try {
      await generateCommit(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('types')
  .description('List available commit types')
  .action(() => {
    console.log(chalk.blue('\nAvailable commit types:\n'));
    Object.entries(COMMIT_TYPES).forEach(([type, description]) => {
      console.log(chalk.green(`${type.padEnd(10)}`), description);
    });
    console.log();
  });

program
  .command('config')
  .description('Show current configuration')
  .action(() => {
    console.log(chalk.blue('\nCurrent configuration:\n'));
    console.log(chalk.green('API Key:'), DEFAULT_CONFIG.apiKey ? '✓ Set' : '✗ Not set');
    console.log(chalk.green('Model:'), DEFAULT_CONFIG.model);
    console.log(chalk.green('Base URL:'), DEFAULT_CONFIG.baseURL || 'Default');
    console.log(chalk.green('Max Tokens:'), DEFAULT_CONFIG.maxTokens);
    console.log(chalk.green('Temperature:'), DEFAULT_CONFIG.temperature);
    console.log();
  });

async function generateCommit(options: GenerateOptions) {
  const spinner = ora();

  try {
    // Handle --all flag
    if (options.all) {
      options.autoStage = true;
      options.push = true;
    }

    spinner.start('Checking git repository...');
    const git = new GitAnalyzer();
    const isRepo = await git.isGitRepository();

    if (!isRepo) {
      spinner.fail('Not a git repository');
      throw new Error('Current directory is not a git repository');
    }

    spinner.succeed('Git repository found');

    spinner.start('Analyzing staged changes...');
    let gitDiff;
    
    try {
      gitDiff = await git.getStagedChanges();
    } catch (error) {
      if (error instanceof Error && error.message.includes('No staged changes found')) {
        spinner.stop();
        
        // Check if there are unstaged changes
        const hasUnstagedChanges = await git.hasUnstagedChanges();
        
        if (!hasUnstagedChanges) {
          spinner.fail('No changes found');
          throw new Error('No changes to commit. Working directory is clean.');
        }

        if (options.autoStage || options.all) {
          spinner.start('Auto-staging all changes...');
          await git.stageAllChanges();
          spinner.succeed('All changes staged automatically');
          
          spinner.start('Analyzing staged changes...');
          gitDiff = await git.getStagedChanges();
        } else {
          console.log(chalk.yellow('\n📁 Found unstaged changes but no staged changes.'));
          console.log(chalk.blue('Options:'));
          console.log(chalk.white('1. Stage changes manually: ') + chalk.green('git add .'));
          console.log(chalk.white('2. Use auto-stage: ') + chalk.green('gitraven --auto-stage'));
          console.log(chalk.white('3. Use auto-stage + push: ') + chalk.green('gitraven --all'));
          
          const shouldAutoStage = await promptForAutoStage();
          if (shouldAutoStage) {
            spinner.start('Staging all changes...');
            await git.stageAllChanges();
            spinner.succeed('All changes staged');
            
            spinner.start('Analyzing staged changes...');
            gitDiff = await git.getStagedChanges();
          } else {
            throw new Error('No staged changes found. Please stage your changes with "git add" first.');
          }
        }
      } else {
        throw error;
      }
    }

    if (gitDiff.files.length === 0) {
      spinner.fail('No staged changes found');
      throw new Error('No staged changes found. Please stage your changes with "git add" first.');
    }

    spinner.succeed(
      `Found ${gitDiff.files.length} staged file(s) with ${gitDiff.totalChanges} changes`
    );

    console.log(chalk.blue('\nStaged changes:'));
    gitDiff.files.forEach((file) => {
      const statusColor = getStatusColor(file.status);
      const statusSymbol = getStatusSymbol(file.status);
      console.log(
        `  ${statusColor(statusSymbol)} ${file.path} ${chalk.gray(`(+${file.insertions}/-${file.deletions})`)}`
      );
    });
    console.log();

    spinner.start('Generating commit message with AI...');
    const ai = new AICommitGenerator(DEFAULT_CONFIG);
    const commitMessage = await ai.generateCommitMessage(gitDiff, options);
    const formattedMessage = ai.formatCommitMessage(commitMessage);

    spinner.succeed('Commit message generated');

    console.log(chalk.blue('\n📝 Generated commit message:\n'));
    console.log(chalk.white(formatCommitMessageForDisplay(formattedMessage)));
    console.log();

    if (options.interactive) {
      const action = await promptForAction();

      switch (action) {
        case 'commit':
          break; // Continue to commit
        case 'edit': {
          const editedMessage = await promptForEdit(formattedMessage);
          await commitChanges(git, editedMessage);
          return;
        }
        case 'regenerate':
          console.log(chalk.yellow('Regenerating...'));
          return generateCommit({ ...options, interactive: false });
        case 'cancel':
          console.log(chalk.yellow('Cancelled'));
          return;
      }
    }

    // Dry run check
    if (options.dryRun) {
      console.log(chalk.yellow('Dry run mode - commit message preview only'));
      return;
    }

    // Confirm commit
    const shouldCommit = await promptForConfirmation();
    if (!shouldCommit) {
      console.log(chalk.yellow('Cancelled'));
      return;
    }

    // Commit changes
    await commitChanges(git, formattedMessage);
    
    // Auto-push if requested
    if (options.push && !options.noPush && !options.dryRun) {
      const shouldPush = options.all || await promptForPush();
      if (shouldPush) {
        await pushChanges(git);
      }
    }
  } catch (error) {
    spinner.fail('Failed to generate commit message');
    throw error;
  }
}

async function commitChanges(git: GitAnalyzer, message: string) {
  const spinner = ora('Committing changes...').start();

  try {
    await git.commitChanges(message);
    spinner.succeed('Changes committed successfully');
    console.log(chalk.green('\n✨ Commit created!'));
  } catch (error) {
    spinner.fail('Failed to commit changes');
    throw error;
  }
}

async function promptForConfirmation(): Promise<boolean> {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Commit with this message?',
      default: true,
    },
  ]);

  return confirm;
}

async function promptForAction(): Promise<string> {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '✅ Commit with this message', value: 'commit' },
        { name: '✏️  Edit message', value: 'edit' },
        { name: '🔄 Regenerate message', value: 'regenerate' },
        { name: '❌ Cancel', value: 'cancel' },
      ],
    },
  ]);

  return action;
}

async function promptForEdit(currentMessage: string): Promise<string> {
  const { message } = await inquirer.prompt([
    {
      type: 'editor',
      name: 'message',
      message: 'Edit the commit message:',
      default: currentMessage,
    },
  ]);

  return message.trim();
}

function getStatusColor(status: string): (text: string) => string {
  switch (status) {
    case 'added':
      return chalk.green;
    case 'modified':
      return chalk.yellow;
    case 'deleted':
      return chalk.red;
    case 'renamed':
      return chalk.blue;
    default:
      return chalk.white;
  }
}

function getStatusSymbol(status: string): string {
  switch (status) {
    case 'added':
      return '+';
    case 'modified':
      return '~';
    case 'deleted':
      return '-';
    case 'renamed':
      return '→';
    default:
      return '?';
  }
}

function formatCommitMessageForDisplay(message: string): string {
  const lines = message.split('\n');
  const [firstLine, ...bodyLines] = lines;

  let formatted = chalk.cyan(firstLine);

  if (bodyLines.length > 0) {
    const body = bodyLines.join('\n');
    formatted += '\n' + chalk.gray(body);
  }

  return formatted;
}

async function promptForAutoStage(): Promise<boolean> {
  const { autoStage } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'autoStage',
      message: 'Would you like to stage all changes automatically?',
      default: true,
    },
  ]);

  return autoStage;
}

async function promptForPush(): Promise<boolean> {
  const { push } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'push',
      message: 'Push changes to remote repository?',
      default: false,
    },
  ]);

  return push;
}

async function pushChanges(git: GitAnalyzer): Promise<void> {
  const spinner = ora('Pushing changes to remote...').start();

  try {
    await git.pushChanges();
    spinner.succeed('Changes pushed successfully');
    console.log(chalk.green('\n🚀 Changes pushed to remote repository!'));
  } catch (error) {
    spinner.fail('Failed to push changes');
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(chalk.yellow(`\n⚠️  Push failed: ${errorMessage}`));
    
    // Get current branch for better error message
    try {
      const branchInfo = await git.getCurrentBranch();
      console.log(chalk.blue('Manual push command: ') + chalk.green(`git push origin ${branchInfo}`));
      
      // Check if it's a first push issue
      if (errorMessage.includes('no upstream') || errorMessage.includes('set-upstream')) {
        console.log(chalk.blue('Or set upstream: ') + chalk.green(`git push --set-upstream origin ${branchInfo}`));
      }
    } catch {
      console.log(chalk.blue('Try manually: ') + chalk.green('git push'));
    }
  }
}

process.on('uncaughtException', (error) => {
  console.error(chalk.red('\nUnexpected error:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error(chalk.red('\nUnexpected error:'), error);
  process.exit(1);
});

program.parse();
