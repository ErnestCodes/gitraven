# Commit Message Templates

GitRaven follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. Here are some examples:

## Basic Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Types

### feat - New Features
```
feat: add user authentication
feat(auth): implement JWT token validation
feat(api): add user profile endpoints
```

### fix - Bug Fixes
```
fix: resolve memory leak in event handlers
fix(auth): prevent null pointer exception
fix(ui): correct button alignment on mobile
```

### docs - Documentation
```
docs: update API documentation
docs(readme): add installation instructions
docs: fix typos in contributing guide
```

### style - Code Style
```
style: fix indentation in components
style(css): remove unused styles
style: add missing semicolons
```

### refactor - Code Refactoring
```
refactor: extract authentication logic
refactor(api): simplify user service
refactor: rename getUserData to fetchUserData
```

### test - Tests
```
test: add unit tests for auth service
test(integration): add API endpoint tests
test: increase coverage for user module
```

### chore - Maintenance
```
chore: update dependencies
chore(deps): bump typescript to 5.0
chore: configure CI/CD pipeline
```

### perf - Performance
```
perf: optimize database queries
perf(ui): lazy load components
perf: reduce bundle size by 20%
```

### ci - CI/CD
```
ci: add automated testing
ci: configure deployment pipeline
ci(github): update workflow actions
```

### build - Build System
```
build: update webpack configuration
build(npm): add new build scripts
build: optimize production bundle
```

### revert - Reverts
```
revert: "feat: add user authentication"
revert(api): remove deprecated endpoints
```

## Breaking Changes

Add `!` after type/scope and include `BREAKING CHANGE:` in footer:

```
feat(api)!: change authentication method

BREAKING CHANGE: authentication now requires JWT tokens instead of API keys
```

## Body Guidelines

- Use imperative mood ("add" not "added" or "adds")
- Explain what and why, not how
- Wrap lines at 72 characters
- Separate body from description with blank line

## Footer Guidelines

- Reference issues: `Closes #123`, `Fixes #456`
- Breaking changes: `BREAKING CHANGE: description`
- Multiple footers allowed

## Examples with Body and Footer

```
feat(auth): implement social login

Add support for Google and GitHub OAuth integration.
Users can now sign in using their existing social accounts
for improved user experience.

Closes #234
Refs #456
```

```
fix(api): resolve race condition in user creation

Prevent duplicate users by implementing proper locking
mechanism during user registration process.

BREAKING CHANGE: userCreate endpoint now returns 409 for conflicts
Fixes #789
```
