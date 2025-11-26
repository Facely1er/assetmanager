#!/bin/bash
# CyberSoluce-AssetManager - Repository Migration Script (Bash)
# Migrates from assetmanager repo to new cybersoluce-assetmanager repo

set -e

NEW_REPO_URL="https://github.com/Facely1er/cybersoluce-assetmanager.git"

echo "🔄 CyberSoluce-AssetManager - Repository Migration"
echo "=================================================="
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository!"
    echo "   Initialize git first: git init"
    exit 1
fi

# Check current remote
echo "📋 Checking current git configuration..."
echo ""

CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [ -n "$CURRENT_REMOTE" ]; then
    echo "Current remote: $CURRENT_REMOTE"
else
    echo "No remote configured"
fi

CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo ""

# Check for uncommitted changes
echo "🔍 Checking for uncommitted changes..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Uncommitted changes detected:"
    git status --short
    echo ""
    echo "Please commit or stash changes before migrating:"
    echo "  git add ."
    echo "  git commit -m 'Your commit message'"
    echo ""
    echo "Or stash them:"
    echo "  git stash"
    echo ""
    read -p "Continue anyway? (y/N) " response
    if [ "$response" != "y" ] && [ "$response" != "Y" ]; then
        echo "Migration cancelled."
        exit 0
    fi
else
    echo "✅ No uncommitted changes"
fi

echo ""

# Confirm migration
echo "⚠️  This will:"
echo "  1. Remove current remote: origin"
echo "  2. Add new remote: $NEW_REPO_URL"
echo "  3. Push code to new repository"
echo ""
echo "⚠️  IMPORTANT: Create the new repository on GitHub first!"
echo "   Go to: https://github.com/new"
echo "   Repository name: cybersoluce-assetmanager"
echo ""
read -p "Have you created the new repository? (y/N) " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo ""
    echo "Please create the repository first:"
    echo "  1. Go to: https://github.com/new"
    echo "  2. Name: cybersoluce-assetmanager"
    echo "  3. Don't initialize with README"
    echo "  4. Run this script again"
    exit 0
fi

echo ""
echo "🔄 Starting migration..."
echo ""

# Step 1: Remove old remote
echo "[1/3] Removing old remote..."
if git remote remove origin 2>/dev/null; then
    echo "   ✅ Old remote removed"
else
    echo "   ⚠️  No remote to remove (may already be removed)"
fi

# Step 2: Add new remote
echo ""
echo "[2/3] Adding new remote..."
if git remote add origin "$NEW_REPO_URL" 2>/dev/null; then
    echo "   ✅ New remote added: $NEW_REPO_URL"
else
    echo "   ❌ Failed to add remote (may already exist)"
    echo "   Trying to set URL instead..."
    git remote set-url origin "$NEW_REPO_URL"
    echo "   ✅ Remote URL updated"
fi

# Verify remote
echo ""
echo "[3/3] Verifying remote..."
VERIFY_REMOTE=$(git remote get-url origin)
echo "   ✅ Remote verified: $VERIFY_REMOTE"

# Step 3: Push to new repository
echo ""
echo "📤 Pushing to new repository..."
echo "   Branch: $CURRENT_BRANCH"
echo "   Remote: $NEW_REPO_URL"
echo ""

if git push -u origin "$CURRENT_BRANCH"; then
    echo ""
    echo "================================================"
    echo "✅ Migration Complete!"
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. Verify repository:"
    echo "   https://github.com/Facely1er/cybersoluce-assetmanager"
    echo ""
    echo "2. Update Netlify connection:"
    echo "   - Go to Netlify Dashboard"
    echo "   - Site settings → Build & deploy"
    echo "   - Link to new repository: cybersoluce-assetmanager"
    echo ""
    echo "3. Test deployment:"
    echo "   - Push a commit or trigger manual deploy"
    echo "   - Verify build succeeds"
    echo ""
    echo "Repository URL: $NEW_REPO_URL"
    echo ""
else
    echo ""
    echo "❌ Push failed!"
    echo ""
    echo "Common issues:"
    echo "  - Repository doesn't exist (create it first)"
    echo "  - Authentication required (check git credentials)"
    echo "  - Network issues"
    exit 1
fi

