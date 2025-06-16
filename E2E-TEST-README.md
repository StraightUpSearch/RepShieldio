# RepShield.io E2E Test Suite

A comprehensive end-to-end test suite for validating RepShield.io public functionality using Microsoft Playwright.

## 🎯 Test Coverage

This test suite validates the following critical user flows:

1. **Homepage Access** - Verifies site loads and navigation elements are present
2. **User Registration** - Creates new user accounts with random valid data
3. **User Login** - Tests authentication with created credentials
4. **Account Dashboard** - Validates access to user account areas
5. **Support Ticket Submission** - Tests support/help functionality
6. **Ticket Verification** - Confirms tickets appear in UI
7. **Session Persistence** - Tests logout/login cycle maintains state
8. **Error Monitoring** - Captures console errors and network failures

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Playwright dependencies installed (`npx playwright install`)

### Running Tests

#### Option 1: Using the Test Runner Script (Recommended)

```bash
# Run all tests (headless)
node run-e2e-tests.js

# Run with visible browser (good for debugging)
node run-e2e-tests.js --headed

# Run with Playwright UI (best for development)
node run-e2e-tests.js --ui

# Run specific test
node run-e2e-tests.js --test="Homepage"
```

#### Option 2: Using NPM Scripts

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed
```

#### Option 3: Direct Playwright Commands

```bash
# Run all tests
npx playwright test tests/repshield-complete-e2e.spec.ts --project=chromium

# Run with UI
npx playwright test tests/repshield-complete-e2e.spec.ts --project=chromium --ui

# Run specific test
npx playwright test tests/repshield-complete-e2e.spec.ts --project=chromium --grep "Homepage"
```

## 📊 Test Results

After running tests, results are saved in structured folders:

```
results/
├── screenshots/          # Screenshots for each test step
├── logs/                 # Detailed JSON logs per test
├── test-results.json     # Overall test results
└── error-report-*.json   # Console/network error reports

playwright-report/        # HTML test report
└── index.html           # Open this in browser
```

## 🧪 Test Configuration

### Base Configuration

- **Target URL**: `https://repshield.io`
- **Browser**: Chromium (Desktop Chrome)
- **Timeouts**: 30 seconds for actions and navigation
- **Screenshots**: Captured on failure and after each test
- **Videos**: Retained on failure
- **Traces**: Captured on first retry

### Test Data

Each test run generates unique user data:
- **Email**: `e2e-test-{timestamp}@playwright.test`
- **Password**: `SecureTestPass123!`
- **Names**: `TestUser E2E{timestamp}`

## 📝 Test Structure

### Test Classes

#### `AuthActions`
Handles all authentication-related operations:
- `navigateToLogin()` - Navigate to login page
- `register(user)` - Create new user account
- `login(email, password)` - Sign in with credentials
- `logout()` - Sign out of account

#### `AccountActions`
Manages account and dashboard operations:
- `navigateToAccount()` - Access account dashboard
- `submitTicket(subject, description)` - Create support ticket

#### `TestLogger`
Centralized logging and result management:
- Console output logging
- Network request monitoring
- Error tracking and reporting
- JSON result file generation

### Individual Tests

1. **Homepage Access and Navigation**
   - Loads homepage and verifies title
   - Checks for key navigation elements
   - Takes homepage screenshot

2. **User Registration Flow**
   - Creates new user with generated data
   - Handles form submission with multiple selector strategies
   - Verifies successful registration/login

3. **Login with Created Account**
   - Tests full registration → logout → login cycle
   - Validates credentials persistence

4. **My Account Dashboard Access**
   - Accesses user account area
   - Checks for common dashboard elements
   - Verifies authenticated state

5. **Support Ticket Submission**
   - Attempts to create support tickets
   - Tests various support page paths
   - Gracefully handles missing functionality

6. **Logout and Re-login Persistence**
   - Tests session termination
   - Validates account data persistence
   - Confirms re-authentication

7. **Browser Console and Network Monitoring**
   - Captures JavaScript errors
   - Monitors network failures (4xx/5xx responses)
   - Generates detailed error reports

8. **Complete End-to-End Journey**
   - Runs full user lifecycle in one test
   - Generates comprehensive success report
   - Validates entire application flow

## 🔧 Customization

### Modifying Test Data

Edit the `generateTestUser()` function in the test file:

```typescript
function generateTestUser(): TestUser {
  const timestamp = Date.now();
  return {
    firstName: 'YourFirstName',
    lastName: `Custom${timestamp}`,
    email: `custom-test-${timestamp}@yourdomain.com`,
    password: 'YourCustomPassword123!',
    timestamp
  };
}
```

### Adding New Tests

Add new test cases in the test describe block:

```typescript
test('Your Custom Test', async ({ page }) => {
  logger.log('🔄 Testing custom functionality');
  
  const auth = new AuthActions(page, logger);
  const account = new AccountActions(page, logger);
  
  // Your test logic here
  
  logger.log('✅ Custom test completed');
});
```

### Extending Selectors

Both `AuthActions` and `AccountActions` use flexible selector strategies. Add new selectors to the arrays:

```typescript
const emailSelectors = [
  'input[type="email"]',
  'input[id*="email"]',
  'input[name*="email"]',
  'input[placeholder*="email"]' // Add new selector
];
```

## 🐛 Debugging

### Common Issues

1. **Tests failing due to slow loading**
   - Increase timeouts in `playwright.config.ts`
   - Add more `waitForLoadState()` calls

2. **Element not found errors**
   - Check selector strategies in `AuthActions`/`AccountActions`
   - Add new selectors for your specific UI

3. **Registration/Login failures**
   - Verify site functionality manually
   - Check console logs in results for API errors

### Debug Mode

Run tests in headed mode to watch execution:

```bash
node run-e2e-tests.js --headed
```

Use Playwright UI for step-by-step debugging:

```bash
node run-e2e-tests.js --ui
```

### Log Analysis

Check detailed logs in `results/logs/` for specific test failures:

```json
{
  "testName": "User Registration Flow",
  "user": "e2e-test-1234567890@playwright.test",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "logs": ["📝 Registering user...", "✅ Registration successful"],
  "consoleLogs": [...],
  "networkLogs": [...]
}
```

## 🚨 Error Handling

The test suite is designed to fail gracefully:

- **Missing UI elements**: Tests continue with warnings
- **Network errors**: Captured and reported but don't stop execution
- **Authentication failures**: Detailed error logging for debugging
- **Feature unavailability**: Tests pass with informational messages

## 📈 Continuous Integration

For CI/CD integration, use:

```bash
# Run tests in CI mode
CI=true npx playwright test tests/repshield-complete-e2e.spec.ts --project=chromium
```

CI mode automatically:
- Runs headless
- Retries failed tests twice
- Generates structured reports
- Uses single worker for stability

## 🛡️ Security Considerations

- Test accounts use temporary email addresses
- Passwords are randomly generated per test run
- No real user data is created or stored
- All test data is isolated to test environment

## 📞 Support

For issues with the test suite:

1. Check the HTML report at `playwright-report/index.html`
2. Review error logs in `results/logs/`
3. Run specific failing tests with `--headed` flag
4. Verify site functionality manually

The test suite is designed to validate RepShield.io functionality and help identify any issues with critical user flows. 