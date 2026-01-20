# Contributing to ai-skills

Thank you for your interest in contributing to ai-skills! We welcome contributions from the community.

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear description** of the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Environment details** (OS, Node version, agent versions)
- **Error messages** or logs if applicable

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear description** of the proposed feature
- **Use cases** and why it would be useful
- **Possible implementation** approach (if you have ideas)

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes** following our coding standards
4. **Add tests** for any new functionality
5. **Ensure tests pass**: `npm test`
6. **Build the project**: `npm run build`
7. **Update documentation** if needed
8. **Commit with clear messages** following conventional commits format
9. **Submit a pull request** with a clear description

#### Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test additions or changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

Examples:
```
feat: add support for new AI agent
fix: resolve symlink creation on Windows
docs: update README with installation steps
test: add tests for config manager
```

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ai-skills.git
cd ai-skills

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run in development mode (watch)
npm run dev
```

### Project Structure

```
ai-skills/
├── src/
│   ├── cli.ts              # CLI entry point
│   ├── commands/           # Command implementations
│   ├── core/               # Core functionality
│   │   ├── agents/         # Agent implementations
│   │   ├── config.ts       # Configuration management
│   │   ├── skills.ts       # Skill management
│   │   └── gemini.ts       # Gemini-specific logic
│   └── __tests__/          # Test files
├── docs/                   # Documentation
├── dist/                   # Build output (not committed)
└── package.json
```

## Coding Standards

### TypeScript

- Use TypeScript for all source files
- Follow existing code style and patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Testing

- Write tests for all new functionality
- Maintain or improve test coverage
- Tests should be clear and descriptive
- Use the existing test patterns (Jest with @jest/globals)

### Code Style

- Follow the existing code style
- Use 2 spaces for indentation
- Use single quotes for strings
- No trailing whitespace
- End files with a newline

## Adding New Agents

If you're adding support for a new AI agent, please follow the [Adding New Agents](docs/adding-new-agents.md) guide.

Key requirements:
1. Extend the `BaseAgent` class
2. Implement required methods (`id`, `name`, `getSkillsPath`)
3. Add comprehensive tests
4. Update documentation (README.md)
5. Add examples if appropriate

## Documentation

- Update README.md for user-facing changes
- Add/update JSDoc comments for code changes
- Update or create guides in `docs/` for significant features
- Include examples where helpful

## Testing Your Changes

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Manual Testing

```bash
# Build the project
npm run build

# Test locally
npm start init
npm start activate
npm start sync
```

### Testing with Different Agents

1. Ensure you have agent directories set up (e.g., `~/.claude`, `~/.gemini`)
2. Test initialization: `npm start init`
3. Test skill activation: `npm start activate`
4. Verify symlinks are created correctly
5. Test project configuration files are updated

## Release Process

(For maintainers)

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a git tag: `git tag vX.Y.Z`
4. Push tag: `git push --tags`
5. Publish to npm: `npm publish`
6. Create GitHub release with notes

## Getting Help

- **Questions?** Open a discussion on GitHub
- **Found a bug?** Open an issue
- **Want to contribute?** Start with good first issues
- **Need clarification?** Ask in your PR or issue

## License

By contributing to ai-skills, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in our README.md and release notes. Thank you for helping make ai-skills better!
