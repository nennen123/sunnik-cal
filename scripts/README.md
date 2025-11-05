# 📜 Project Session Scripts

Automation scripts to help you track your work sessions, maintain documentation, and manage git commits efficiently.

---

## 🚀 Available Scripts

### 1. `start-work.sh` - Start Your Work Session

**What it does:**
- Displays the current date in a friendly format
- Shows your "Next Immediate Tasks" from PROJECT_STATUS_TRACKER.md
- Prompts you to describe what you'll work on today
- Creates/updates `docs/CURRENT_SESSION.md` with a session template
- Provides a clean starting point for your work

**How to use:**
```bash
# Option 1: Direct execution
./scripts/start-work.sh

# Option 2: Using npm (recommended)
npm run work:start
```

**What you'll see:**
```
╔════════════════════════════════════════╗
║  🚀 Starting Work Session              ║
╚════════════════════════════════════════╝

📅 Today is: November 5, 2025

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 NEXT IMMEDIATE TASKS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Your tasks from PROJECT_STATUS_TRACKER.md]

✏️  What will you work on today?
👉 [Your input here]
```

**Output:**
- Updates `docs/CURRENT_SESSION.md` with today's session template
- Ready to track your work!

---

### 2. `end-work.sh` - End Your Work Session

**What it does:**
- Shows git status (modified, added, deleted files)
- Displays change statistics (lines added/removed)
- Prompts you to summarize your work (or auto-generates one)
- Appends entry to `docs/DAILY_WORK_LOG.md`
- Optionally commits your changes with a formatted message
- Optionally pushes to remote repository

**How to use:**
```bash
# Option 1: Direct execution
./scripts/end-work.sh

# Option 2: Using npm (recommended)
npm run work:end
```

**What you'll see:**
```
╔════════════════════════════════════════╗
║  🏁 Ending Work Session                ║
╚════════════════════════════════════════╝

📊 GIT STATUS:
 M Lib/bomCalculator.js
 M docs/PROJECT_STATUS_TRACKER.md

📈 CHANGES SUMMARY:
 Lib/bomCalculator.js              | 10 ++++---
 docs/PROJECT_STATUS_TRACKER.md    |  5 +++--
 2 files changed, 8 insertions(+), 7 deletions(-)

✏️  Summarize what you accomplished today:
   (Press Enter when done, or type 'auto' for auto-summary)
👉 [Your summary or 'auto']
```

**Features:**
- **Auto-summary**: Type `auto` to generate a summary based on changed file types
- **Manual summary**: Describe your work in your own words
- **Daily log**: Automatically adds formatted entry to DAILY_WORK_LOG.md
- **Smart commits**: Generates descriptive commit messages
- **Interactive**: Asks for confirmation before committing/pushing

**Output:**
- Updates `docs/DAILY_WORK_LOG.md` with session summary
- Optionally commits changes with formatted message
- Optionally pushes to remote

---

## 📋 Workflow Example

### Typical Work Session:

```bash
# 1. Start your work session
npm run work:start
# Enter what you'll work on today

# 2. Do your work
# ... coding, testing, documenting ...

# 3. End your work session
npm run work:end
# Summarize your work
# Choose whether to commit and push
```

---

## 🎯 What Gets Updated

### `docs/CURRENT_SESSION.md`
Updated by: `start-work.sh`

Template includes:
- Session date and start time
- Today's focus (what you'll work on)
- Checklist of tasks
- Issues encountered section
- Notes & learnings section
- Next steps section

### `docs/DAILY_WORK_LOG.md`
Updated by: `end-work.sh`

Each entry includes:
- Session date and time
- Work summary
- Git change statistics
- List of modified files

---

## 🎨 Features

### Colorful Output
Both scripts use colors for better readability:
- 🟦 Blue: Section headers
- 🟩 Green: Success messages and prompts
- 🟨 Yellow: Tips and warnings
- 🟪 Magenta: Highlights
- 🟦 Cyan: File paths and commands

### Smart Auto-Summary
The `end-work.sh` script can auto-generate summaries based on file types:
- `.js/.jsx` files → "Updated JavaScript/React components and logic"
- `.md` files → "Updated documentation"
- `.css` files → "Updated styles and UI"
- `package.json` → "Updated dependencies and configuration"

### Interactive Confirmations
- Asks before committing
- Asks before pushing
- Shows what will be committed
- Provides clear feedback

---

## 💡 Tips

1. **Use npm scripts** for easier access:
   - `npm run work:start` instead of `./scripts/start-work.sh`
   - `npm run work:end` instead of `./scripts/end-work.sh`

2. **Be descriptive** in your work summaries - future you will thank you!

3. **Run end-work.sh regularly** - Don't wait until end of day. Run it after completing each major task.

4. **Review before committing** - The script shows exactly what will be committed before you confirm.

5. **Use auto-summary** when you're in a hurry, but manual summaries are more meaningful.

---

## 🔧 Customization

### Modify Session Template
Edit `start-work.sh` line ~80 to customize the CURRENT_SESSION.md template.

### Change Auto-Summary Logic
Edit `end-work.sh` lines ~70-85 to modify how auto-summaries are generated.

### Adjust Colors
Modify the color variables at the top of each script:
```bash
GREEN='\033[0;32m'
BLUE='\033[0;34m'
# ... etc
```

---

## 🐛 Troubleshooting

### Script won't run
**Problem:** Permission denied
**Solution:** Make sure scripts are executable:
```bash
chmod +x scripts/*.sh
```

### "Command not found" when using npm scripts
**Problem:** npm scripts not added to package.json
**Solution:** Add them manually (see npm scripts section below)

### Git operations fail
**Problem:** Not in a git repository
**Solution:** Make sure you're in the project root directory

---

## 📦 NPM Scripts

Add these to your `package.json` under the `"scripts"` section:

```json
{
  "scripts": {
    "work:start": "./scripts/start-work.sh",
    "work:end": "./scripts/end-work.sh"
  }
}
```

Then use:
- `npm run work:start` to start a session
- `npm run work:end` to end a session

---

## 📚 Related Documentation

- `docs/PROJECT_STATUS_TRACKER.md` - Overall project status and tasks
- `docs/CURRENT_SESSION.md` - Current work session notes
- `docs/DAILY_WORK_LOG.md` - Historical log of all sessions

---

**Happy tracking! 🎉**
