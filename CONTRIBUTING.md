# Contributing Guidelines

Thank you for your interest in the i18n-maestro project! We welcome all forms of contributions, whether it's developing new features, fixing bugs, improving documentation, or any other way of helping.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct. Please ensure you respect all participants and create a positive and friendly environment.

## How to Contribute

### Reporting Issues

If you find a bug or have a feature suggestion, please submit it using GitHub Issues, ensuring:

1. Check existing issues to avoid duplicate reports
2. Use a clear title and detailed description
3. Include steps to reproduce, expected behavior, and actual behavior
4. If possible, provide code examples or error logs

### Submitting Code

1. **Fork the repository**: Create your own copy of the project
2. **Create a branch**: Base it on the `develop` branch
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```
3. **Write code**: Follow coding standards and best practices
4. **Commit changes**: Use clear commit messages
   ```bash
   git add .
   git commit -m "feat: add new translation loading mechanism"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request**: Submit a PR to the `develop` branch via GitHub

### Commit Conventions

We use the [Conventional Commits](https://www.conventionalcommits.org/) specification, please use the following format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

**Types** include:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Changes that don't affect code logic (formatting, etc.)
- `refactor`: Code refactoring without changing functionality
- `perf`: Performance improvements
- `test`: Adding or modifying tests
- `chore`: Changes to the build process or auxiliary tools

For example:
```
feat(core): add new translation fallback mechanism

Implemented a smarter translation fallback strategy that can 
intelligently find the best match among multiple fallback languages 
when the primary language lacks a translation.

Resolves #123
```

### Development Process

1. **Set up development environment**:
   ```bash
   pnpm install
   ```

2. **Run tests**:
   ```bash
   pnpm test
   ```

3. **Code style check**:
   ```bash
   pnpm lint
   ```

4. **Build the project**:
   ```bash
   pnpm build
   ```

### Branch Strategy

We use the [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/) branching strategy:

- `main`: Stable release versions
- `develop`: Development branch with latest features integrated
- `feature/*`: New feature development
- `bugfix/*`: Bug fixes
- `release/*`: Release preparation
- `hotfix/*`: Emergency fixes for production

## Code Standards

### TypeScript Style Guide

- Use TypeScript strict mode
- Provide complete type definitions for all public APIs
- Use interfaces rather than type aliases for defining object structures
- Avoid using `any` type, prefer generics or `unknown`

### Code Style

- Use 2 spaces for indentation
- Limit line length to 120 characters
- Use single quotes for strings
- Add an empty line at the end of each file
- Use ES6+ syntax features

### Comment Standards

- Use TSDoc format for public API documentation
- All public functions, classes, and interfaces must have documentation comments
- Complex logic should have explanatory comments
- Support bilingual comments (Chinese and English)

## Testing Standards

- All new features must include unit tests
- Core functionality requires integration tests
- Test coverage goal: Over 80% line coverage
- Use Vitest as the testing framework

## Review Process

After submitting a PR, maintainers will review your code. Changes may be requested, please respond actively to feedback.

Review focuses include:
- Code quality and style
- Test coverage
- Documentation completeness
- Performance considerations
- Backward compatibility

## Documentation Contributions

Documentation improvements are equally important, especially welcome:
- Fixing documentation errors
- Improving existing documentation
- Adding tutorials and examples
- Translating documentation

## License

By contributing code, you agree to license your code under the project license (MIT).

## Acknowledgements

Thank you again for your contribution! Your participation is critical to the success of the project.