Conduct a thorough code review of: $ARGUMENTS

## Review Checklist

### 1. Product Review
- Does this change deliver clear user value?
- Is the UX intuitive?

### 2. Code Quality
- Is the code readable and maintainable?
- Are there any React anti-patterns (hooks rules violations, missing deps, etc.)?
- Are API response shapes properly typed and handled?

### 3. Security
- No XSS, SQL injection, or command injection risks?
- Auth checks on all protected routes?
- Sensitive data not exposed?

### 4. Testing
- Are there tests covering the changes?
- Run existing tests to check for regressions

### 5. Performance
- No unnecessary re-renders?
- No N+1 queries?
- Proper loading states?

Post the review as a GitHub PR comment if a PR number was provided.
