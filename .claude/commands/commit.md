Review all staged and unstaged changes, then create well-formatted commits.

## Steps

1. Run `git status` and `git diff` to understand all changes
2. If no files are staged, stage all modified files
3. Analyze the diff to determine if multiple distinct logical changes are present
4. If multiple distinct changes, split into separate atomic commits
5. For each commit, use conventional commit format with emoji:
   - feat: New feature
   - fix: Bug fix
   - refactor: Code refactoring
   - test: Adding or fixing tests
   - docs: Documentation changes
   - chore: Tooling, config, dependencies
6. Keep commit messages concise (under 72 chars first line)
7. Use present tense, imperative mood
8. Always append: Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
