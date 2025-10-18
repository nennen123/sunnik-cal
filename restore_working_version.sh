#!/bin/bash

echo "🔄 Restoring Sunnik Calculator to last working version..."

# Find the most recent backup
LATEST_BACKUP=$(ls -td backups/working_version_* | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backup found!"
    exit 1
fi

echo "📦 Found backup: $LATEST_BACKUP"
echo "⚠️  This will overwrite current files. Continue? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    # Backup current state first
    echo "💾 Backing up current state before restore..."
    mkdir -p backups/before_restore_$(date +%Y%m%d_%H%M)
    cp -r app lib public backups/before_restore_$(date +%Y%m%d_%H%M)/
    
    # Restore from backup
    echo "📥 Restoring files..."
    cp -r "$LATEST_BACKUP/app" .
    cp -r "$LATEST_BACKUP/lib" .
    cp -r "$LATEST_BACKUP/public" .
    cp "$LATEST_BACKUP/package.json" .
    cp "$LATEST_BACKUP/tailwind.config.js" .
    cp "$LATEST_BACKUP/next.config.mjs" .
    
    echo "🧹 Clearing Next.js cache..."
    rm -rf .next
    
    echo "✅ Restore complete!"
    echo "🚀 Run: npm run dev"
else
    echo "❌ Restore cancelled"
fi
