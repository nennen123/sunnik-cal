# START HERE - Read This Before Every Chat Session

**Last Updated:** 2025-11-06
**Project:** Sunnik Tank Calculator
**Status:** 75% Complete - Fixing Critical Bugs
**Current Phase:** Phase 0 - Complete Documentation Needed

---

## 🎯 MANDATORY - Read These Files First

## 🔴 CRITICAL: Git Workflow

**READ THIS:** [GIT_WORKFLOW.md](./GIT_WORKFLOW.md)

**THE #1 RULE:** Commit and push after EVERY work session!

Without git commits:
- ❌ New chats can't see your files
- ❌ Project Knowledge can't search them
- ❌ Memory system doesn't work
- ❌ You lose all progress

**Quick commit reminder:**
```bash
git add .
git commit -m "Type: Brief description"
git push
```

**If you only remember ONE thing:** Always commit and push before ending session!

Every time you start a new chat with Claude, make Claude read these files IN ORDER:

1. **THIS FILE** (`START_HERE.md`) - Overview and instructions
2. **CURRENT_STATUS.md** - What's working and what's broken
3. **QUICK_REFERENCE.md** - Business rules and calculations
4. **CHANGELOG.md** - What was done in previous sessions

**How to tell Claude:**
```
I'm working on Sunnik Tank Calculator. Please read these files from my project:
- /docs/START_HERE.md
- /docs/CURRENT_STATUS.md
- /docs/QUICK_REFERENCE.md
- /docs/CHANGELOG.md

Then ask me what we're working on today.
```

---

## ⚠️ CRITICAL RULES - Never Break These

### Before Making ANY Code Changes:

1. ✅ **Read current status** - Know what's working/broken
2. ✅ **Run tests first** - Baseline before changes
3. ✅ **Make ONE change at a time** - Single function/module
4. ✅ **Test immediately** - Did it work?
5. ✅ **Update CURRENT_STATUS.md** - Document what changed
6. ✅ **Update CHANGELOG.md** - Add entry with details
7. ✅ **Commit with clear message** - Save progress

### Never Do These:

- ❌ **NEVER** make multiple changes at once
- ❌ **NEVER** rebuild entire files without testing
- ❌ **NEVER** assume something works - TEST IT
- ❌ **NEVER** skip documentation updates
- ❌ **NEVER** commit without clear messages

---

## 📊 Current Project State

**What's Working:**
- ✅ CSV price loading (priceLoader.js)
- ✅ Tank capacity calculation
- ✅ Panel counting (base/wall/roof)
- ✅ User interface (clean and functional)
- ✅ FRP panel pricing (shows varied prices)

**What's Broken:**
- 🔴 Bolt calculation (22-44% wrong)
- 🔴 Imperial SS316 pricing (all placeholder RM 150)
- 🔴 HDG Imperial pricing (all same regardless of thickness)
- 🔴 Partition panel pricing (wrong lookups)

**Known Issues:** 3 critical bugs (see CURRENT_STATUS.md)

---

## 🎯 Current Focus

**Phase:** Phase 0 - Complete Documentation
**Goal:** Document ALL business rules before fixing code
**Next Steps:**
1. Document FRP vs Steel differences
2. Document build standards (SONS, BSI, LPCB, MS1390)
3. Document panel thickness rules
4. Document accessory differences
5. Create validation test suite

**Why Documentation First?**
- We've rebuilt 3 times because business logic was incomplete
- Can't fix code without knowing complete requirements
- Documentation prevents memory loss between sessions

---

## 📁 Project Structure
```
sunnik_calc/
├── app/
│   ├── calculator/
│   │   └── page.js          ✅ Working - UI layout
│   └── layout.js            ✅ Working
├── lib/
│   ├── priceLoader.js       ✅ Working - CSV loading
│   ├── bomCalculator.js     🔴 BROKEN - needs complete rewrite
│   ├── supabase.js          ✅ Working
│   └── SYSTEM_STATUS.js     📝 NEW - Status tracking
├── docs/
│   ├── START_HERE.md        📝 THIS FILE
│   ├── CURRENT_STATUS.md    📝 Current state
│   ├── QUICK_REFERENCE.md   📝 Business rules
│   ├── CHANGELOG.md         📝 Session history
│   └── SESSION_TEMPLATE.md  📝 Template for sessions
├── tests/
│   └── validation.test.js   📝 TODO - Real quote tests
└── public/
    └── sku_prices.csv       ✅ Working - 11,578 items
```

---

## 🧪 Test Suite (To Be Created)

**Validation Tests - Real Quotes:**
1. 5×5×3m SS316 Metric (TOTAL: RM 50,226)
2. 8×8×4m FRP (TOTAL: RM 28,681)
3. 8×8×4ft SS304 Imperial (TOTAL: RM 79,435)
4. 5×5×4ft HDG Imperial (TOTAL: RM 57,811)
5. 8×8×2m FRP (TOTAL: RM 26,249)
6. 12×12×4ft SS316 Imperial (TOTAL: RM 106,018)

**Test Status:** 3/6 passing (50%)

---

## 💡 How to Use This System

### Starting a New Session:

1. Open new Claude chat
2. Tell Claude to read the 4 key docs (see top)
3. Claude will know exactly where we are
4. Continue work from last session

### During Work:

1. Make one focused change
2. Test immediately
3. Update CURRENT_STATUS.md
4. Add entry to CHANGELOG.md
5. Commit changes

### Ending a Session:

1. Update CURRENT_STATUS.md with current state
2. Add CHANGELOG.md entry with what was done
3. Commit all changes
4. Note what to work on next session

---

## 🔥 Emergency Recovery

**If something breaks badly:**

1. **Don't panic** - We have git history
2. **Check git log** - See what changed
3. **Revert if needed:** `git checkout <commit-hash>`
4. **Review CHANGELOG.md** - See what was done
5. **Start fresh from last working commit**

**Last Known Working State:**
- Commit: [TO BE ADDED]
- Date: October 30, 2024
- Status: Basic calculator working, needs features

---

## 📞 Quick Reference

**Running Tests:**
```bash
npm run dev              # Start development server
npm run test:validate    # Run validation tests (TODO)
npm run lint            # Check code quality
```

**Git Workflow:**
```bash
git status              # Check what changed
git add .               # Stage changes
git commit -m "msg"     # Commit with message
git push                # Push to remote
```

**Common Tasks:**
- Fix bolt calculation: See lib/bomCalculator.js lines 45-120
- Fix SKU generation: See lib/bomCalculator.js lines 200-350
- Update prices: Edit public/sku_prices.csv
- Add validation test: Edit tests/validation.test.js

---

## 🎓 Learning from Past Mistakes

**Why We Failed 3 Times:**

1. ❌ Built code without complete business rules
2. ❌ No documentation = memory loss between sessions
3. ❌ No tests = didn't know what broke
4. ❌ Big changes = hard to track what went wrong
5. ❌ No status tracking = repeated same mistakes

**How We Prevent It Now:**

1. ✅ Document EVERYTHING before coding
2. ✅ Memory system prevents forgetting
3. ✅ Tests validate every change
4. ✅ Small focused changes = easy to debug
5. ✅ Status tracking = know exactly where we are

---

## ✅ Success Criteria

**Phase 0 Complete When:**
- [ ] All business rules documented
- [ ] All calculation formulas documented
- [ ] All material differences documented
- [ ] Validation test suite created

**Phase 1 Complete When:**
- [ ] All 6 validation tests passing
- [ ] Bolt calculation accurate within 2%
- [ ] Panel pricing matches real quotes exactly
- [ ] No placeholder prices used

**Project Complete When:**
- [ ] All validation tests passing 100%
- [ ] All materials supported (SS316, SS304, HDG, MS, FRP)
- [ ] All build standards supported (SONS, BSI, LPCB, MS1390)
- [ ] All accessories calculated correctly
- [ ] PDF generation working
- [ ] User authentication working

---

**Remember:** Read this file at the start of EVERY session!
