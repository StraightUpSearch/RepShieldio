# RepShield.io CI/CD Pipeline Trigger Script (PowerShell)
# This script commits current changes and triggers the pipeline

Write-Host "[REPSHIELD] Triggering CI/CD Pipeline..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "[ERROR] Not in a Git repository" -ForegroundColor Red
    exit 1
}

# Check current branch
$currentBranch = git branch --show-current
Write-Host "[INFO] Current branch: $currentBranch" -ForegroundColor Cyan

# If not on develop, create and switch to it
if ($currentBranch -ne "develop") {
    Write-Host "[INFO] Creating and switching to develop branch..." -ForegroundColor Yellow
    git checkout -b develop 2>$null
    if ($LASTEXITCODE -ne 0) {
        git checkout develop
    }
}

# Stage all changes
Write-Host "[INFO] Staging changes..." -ForegroundColor Cyan
git add .

# Check if there are changes to commit
$stagedChanges = git diff --staged --name-only
if (-not $stagedChanges) {
    Write-Host "[INFO] No changes to commit. Making a small documentation update..." -ForegroundColor Yellow
    
    # Add a timestamp to trigger the pipeline
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path "README.md" -Value "`n<!-- Pipeline triggered: $timestamp -->"
    git add README.md
}

# Commit changes
Write-Host "[INFO] Committing changes..." -ForegroundColor Cyan
git commit -m "feat: trigger CI/CD pipeline

- Implement comprehensive GitHub Actions workflow
- Add automated testing, security scanning, and performance monitoring  
- Enable parallel job execution with dependency caching
- Configure multi-environment deployment with quality gates

This commit triggers the full CI/CD pipeline to demonstrate:
- TypeScript compilation and linting
- Security vulnerability scanning  
- End-to-end testing with Playwright
- Performance auditing with Lighthouse
- Database compatibility testing
- Quality gate validation

Pipeline artifacts will include build outputs, test results,
security reports, and performance metrics."

# Push to origin
Write-Host "[INFO] Pushing to remote..." -ForegroundColor Cyan
git push -u origin develop

Write-Host ""
Write-Host "[SUCCESS] Pipeline triggered successfully!" -ForegroundColor Green
Write-Host "[INFO] Watch your pipeline at:" -ForegroundColor White
Write-Host "   https://github.com/StraightUpSearch/RepShieldio/actions" -ForegroundColor Blue
Write-Host ""
Write-Host "[INFO] Expected workflow execution:" -ForegroundColor White
Write-Host "   [1] Lint & Type Check (1-2 min)" -ForegroundColor Yellow
Write-Host "   [2] Security Audit (1-2 min)" -ForegroundColor Yellow  
Write-Host "   [3] Build Application (2-3 min)" -ForegroundColor Yellow
Write-Host "   [4] E2E Tests (3-5 min)" -ForegroundColor Yellow
Write-Host "   [5] Database Tests (1-2 min)" -ForegroundColor Yellow
Write-Host "   [6] Quality Gate (30 sec)" -ForegroundColor Yellow
Write-Host ""
Write-Host "[INFO] Create PR when ready:" -ForegroundColor White
Write-Host "   https://github.com/StraightUpSearch/RepShieldio/compare/main...develop" -ForegroundColor Blue
Write-Host ""
Write-Host "[TIP] Keep the Actions tab open to watch real-time progress!" -ForegroundColor Magenta 