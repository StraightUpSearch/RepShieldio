Run the Playwright test suite and fix any failures.

## Steps

1. Ensure the dev server is running on port 3000 (start it if not)
2. Run: `npx playwright test tests/mvp-smoke.spec.ts --reporter=list --project=chromium`
3. If tests fail, analyze the failures:
   - Selector issues: fix test selectors to match actual DOM
   - App bugs: fix the application code
   - Timing issues: add proper waits or increase timeouts
4. Re-run tests until all pass
5. Then run mobile tests: `npx playwright test tests/mvp-smoke.spec.ts --reporter=list --project=mobile-chrome`
6. Report results summary
