# Quick Sync Reference

## 🚀 Most Common Commands

### Pull from Live Store
```bash
# Pull everything
./scripts/sync-pull.sh

# Or use Shopify CLI directly
shopify theme pull
```

### Push to Live Store
```bash
# Push everything (with safety check)
./scripts/sync-push.sh

# Or use Shopify CLI directly
shopify theme push
```

### Sync Settings Only
```bash
# Safe settings sync (recommended)
./scripts/sync-settings.sh

# Or manually
shopify theme pull --only config/settings_data.json
```

### Safe Sync (Recommended Daily Workflow)
```bash
# Pulls, checks conflicts, commits if needed
./scripts/sync-safe.sh
```

---

## 📋 Daily Workflow

```bash
# 1. Start of day: Sync from live
./scripts/sync-safe.sh

# 2. Make your changes
# ... edit files ...

# 3. Test locally
shopify theme dev

# 4. Commit changes
git add .
git commit -m "Your changes"
git push

# 5. Deploy when ready
./scripts/sync-push.sh
```

---

## ⚠️ Settings Sync Issue Fix

**Problem**: Settings get overwritten after commit.

**Solution**: Always pull settings before committing:

```bash
# Before committing
./scripts/sync-settings.sh

# Or manually
shopify theme pull --only config/settings_data.json
git add config/settings_data.json
git commit -m "Update settings"
```

---

## 🔍 Selective Sync

```bash
# Pull only sections
shopify theme pull --only sections/

# Pull only assets
shopify theme pull --only assets/

# Push specific file
shopify theme push --only sections/featured-product.liquid
```

---

## 📚 Full Documentation

See [SYNC_WORKFLOW.md](./SYNC_WORKFLOW.md) for detailed workflows and troubleshooting.

