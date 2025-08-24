# GitRaven 🐦‍⬛

An intelligent AI-powered commit message generator that analyzes your git changes and creates industry-standard commit messages following conventional commit format.

## Features

- 🤖 **AI-Powered**: Uses OpenAI's GPT models to analyze code changes
- 📝 **Conventional Commits**: Follows industry-standard commit message format
- 🔍 **Smart Analysis**: Analyzes git diff to understand what changed
- ⚡ **Fast & Easy**: Simple CLI interface with intuitive commands
- 🎨 **Customizable**: Configure AI model, templates, and formatting
- 🛡️ **Safe**: Preview messages before committing

## Installation

### Global Installation

#### Using npm
```bash
npm install -g gitraven
```

#### Using Bun (Recommended for speed)
```bash
bun install -g gitraven
```

#### Using Yarn
```bash
yarn global add gitraven
```

#### Using pnpm
```bash
pnpm add -g gitraven
```

### One-time Usage (No Installation)

#### Using npx
```bash
npx gitraven
```

#### Using bunx
```bash
bunx gitraven
```

## Quick Start

1. Navigate to your git repository
2. Stage your changes: `git add .`
3. Generate commit message: `gitraven` or `gr`
4. Review and confirm the generated message

## Usage

### Basic Usage
```bash
# Generate commit message for staged changes
gitraven

# Auto-stage changes and generate commit (if no staged changes)
gitraven --auto-stage

# Auto-stage and auto-push (complete workflow)
gitraven --all

# Preview without committing
gitraven --dry-run
```

### Advanced Options
```bash
# Generate with custom prompt for more context
gitraven --prompt "Focus on performance improvements"

# Use specific AI model
gitraven --model gpt-4

# Force specific commit type and scope
gitraven --type feat --scope auth

# Interactive mode with step-by-step options
gitraven --interactive

# Auto-stage changes, commit, and push to remote
gitraven --auto-stage --push

# Show all available options
gitraven --help
```

### Workflow Examples
```bash
# Quick workflow: stage → commit → push
gitraven --all

# Review workflow: generate → review → commit
gitraven --interactive

# Safe workflow: preview only
gitraven --dry-run
```

## Configuration

Create a `.env` file in your project or home directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
```

## Conventional Commit Format

GitRaven follows the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Examples

### Enhanced Commit Messages
GitRaven now generates comprehensive, detailed commit messages:

```bash
$ gitraven --all

✓ Git repository found
✓ Auto-staging all changes
✓ Found 3 staged file(s) with 45 changes
✓ Commit message generated

📝 Generated commit message:

feat(auth): implement comprehensive JWT token validation with refresh mechanism

Add robust JWT authentication middleware that validates tokens on protected routes.
Implements automatic token refresh, proper error handling for expired tokens,
and secure cookie-based session management. This enhances security and improves
user experience by reducing the need for frequent re-authentication.

Closes #123
```

### Auto-Staging Workflow
```bash
$ gitraven
📁 Found unstaged changes but no staged changes.
Options:
1. Stage changes manually: git add .
2. Use auto-stage: gitraven --auto-stage  
3. Use auto-stage + push: gitraven --all

Would you like to stage all changes automatically? (Y/n) y
✓ All changes staged
✓ Commit message generated
✓ Changes committed successfully
🚀 Changes pushed to remote repository!
```
### Need help? 

help center and setup:

```bash
npm info gitraven

npm install -g gitraven
gitraven --help

npx gitraven --help
```

## License

MIT © ErnestCodes 
