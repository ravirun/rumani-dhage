#!/bin/bash

# Sync settings file safely
# This pulls settings, shows diff, and optionally commits

set -e

echo "📋 Syncing settings from Shopify..."

# Backup current settings
if [ -f "config/settings_data.json" ]; then
    cp config/settings_data.json config/settings_data.json.backup
    echo "💾 Backup created: config/settings_data.json.backup"
fi

# Pull settings from Shopify
shopify theme pull --only config/settings_data.json

# Check if there are changes
if git diff --quiet config/settings_data.json; then
    echo "✅ Settings are already in sync!"
    rm -f config/settings_data.json.backup
else
    echo "📊 Settings have changed. Differences:"
    git diff config/settings_data.json || true
    echo ""
    read -p "Commit these changes? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add config/settings_data.json
        git commit -m "Sync settings from Shopify"
        echo "✅ Settings committed!"
    else
        echo "⚠️  Settings pulled but not committed."
        echo "   Restore backup: mv config/settings_data.json.backup config/settings_data.json"
    fi
fi

