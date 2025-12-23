#!/bin/bash

# Safe sync workflow: Pull, check conflicts, commit if needed
# Usage: ./scripts/sync-safe.sh

set -e

echo "🔄 Safe Sync Workflow"
echo "===================="
echo ""

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes!"
    git status --short
    echo ""
    read -p "Stash changes before pulling? (Y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        echo "📦 Stashing changes..."
        git stash push -m "Auto-stash before sync $(date +%Y-%m-%d_%H-%M-%S)"
        STASHED=true
    else
        echo "⚠️  Continuing with uncommitted changes..."
        STASHED=false
    fi
else
    STASHED=false
fi

# Pull from Shopify
echo ""
echo "⬇️  Pulling from Shopify..."
shopify theme pull

# Check for changes
if git diff-index --quiet HEAD --; then
    echo "✅ Everything is already in sync!"
else
    echo ""
    echo "📊 Changes detected:"
    git status --short
    echo ""
    read -p "Review and commit these changes? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Commit message: " COMMIT_MSG
        git commit -m "${COMMIT_MSG:-Sync from Shopify}"
        echo "✅ Changes committed!"
    else
        echo "⚠️  Changes pulled but not committed."
    fi
fi

# Restore stashed changes if any
if [ "$STASHED" = true ]; then
    echo ""
    echo "📦 Restoring stashed changes..."
    git stash pop || echo "⚠️  Note: Some conflicts may need manual resolution"
fi

echo ""
echo "✅ Safe sync complete!"

