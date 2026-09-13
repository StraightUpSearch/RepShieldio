Analyze and fix the described issue: $ARGUMENTS

## Steps

1. Understand the problem described
2. Search the codebase for relevant files using Glob and Grep
3. Read the relevant source files to understand context
4. Implement the fix
5. Run Playwright tests to verify nothing broke: `npx playwright test tests/mvp-smoke.spec.ts --reporter=list`
6. If tests fail, fix them
7. Stage and commit the fix with a descriptive message
