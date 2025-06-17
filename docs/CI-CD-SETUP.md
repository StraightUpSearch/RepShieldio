# 🚀 CI/CD Pipeline Documentation

## Overview

This document describes the comprehensive CI/CD pipeline implementation for RepShield.io using GitHub Actions. The pipeline follows industry best practices and is inspired by the [GitHub CI/CD guide](https://github.blog/enterprise-software/ci-cd/build-ci-cd-pipeline-github-actions-four-steps/).

## 🏗️ Pipeline Architecture

### Workflow Structure

1. **Continuous Integration** (`.github/workflows/ci.yml`)
2. **Deployment** (`.github/workflows/deploy.yml`)
3. **Security Scanning** (`.github/workflows/security.yml`)
4. **Performance Monitoring** (`.github/workflows/performance.yml`)
5. **Database Migrations** (`.github/workflows/db-migrations.yml`)

### Dependency Management
- **Dependabot** (`.github/dependabot.yml`) - Automated dependency updates
- **License Compliance** - Automated license checking
- **Security Audits** - Daily vulnerability scans

## 📋 Workflow Details

### 1. Continuous Integration (`ci.yml`)

**Triggers:**
- Push to `main`, `staging`, `develop` branches
- Pull requests to `main`, `staging`

**Jobs:**
- **Lint & Type Check**: TypeScript compilation, ESLint, Prettier
- **Security Audit**: npm audit, vulnerability scanning
- **Build**: Frontend/backend compilation, artifact creation
- **Unit Tests**: Jest/Vitest test execution
- **E2E Tests**: Playwright browser testing
- **Database Compatibility**: SQLite/PostgreSQL testing
- **Quality Gate**: Overall pipeline status validation

**Quality Gate Criteria:**
- All linting passes
- No critical security vulnerabilities
- Build succeeds
- E2E tests pass
- Database compatibility verified

### 2. Deployment (`deploy.yml`)

**Triggers:**
- Successful CI completion
- Push to `main` (production) or `staging` branches

**Environments:**
- **Staging**: `staging.repshield.io`
- **Production**: `repshield.io`

**Jobs:**
- **CI Status Check**: Validates CI pipeline success
- **Staging Deployment**: Automated staging deployment
- **Production Deployment**: Protected production deployment
- **Post-Deployment Tests**: Health checks and smoke tests

**Deployment Process:**
1. Build application artifacts
2. Run database migrations
3. Deploy to target environment
4. Verify health endpoints
5. Run smoke tests
6. Create deployment summary

### 3. Security Scanning (`security.yml`)

**Triggers:**
- Daily schedule (2 AM UTC)
- Push to `main`, `staging`
- Pull requests
- Manual dispatch

**Security Checks:**
- **CodeQL Analysis**: Static code analysis for security vulnerabilities
- **Dependency Review**: License compliance and vulnerability scanning
- **NPM Audit**: Package vulnerability assessment
- **Security Headers**: HTTP security header validation
- **Environment Security**: Hardcoded secret detection
- **Docker Security**: Container vulnerability scanning (if applicable)

### 4. Performance Monitoring (`performance.yml`)

**Triggers:**
- Daily schedule (6 AM, 6 PM UTC)
- Push to `main`
- Pull requests to `main`
- Manual dispatch

**Performance Tests:**
- **Lighthouse Audit**: Web performance, accessibility, SEO
- **Bundle Analysis**: JavaScript/CSS bundle size monitoring
- **Load Testing**: Artillery-based load testing
- **Database Performance**: Query performance benchmarking

**Performance Thresholds:**
- Performance Score: ≥70%
- Accessibility Score: ≥90%
- JavaScript Bundle: ≤1MB
- CSS Bundle: ≤200KB

### 5. Database Migrations (`db-migrations.yml`)

**Triggers:**
- Changes to migration files
- Schema modifications

**Jobs:**
- **Validate Migrations**: Syntax and compatibility checks
- **Staging Deployment**: Apply migrations to staging
- **Production Deployment**: Protected production migration
- **Verification**: Database connection and integrity checks

## 🔧 Setup Instructions

### 1. Repository Secrets

Configure the following secrets in GitHub repository settings:

#### Staging Environment
```
STAGING_DATABASE_URL=postgresql://...
STAGING_SESSION_SECRET=your-staging-secret
STAGING_HOST=staging.example.com
STAGING_USER=deploy
STAGING_SSH_KEY=-----BEGIN PRIVATE KEY-----...
```

#### Production Environment
```
PRODUCTION_DATABASE_URL=postgresql://...
PRODUCTION_SESSION_SECRET=your-production-secret
PRODUCTION_HOST=repshield.io
PRODUCTION_USER=deploy
PRODUCTION_SSH_KEY=-----BEGIN PRIVATE KEY-----...
```

### 2. Environment Setup

Create environment-specific configurations:

#### GitHub Environments
1. Go to Repository Settings > Environments
2. Create `staging` and `production` environments
3. Configure protection rules for production:
   - Required reviewers
   - Wait timer
   - Deployment branches restriction

#### Branch Protection
1. Enable branch protection for `main`
2. Require status checks:
   - `Quality Gate`
   - `Security Summary`
   - `Performance Summary`
3. Require pull request reviews
4. Restrict pushes to `main`

### 3. Dependabot Configuration

The `.github/dependabot.yml` file is configured to:
- Update npm dependencies daily
- Update GitHub Actions weekly
- Group related dependencies
- Target `develop` branch for updates
- Auto-assign to repository maintainers

## 📊 Monitoring & Observability

### Workflow Visualizer

Use GitHub Actions' workflow visualizer to:
- Monitor pipeline execution in real-time
- Identify bottlenecks and failures
- Track deployment progress

### Live Logs

Access detailed execution logs for:
- Debugging failed builds
- Performance analysis
- Security audit results

### Artifacts

The pipeline generates artifacts for:
- Build outputs (`build-artifacts-{sha}`)
- Test results (`e2e-test-results-{sha}`)
- Security reports (`npm-audit-report-{sha}`)
- Performance reports (`load-test-results-{sha}`)

## 🚨 Troubleshooting

### Common Issues

#### CI Pipeline Failures

1. **TypeScript Errors**
   ```bash
   npm run check
   ```

2. **E2E Test Failures**
   - Check application startup logs
   - Verify environment variables
   - Review Playwright test outputs

3. **Security Audit Failures**
   ```bash
   npm audit fix
   audit-ci --moderate
   ```

#### Deployment Issues

1. **Database Migration Failures**
   - Verify database connectivity
   - Check migration syntax
   - Review database permissions

2. **Health Check Failures**
   - Confirm application startup
   - Verify health endpoint
   - Check server logs

### Emergency Procedures

#### Rollback Deployment
```bash
# Manual rollback (if automated rollback fails)
ssh deploy@repshield.io "cd /app && pm2 restart previous-version"
```

#### Skip Security Checks (Emergency Only)
Add to commit message: `[skip security]`

## 📈 Performance Metrics

### CI Pipeline Performance
- **Average Build Time**: ~8-12 minutes
- **E2E Test Duration**: ~5-8 minutes
- **Security Scan Time**: ~3-5 minutes

### Deployment Performance
- **Staging Deployment**: ~3-5 minutes
- **Production Deployment**: ~5-8 minutes
- **Database Migration**: ~30 seconds - 2 minutes

## 🔄 Continuous Improvement

### Pipeline Optimization
- Monitor workflow execution times
- Optimize Docker layer caching
- Parallelize independent jobs
- Use matrix strategies for multiple environments

### Security Enhancements
- Add SAST/DAST scanning
- Implement secret scanning
- Add compliance checks
- Regular security policy updates

### Performance Monitoring
- Implement APM tools
- Add custom metrics
- Monitor user experience
- Track performance regressions

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright Testing Guide](https://playwright.dev/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot)

## 🔗 Related Documentation

- [API Documentation](API.md)
- [Deployment Guide](../PRODUCTION_DEPLOYMENT.md)
- [Security Policy](SECURITY.md)
- [Contributing Guidelines](CONTRIBUTING.md) 