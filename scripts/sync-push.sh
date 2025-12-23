#!/bin/bash

# Push local theme files to live Shopify store
# Usage: ./scripts/sync-push.sh [--only path/to/file]

set -e

echo "🚀 Pushing local theme files to Shopify..."

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Warning: You have uncommitted changes!"
    echo "   Consider committing first: git add . && git commit -m 'Your message'"
    read -p "   Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted. Commit your changes first."
        exit 1
    fi
fi

if [ -n "$1" ]; then
    echo "📤 Pushing specific files: $1"
    shopify theme push --only "$1"
else
    shopify theme push
fi

echo "✅ Theme files pushed successfully!"

