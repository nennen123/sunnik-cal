# Session Template

**Purpose:** Copy-paste template for documenting each work session
**Usage:** Copy this template, fill it out, paste into CHANGELOG.md

---

## 📋 QUICK SESSION TEMPLATE

Copy everything below the line when starting a session:

---

## [YYYY-MM-DD] - Session X - [Brief Title]

**Who:** [Your Name] + Claude
**Duration:** ~XX minutes
**Branch:** [branch name]
**Focus:** [What we're working on today]

### Pre-Session Checklist
- [ ] Read START_HERE.md
- [ ] Read CURRENT_STATUS.md
- [ ] Read last 2-3 CHANGELOG entries
- [ ] Ran `git status` to check current state
- [ ] Ran tests to establish baseline

### What Changed
[One sentence description of main change]

### Files Created
- [ ] `/path/to/file.js` - Description

### Files Modified
- [ ] `/path/to/file.js` (lines XX-YY) - What changed
- [ ] `/path/to/file.md` - What changed

### Tests Run
- [ ] Test name - Result
- [ ] Test name - Result

### Test Results
**Validation Test Pass Rate:**
- Before: X/6 passing
- After: Y/6 passing

**Specific Results:**
```
Test 1: [Name]
- Expected: [value]
- Got: [value]
- Status: ✅ / ❌

Test 2: [Name]
- Expected: [value]
- Got: [value]
- Status: ✅ / ❌
```

### Status Updates Made
- [ ] Updated CURRENT_STATUS.md - Last Updated date
- [ ] Updated CURRENT_STATUS.md - Test results section
- [ ] Updated CURRENT_STATUS.md - Bug status
- [ ] Updated CHANGELOG.md - This entry added

### What Worked Well ✅
- Thing that worked as expected
- Improvement made
- Bug fixed

### What Didn't Work ❌
- Thing that failed
- Unexpected behavior
- Test that still fails

### Issues Discovered 🔍
- **BUG-XXX [Severity]:** Description
- **Pattern noticed:** Description
- **New requirement:** Description

### Next Session Priority 🎯
1. **Most Important:** What to do first
2. **Second:** What to do next
3. **Third:** What to do after that

### Blocking Issues 🚧
- [ ] Issue preventing progress
- [ ] Dependency needed
- [ ] Question that needs answering

### Decisions Made 💡
- **Decision:** What was decided
- **Rationale:** Why we decided this
- **Alternatives considered:** What we didn't choose and why

### Notes 📝
[Any additional context, things to remember, ideas for future]

### Time Breakdown
- Reading/setup: XX min
- Coding/changes: XX min
- Testing: XX min
- Documentation: XX min
- **Total:** XX min

### Git Commit
```bash
git add [files]
git commit -m "[Type]: [Short description]

[Detailed description]
- What changed and why
- Test results
- Related issues: BUG-XXX"

git push
```

**Commit Hash:** [paste hash after commit]

---

## 🎯 FOCUSED SESSION TEMPLATE (For Small Changes)

Use this for quick, focused sessions on one specific thing:

---

## [YYYY-MM-DD] - Quick Fix: [What You Fixed]

**Duration:** ~XX minutes
**Branch:** [branch name]

**Changed:** [One file, one function, one thing]
**Why:** [Bug ID or reason]
**Test:** [Which test validates this]
**Result:** ✅ / ❌

**Before:**
```
[Issue description or test result]
```

**After:**
```
[Fix description or test result]
```

**Commit:** `git commit -m "[Type]: [Description]"` - [hash]

---

## 📊 SESSION TYPES & TEMPLATES

### Type 1: Documentation Session
**Focus:** Writing docs, no code changes
**Template:** Use QUICK template, skip "Files Modified"
**Key Sections:** What documented, decisions made, next priorities

### Type 2: Bug Fix Session
**Focus:** Fixing specific bug(s)
**Template:** Use QUICK template, emphasize test results
**Key Sections:** Bug ID, before/after, test validation

### Type 3: Feature Addition Session
**Focus:** Adding new functionality
**Template:** Use QUICK template, emphasize what was added
**Key Sections:** Files created, new tests, documentation updates

### Type 4: Testing Session
**Focus:** Running tests, no code changes
**Template:** Use FOCUSED template
**Key Sections:** Test results, issues discovered

### Type 5: Refactoring Session
**Focus:** Improving code structure
**Template:** Use QUICK template
**Key Sections:** What refactored, tests still passing, improved clarity

---

## ✅ Session Completion Checklist

Before ending ANY session:

- [ ] All changes committed to git
- [ ] CHANGELOG.md updated with this session
- [ ] CURRENT_STATUS.md updated (if needed)
- [ ] Tests run and results documented
- [ ] Next session priority clearly stated
- [ ] Any blocking issues noted
- [ ] Git pushed to remote

---

## 💡 Tips for Good Documentation

### Be Specific
❌ "Fixed the calculator"
✅ "Fixed bolt calculation in lib/bomCalculator.js lines 45-67 to use material-specific bolts per side"

### Include Context
❌ "Changed function"
✅ "Changed calculateBolts() to divide by 2 for shared edges - was counting each connection twice"

### Record Failures Too
❌ Only mention what worked
✅ "Attempted fix for Imperial SKU generation but test still fails - need to check if SKUs exist in CSV"

### Link to Bugs
❌ "Fixed pricing issue"
✅ "Fixed BUG-002: Imperial SS316 now generates correct SKU format 1B3-i-S2 instead of wrong format"

### Note Decisions
❌ Just make a change
✅ "Decided to create separate materialRules.js instead of expanding bomCalculator.js because FRP rules are completely different from steel"

---

## 📝 Quick Copy-Paste Snippets

### Test Result Format
```markdown
**Test X: [Name]**
- Input: [dimensions, material, etc.]
- Expected: [value]
- Got: [value]
- Status: ✅ PASS / ❌ FAIL / ⚠️ PARTIAL
- Error: [percentage or description]
```

### Bug Discovery Format
```markdown
**BUG-XXX [HIGH/MEDIUM/LOW]:** [Short description]
- **Impact:** [Who/what affected]
- **Cause:** [Root cause if known]
- **Location:** [File and lines]
- **Fix:** [Proposed solution]
```

### Git Commit Types
```markdown
feat: New feature
fix: Bug fix
docs: Documentation only
test: Adding or updating tests
refactor: Code change without functionality change
chore: Maintenance tasks
```

---

## 🔄 Workflow Reminder

1. **Start Session:**
   - Read START_HERE.md, CURRENT_STATUS.md, CHANGELOG.md
   - Copy this template
   - Note what you're working on

2. **During Session:**
   - Make ONE focused change
   - Test immediately
   - Document as you go

3. **End Session:**
   - Fill out complete template
   - Update CURRENT_STATUS.md if needed
   - Paste template into CHANGELOG.md (at top)
   - Commit and push everything

4. **Between Sessions:**
   - Memory system preserves all context
   - Next session picks up exactly where you left off
   - No forgetting, no rebuilding!

---

**Pro Tip:** Keep this template open in a second window while working. Fill it out in real-time instead of trying to remember everything at the end!

**Last Updated:** 2025-11-06
