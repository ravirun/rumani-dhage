#!/bin/bash

# Push settings file explicitly to live Shopify store
# Usage: ./scripts/sync-push-settings.sh

set -e

SETTINGS_FILE="config/settings_data.json"

echo "📋 Pushing settings to Shopify..."

# Check if settings file exists
if [ ! -f "$SETTINGS_FILE" ]; then
    echo "❌ Error: $SETTINGS_FILE not found!"
    exit 1
fi

# Show what will be pushed
echo "📄 Settings file: $SETTINGS_FILE"
echo "📊 File size: $(du -h "$SETTINGS_FILE" | cut -f1)"
echo ""

# Push settings file
shopify theme push --only "$SETTINGS_FILE"

echo ""
echo "✅ Settings pushed successfully!"
echo ""
echo "💡 Note: Settings changes made in Shopify admin will override these."
echo "   Use './scripts/sync-settings.sh' to pull latest settings from Shopify."

