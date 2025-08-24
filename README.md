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

```bash
# Generate commit message for staged changes
gitraven

# Generate with custom prompt
gitraven --prompt "Focus on performance improvements"

# Preview without committing
gitraven --dry-run

# Use specific AI model
gitraven --model gpt-4

# Show help
gitraven --help
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

```bash
$ git add src/auth.ts
$ gitraven

✨ Analyzing changes...
📝 Generated commit message:

feat(auth): implement JWT token validation

Add middleware to validate JWT tokens in protected routes.
Includes error handling for expired and invalid tokens.

Commit this message? (y/N) y
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
