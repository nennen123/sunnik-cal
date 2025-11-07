# Git Workflow - CRITICAL for Memory System

**Last Updated:** 2025-11-07
**Purpose:** Ensure every change is committed so Project Knowledge can find it
**CRITICAL:** Without git commits, the memory system WILL NOT WORK!

---

## ⚠️ **WHY GIT COMMITS ARE MANDATORY**

### **Claude's Project Knowledge ONLY Searches Committed Files**

**This is the #1 reason why memory systems fail:**

```
Files created in editor → NOT visible to new chat ❌
Files saved to disk → NOT visible to new chat ❌
Files committed to git → VISIBLE to new chat ✅
```

**Example of What Happens:**

```
Session 1: You create /docs/START_HERE.md
Session 1: You save the file in Cursor
Session 1: Chat ends

Session 2: New chat starts
New Chat: "I can't find START_HERE.md" ❌

WHY? The file was never committed to git!
```

---

## ✅ **REQUIRED: Commit After EVERY Work Session**

### **The Golden Rule**

**Never end a work session without:**
1. ✅ Saving all files
2. ✅ Committing to git
3. ✅ Pushing to remote
4. ✅ Verifying commit with `git log`

**If you skip this, the next chat session will have NO MEMORY of your work!**

---

## 📋 **Standard Commit Process**

### **After Every Work Session**

```bash
# Step 1: Check what changed
git status

# Step 2: Review changes (optional but recommended)
git diff

# Step 3: Add all changed files
git add .

# OR add specific files/folders
git add docs/
git add lib/bomCalculator.js

# Step 4: Commit with descriptive message
git commit -m "Type: Brief description

Detailed description of what changed and why.

- Bullet point 1
- Bullet point 2

Fixes: BUG-XXX
Tests: X/6 passing"

# Step 5: Push to remote (CRITICAL!)
git push

# Step 6: Verify commit
git log -1
```

---

## 📝 **Commit Message Format**

### **Good Commit Messages**

```bash
git commit -m "docs: Add QUICK_REFERENCE.md to memory system

Added comprehensive business rules reference covering:
- Bolt calculation formulas
- Panel thickness selection
- FRP vs Steel differences
- Build standards overview

This completes the 5-file memory system."
```

```bash
git commit -m "fix: Correct bolt calculation formula (BUG-001)

Fixed bolt quantity calculation in lib/bomCalculator.js:
- Added material-specific bolts per side (13/16/20)
- Applied shared-edge division (÷2)
- Added 20% perimeter buffer (×1.2)

Tests: 6/6 validation tests now passing
Fixes: BUG-001"
```

### **Bad Commit Messages**

```bash
git commit -m "updates"  # ❌ Too vague
git commit -m "fix"      # ❌ What did you fix?
git commit -m "wip"      # ❌ Work in progress - finish it first!
```

---

## 🔄 **Daily Workflow with Git**

### **Start of Day**

```bash
# Pull latest changes (if working from multiple machines)
git pull

# Check current branch
git branch

# Check status
git status
```

### **During Work**

```bash
# After each small change, check what changed
git status
git diff

# Commit frequently (every 30-60 minutes)
git add .
git commit -m "Type: What you did"
git push
```

### **End of Day**

```bash
# Make sure everything is committed
git status

# Should show: "nothing to commit, working tree clean"

# If you have uncommitted changes:
git add .
git commit -m "docs: End of day commit - [what you worked on]"
git push

# Verify final push
git log -1
```

---

## 🎯 **Commit Types**

Use these prefixes for clarity:

| Type | When to Use | Example |
|------|-------------|---------|
| `feat:` | New feature added | `feat: Add FRP material support` |
| `fix:` | Bug fix | `fix: Correct bolt calculation (BUG-001)` |
| `docs:` | Documentation only | `docs: Update QUICK_REFERENCE.md` |
| `test:` | Adding/updating tests | `test: Add validation for Imperial panels` |
| `refactor:` | Code cleanup, no functionality change | `refactor: Extract bolt logic to separate file` |
| `chore:` | Maintenance tasks | `chore: Update dependencies` |
| `style:` | Code formatting | `style: Format with prettier` |

---

## 🚨 **Emergency Recovery**

### **If You Forgot to Commit**

```bash
# You realize you forgot to commit yesterday's work
# Files are still in your editor, but new chat can't see them

# DO THIS IMMEDIATELY:
git status  # See what's uncommitted
git add .
git commit -m "chore: Commit yesterday's work

[Describe what was done yesterday]

Note: Forgot to commit - adding now for Project Knowledge."
git push

# Now new chats can see the work!
```

### **If You Made Mistakes in Commit**

```bash
# Wrong commit message
git commit --amend -m "New better message"
git push --force  # Use with caution!

# Forgot to add a file
git add forgotten-file.md
git commit --amend --no-edit
git push --force  # Use with caution!
```

### **If You Need to Undo Last Commit**

```bash
# Keep changes, undo commit
git reset --soft HEAD~1

# Discard changes, undo commit (DANGEROUS!)
git reset --hard HEAD~1
```

---

## 📊 **Verification Checklist**

After every commit, verify:

```bash
# 1. Check commit was created
git log -1

# You should see your commit message and timestamp

# 2. Check commit was pushed
git status

# You should see: "Your branch is up to date with 'origin/main'"

# 3. Verify files are tracked
git ls-files | grep docs/

# You should see all your /docs/ files listed
```

---

## 🔍 **Troubleshooting**

### **Problem: New chat can't find my files**

```bash
# Check if files are committed
git ls-files | grep "filename"

# If nothing shows up, file is NOT committed
# Solution:
git add path/to/file
git commit -m "docs: Add missing file"
git push
```

### **Problem: Changes not showing up**

```bash
# Check git status
git status

# If it shows uncommitted changes:
git add .
git commit -m "Save current work"
git push
```

### **Problem: Merge conflicts**

```bash
# If you get merge conflicts after git pull
# Option 1: Keep your version
git checkout --ours path/to/file
git add path/to/file
git commit

# Option 2: Keep remote version
git checkout --theirs path/to/file
git add path/to/file
git commit

# Option 3: Manually resolve
# Open the file, fix conflicts, then:
git add path/to/file
git commit
```

---

## 🎯 **Integration with Memory System**

### **How Git Connects to Memory**

```
You create/edit file in Cursor
         ↓
Save file to disk
         ↓
git add + git commit
         ↓
git push to remote
         ↓
Project Knowledge indexes committed files
         ↓
New chat can search and read files
         ↓
Memory system works! ✅
```

### **What Breaks the Chain**

```
You create file
         ↓
You save file
         ↓
❌ You forget to commit
         ↓
Project Knowledge can't see it
         ↓
New chat has no memory
         ↓
Memory system broken! ❌
```

---

## 📋 **Daily Commit Checklist**

Copy this into your DAILY_WORK_LOG.md:

```markdown
## End of Session Checklist

- [ ] All files saved in Cursor
- [ ] `git status` checked
- [ ] All changes staged with `git add`
- [ ] Committed with descriptive message
- [ ] Pushed to remote with `git push`
- [ ] Verified with `git log -1`
- [ ] Updated CHANGELOG.md with session entry
- [ ] Updated CURRENT_STATUS.md if needed

If ALL boxes checked ✅ → Memory system will work next session!
If ANY box unchecked ❌ → Next session will lose memory!
```

---

## 🚀 **Quick Commands Reference**

```bash
# Most common workflow:
git status              # Check what changed
git add .               # Stage all changes
git commit -m "msg"     # Commit with message
git push                # Push to remote

# Verification:
git log -1              # See last commit
git log --oneline -5    # See last 5 commits
git ls-files            # List all tracked files

# Useful info:
git branch              # Show current branch
git remote -v           # Show remote URLs
git diff                # Show unstaged changes
git diff --staged       # Show staged changes
```

---

## ⚠️ **CRITICAL REMINDERS**

1. **Commit after EVERY work session** - No exceptions!
2. **Push after every commit** - Local commits aren't enough
3. **Verify after every push** - Use `git log -1`
4. **New chat won't see uncommitted files** - This is by design
5. **Project Knowledge = Committed files only** - Not files in editor

---

## 💡 **Pro Tips**

### **Commit Often**

Small frequent commits are better than large infrequent ones:
- ✅ Commit every 30-60 minutes
- ✅ Commit after completing each small task
- ✅ Commit before switching to different task

### **Write Good Messages**

Future you will thank present you:
- ✅ Start with type prefix (feat:, fix:, docs:)
- ✅ First line: Brief description (50 chars max)
- ✅ Body: Detailed explanation of what and why
- ✅ Reference bug IDs if applicable

### **Use Branches for Big Changes**

```bash
# Create feature branch
git checkout -b fix/bolt-calculation

# Make changes and commit
git add lib/bomCalculator.js
git commit -m "fix: Implement correct bolt formula"

# Merge back to main when done
git checkout main
git merge fix/bolt-calculation
git push
```

---

## 🎓 **Learning from Mistakes**

### **Common Mistake #1: Forgetting to Push**

```bash
# You committed but didn't push
git commit -m "Important changes"
# Closed laptop and left

# Next day, new chat can't see changes
# Solution: Always push!
git push
```

### **Common Mistake #2: Working Without Commits**

```bash
# You worked for 4 hours
# Made lots of changes
# Never committed
# Computer crashed / Cursor froze
# Lost all work!

# Solution: Commit every 30-60 minutes
```

### **Common Mistake #3: Vague Commit Messages**

```bash
# Bad:
git commit -m "updates"

# 2 weeks later: "What did I update??"

# Good:
git commit -m "fix: Correct Imperial panel SKU format (BUG-002)

Changed SKU generation from 1B45-S2 to 1B3-i-S2 format
for Imperial panels. Added 'i' suffix to distinguish from
metric panels.

Tests: Imperial pricing now showing real prices
Fixes: BUG-002"
```

---

**Remember: Git commits are not optional - they are REQUIRED for the memory system to work!**

**Last Updated:** 2025-11-07
