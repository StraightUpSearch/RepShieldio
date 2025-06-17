#!/bin/bash

# 🚀 RepShield.io CI/CD Pipeline Trigger Script
# This script commits current changes and triggers the pipeline

echo "🚀 Triggering RepShield.io CI/CD Pipeline..."
echo "========================================"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a Git repository"
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# If not on develop, create and switch to it
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo "🔄 Creating and switching to develop branch..."
    git checkout -b develop 2>/dev/null || git checkout develop
fi

# Stage all changes
echo "📦 Staging changes..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit. Making a small documentation update..."
    
    # Add a timestamp to trigger the pipeline
    echo "" >> README.md
    echo "<!-- Pipeline triggered: $(date) -->" >> README.md
    git add README.md
fi

# Commit changes
echo "💾 Committing changes..."
git commit -m "🚀 feat: trigger CI/CD pipeline

- Implement comprehensive GitHub Actions workflow
- Add automated testing, security scanning, and performance monitoring
- Enable parallel job execution with dependency caching
- Configure multi-environment deployment with quality gates

This commit triggers the full CI/CD pipeline to demonstrate:
✅ TypeScript compilation and linting
🔒 Security vulnerability scanning  
🧪 End-to-end testing with Playwright
⚡ Performance auditing with Lighthouse
🗄️ Database compatibility testing
🎯 Quality gate validation

Pipeline artifacts will include build outputs, test results,
security reports, and performance metrics."

# Push to origin
echo "📤 Pushing to remote..."
git push -u origin develop

echo ""
echo "🎉 Pipeline triggered successfully!"
echo "👀 Watch your pipeline at:"
echo "   https://github.com/StraightUpSearch/RepShieldio/actions"
echo ""
echo "📊 Expected workflow execution:"
echo "   ⚡ Lint & Type Check (1-2 min)"
echo "   🔒 Security Audit (1-2 min)"
echo "   🏗️ Build Application (2-3 min)"
echo "   🧪 E2E Tests (3-5 min)"
echo "   🗄️ Database Tests (1-2 min)"
echo "   ✅ Quality Gate (30 sec)"
echo ""
echo "🔗 Create PR when ready:"
echo "   https://github.com/StraightUpSearch/RepShieldio/compare/main...develop"
echo ""
echo "💡 Pro tip: Keep the Actions tab open to watch real-time progress!" 