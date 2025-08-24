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

## Development Setup

### Using Bun (Recommended)
```bash
# Clone the repository
git clone https://github.com/emeksthecreator/gitraven.git
cd gitraven

# Install dependencies
bun install

# Set up environment
cp env.example .env
# Edit .env and add your OpenAI API key

# Run in development mode
bun run dev

# Build the project
bun run build

# Run tests
bun test

# Install globally for testing
bun install -g .
```

### Using npm
```bash
# Clone the repository
git clone https://github.com/emeksthecreator/gitraven.git
cd gitraven

# Install dependencies
npm install

# Set up environment
cp env.example .env
# Edit .env and add your OpenAI API key

# Run in development mode
npm run dev

# Build the project
npm run build

# Run tests
npm test

# Install globally for testing
npm install -g .
```

## Publishing to npm

### Prerequisites

1. **Create an npm account**: Sign up at [npmjs.com](https://www.npmjs.com/)
2. **Login to npm CLI**: Run `npm login` and enter your credentials
3. **Verify package name**: Check that "gitraven" is available on npm

### Publishing Steps

#### Manual Publishing

```bash
# 1. Make sure you're logged in
npm whoami

# 2. Build the package
bun run build:all

# 3. Test the package locally
npm pack
# This creates a .tgz file you can test with: npm install -g ./gitraven-1.0.0.tgz

# 4. Publish to npm
npm publish

# For updates, bump version first:
npm version patch  # for bug fixes (1.0.0 -> 1.0.1)
npm version minor  # for new features (1.0.0 -> 1.1.0)
npm version major  # for breaking changes (1.0.0 -> 2.0.0)
npm publish
```

#### Using Built-in Scripts

```bash
# Patch release (bug fixes)
bun run release:patch

# Minor release (new features)
bun run release:minor

# Major release (breaking changes)
bun run release:major
```

#### Automated Publishing with GitHub Actions

1. **Set up npm token**:
   - Go to npm.com → Access Tokens → Generate New Token
   - Copy the token
   - Go to GitHub repo → Settings → Secrets → Add `NPM_TOKEN`

2. **Create a release**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. **GitHub Actions will automatically**:
   - Run tests
   - Build the package
   - Publish to npm

### Package Configuration

The package is configured with:

- **Entry points**: CLI (`gitraven`, `gr`) and library (`dist/index.js`)
- **TypeScript support**: Type definitions included
- **Multiple package managers**: Works with npm, yarn, pnpm, and bun
- **Automated testing**: CI/CD pipeline ensures quality
- **Proper file inclusion**: Only necessary files are published

### Verification

After publishing, verify your package:

```bash
# Check package info
npm info gitraven

# Test global installation
npm install -g gitraven
gitraven --help

# Test npx usage
npx gitraven --help
```

## License

MIT © emeksthecreator
