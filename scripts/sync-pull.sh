#!/bin/bash

# Pull latest theme files from live Shopify store
# Usage: ./scripts/sync-pull.sh [--settings-only]

set -e

echo "🔄 Pulling latest theme files from Shopify..."

if [ "$1" == "--settings-only" ]; then
    echo "📋 Pulling settings only..."
    shopify theme pull --only config/settings_data.json
    echo "✅ Settings synced successfully!"
else
    shopify theme pull
    echo "✅ Theme files synced successfully!"
    echo ""
    echo "📊 Checking for changes..."
    git status --short
fi

