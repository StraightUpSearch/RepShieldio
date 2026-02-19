Pre-deployment checklist for RepShield.

## Steps

1. Run full test suite: `npx playwright test --reporter=list`
2. Check for TypeScript errors: `npx tsc --noEmit`
3. Verify build succeeds: `npm run build`
4. Check for any hardcoded dev values (localhost, test keys, etc.)
5. Verify .env template is up to date
6. Check for console.log statements that should be removed
7. Report pass/fail status for each check
