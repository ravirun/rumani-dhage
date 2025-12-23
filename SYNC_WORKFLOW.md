# Shopify Theme Sync Workflow Guide

## Understanding Sync Direction

### 🔽 **Pull (Live → Local)**
Downloads files from your live Shopify store to your local environment.

### 🔼 **Push (Local → Live)**
Uploads files from your local environment to your live Shopify store.

---

## Best Practices for Syncing

### 1. **Daily Development Workflow**

```bash
# Start of day: Pull latest from live store
shopify theme pull

# Make your changes locally
# ... edit files ...

# Commit your changes
git add .
git commit -m "Your changes"
git push

# Deploy to live (if ready)
shopify theme push
```

### 2. **Settings Sync Strategy**

**Problem**: `config/settings_data.json` can be overwritten by Shopify auto-sync.

**Solution**: Always pull settings before committing:

```bash
# Before committing, sync settings from live
shopify theme pull --only config/settings_data.json

# Then commit
git add config/settings_data.json
git commit -m "Update settings"
```

### 3. **Selective Sync**

Sync specific files or directories:

```bash
# Pull only settings
shopify theme pull --only config/settings_data.json

# Pull only sections
shopify theme pull --only sections/

# Pull only assets
shopify theme pull --only assets/

# Push only specific files
shopify theme push --only sections/featured-product.liquid
```

### 4. **Development Theme Workflow** (Recommended)

Use a development theme to avoid affecting live store:

```bash
# Create a development theme
shopify theme push --unpublished

# Work on dev theme
shopify theme dev --theme-editor-sync

# When ready, publish to live
shopify theme publish
```

---

## Common Sync Scenarios

### Scenario 1: Starting Fresh Development

```bash
# 1. Pull everything from live
shopify theme pull

# 2. Check git status
git status

# 3. Commit any changes
git add .
git commit -m "Sync from live store"
```

### Scenario 2: Deploying Changes

```bash
# 1. Ensure you're synced with live
shopify theme pull

# 2. Make your changes locally
# ... edit files ...

# 3. Test locally
shopify theme dev

# 4. Commit changes
git add .
git commit -m "Feature: Add new section"
git push

# 5. Deploy to live
shopify theme push
```

### Scenario 3: Settings Changed in Shopify Admin

```bash
# 1. Pull settings from live
shopify theme pull --only config/settings_data.json

# 2. Commit the updated settings
git add config/settings_data.json
git commit -m "Sync settings from Shopify admin"
git push
```

### Scenario 4: Resolving Conflicts

If you have local changes and need to pull:

```bash
# 1. Stash your local changes
git stash

# 2. Pull from live
shopify theme pull

# 3. Apply your stashed changes
git stash pop

# 4. Resolve any conflicts manually
# ... edit conflicted files ...

# 5. Commit resolved changes
git add .
git commit -m "Resolve sync conflicts"
```

---

## Using Helper Scripts

We've created helper scripts to automate common sync operations:

- `sync-pull.sh` - Pull latest from live store
- `sync-push.sh` - Push local changes to live store (use `--include-settings` flag to ensure settings are pushed)
- `sync-push-settings.sh` - Push only settings file explicitly
- `sync-settings.sh` - Pull and sync settings file safely
- `sync-safe.sh` - Safe sync with conflict checking

See the `scripts/` directory for details.

---

## Important Notes

1. **Always commit before pushing** - This creates a backup of your work
2. **Pull before major changes** - Ensures you're working with latest code
3. **Use development themes** - Test changes without affecting live store
4. **Settings are environment-specific** - Be careful when syncing `settings_data.json`
5. **Backup before major syncs** - Use git commits as your backup

---

## Troubleshooting

### Settings keep getting overwritten?

This happens when Shopify auto-syncs. Solution:
1. Pull settings before committing: `shopify theme pull --only config/settings_data.json`
2. Commit immediately after making setting changes
3. Consider using a development theme for testing

### Settings not pushing?

If `settings_data.json` isn't being pushed:

1. **Push settings explicitly:**
   ```bash
   ./scripts/sync-push-settings.sh
   # or
   shopify theme push --only config/settings_data.json
   ```

2. **Use the include-settings flag:**
   ```bash
   ./scripts/sync-push.sh --include-settings
   ```

3. **Verify settings file exists:**
   ```bash
   ls -la config/settings_data.json
   ```

4. **Check if settings are in .shopifyignore:**
   ```bash
   grep -i settings .shopifyignore
   ```

### Files not syncing?

Check if files are in `.gitignore` or `.shopifyignore`:
```bash
cat .gitignore
cat .shopifyignore  # if exists
```

### Merge conflicts?

Use git stash workflow (see Scenario 4 above) or resolve manually.

