#!/bin/bash

# Push local theme files to live Shopify store
# Usage: ./scripts/sync-push.sh [--only path/to/file] [--include-settings]

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

# Check if settings file exists
SETTINGS_FILE="config/settings_data.json"
if [ ! -f "$SETTINGS_FILE" ]; then
    echo "⚠️  Warning: $SETTINGS_FILE not found!"
    echo "   Settings may not be pushed."
fi

# Handle different push scenarios
if [ "$1" == "--include-settings" ] || [ "$2" == "--include-settings" ]; then
    echo "📤 Pushing all files including settings..."
    # Push settings explicitly first to ensure they're included
    if [ -f "$SETTINGS_FILE" ]; then
        echo "📋 Pushing settings_data.json explicitly..."
        shopify theme push --only "$SETTINGS_FILE"
        echo ""
    fi
    # Push everything else
    shopify theme push
elif [ -n "$1" ] && [ "$1" != "--include-settings" ]; then
    echo "📤 Pushing specific files: $1"
    shopify theme push --only "$1"
else
    echo "📤 Pushing all theme files (including settings)..."
    # Always push settings explicitly to ensure they're included
    if [ -f "$SETTINGS_FILE" ]; then
        echo "📋 Ensuring settings_data.json is pushed..."
        shopify theme push --only "$SETTINGS_FILE" 2>/dev/null || {
            echo "⚠️  Note: Settings push had issues, but continuing with full push..."
        }
        echo ""
    fi
    # Push everything (settings should already be pushed, but this ensures everything else is)
    shopify theme push
fi

echo ""
echo "✅ Theme files pushed successfully!"
echo ""
echo "💡 Tip: If settings weren't pushed, use: ./scripts/sync-push.sh --include-settings"

