# 🎯 CALCULATION SUBAGENT - MASTER OVERVIEW

**Created:** November 4, 2025  
**Purpose:** Central hub for all calculation logic management  
**Status:** Ready to use ✅

---

## 📦 WHAT YOU HAVE NOW

Your calculation logic is now managed by a **dedicated subagent system** with 4 key documents:

### 1. 📘 CALCULATION_ENGINE_SKILL.md (The Brain)
**File:** `/home/claude/CALCULATION_ENGINE_SKILL.md`

**This is your main reference document containing:**
- Complete calculation logic explanation (all formulas)
- Thickness selection rules (SANS 10329:2020)
- SKU generation patterns
- Panel calculation breakdowns (base, walls, roof, partition)
- FRP tank logic
- Price integration method
- Step-by-step update procedures
- Common modification examples
- Testing guidelines

**When to use:** Before ANY calculation changes or when you need to understand how something works.

---

### 2. 🚀 QUICK_START_GUIDE.md (Your Helper)
**File:** `/home/claude/QUICK_START_GUIDE.md`

**This shows you HOW to work with the subagent:**
- Template requests for Claude
- Example conversations
- Before/after comparison methods
- Warning signs to watch for
- Common task templates
- Pro tips for efficiency

**When to use:** Every time you want to make a change or update calculations.

---

### 3. ✅ TESTING_CHECKLIST.md (Quality Control)
**File:** `/home/claude/TESTING_CHECKLIST.md`

**This ensures changes work correctly:**
- 5 mandatory test cases
- Material-specific validation
- Edge case scenarios
- Manual calculation worksheet
- Pass/fail tracking
- Error troubleshooting guide

**When to use:** After EVERY calculation update, before considering it done.

---

### 4. 💻 bomCalculator.js (The Code)
**File:** `/home/claude/sunnik_calc/app/lib/bomCalculator.js`

**This is the actual working code that:**
- Runs all calculations
- Generates SKU codes
- Produces BOM output
- Interfaces with price data

**When to use:** Claude will edit this when you request changes. You don't edit it directly - you tell Claude what to change using the guides above.

---

## 🔄 HOW THE SYSTEM WORKS

```
┌─────────────────────────────────────────────┐
│  YOU (Non-coder)                            │
│  "I need to add 5m height support..."      │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  QUICK_START_GUIDE.md                       │
│  "Here's how to ask Claude..."              │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  YOU + CLAUDE                               │
│  "Read CALCULATION_ENGINE_SKILL.md..."      │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  CALCULATION_ENGINE_SKILL.md                │
│  Claude reads: "5m height goes in section   │
│  X, here's the format, here's what to do"   │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  bomCalculator.js                           │
│  Claude makes the actual code changes       │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  TESTING_CHECKLIST.md                       │
│  Run all tests to verify it works           │
└──────────────┬──────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────┐
│  ✅ DONE - Calculation updated correctly    │
└─────────────────────────────────────────────┘
```

---

## 🎯 YOUR WORKFLOW (Step-by-Step)

### Step 1: Know What You Want
Before starting, clearly define:
- What needs to change?
- Why does it need to change?
- What's the expected behavior?

**Example:**
"I need to support 5m tall tanks because customers are requesting them. They should use 6.0mm base panels and have 5 tiers."

---

### Step 2: Open Quick Start Guide
Open: `QUICK_START_GUIDE.md`

Find the relevant section:
- **New height tier?** → See "Task 1"
- **Change partitions?** → See "Task 3"
- **Add material?** → See "Task 4"
- **Debug issue?** → See "Task 5"

Copy the template for your task.

---

### Step 3: Ask Claude
Use the template from Quick Start Guide:

```
"Hi Claude,

Please read CALCULATION_ENGINE_SKILL.md and [YOUR REQUEST].

[PROVIDE DETAILS]

Please show me:
1. The current code (BEFORE)
2. The new code (AFTER)
3. Explanation of changes
4. Test cases to verify"
```

**Claude will:**
1. Read the skill document
2. Understand the current logic
3. Make the changes
4. Show you before/after
5. Explain what changed
6. Provide test examples

---

### Step 4: Review Changes
Claude will show you something like:

```javascript
// BEFORE:
else if (heightMM >= 4000 && heightMM <= 4080) {
  return { base: 5.0, ... }
}

// AFTER:
else if (heightMM >= 4000 && heightMM <= 4080) {
  return { base: 5.0, ... }
} else if (heightMM >= 5000 && heightMM <= 5100) {
  return { base: 6.0, ... }  // NEW CODE ADDED
}
```

**Verify:**
- Makes sense logically ✓
- Follows existing patterns ✓
- Matches your requirements ✓

---

### Step 5: Test Everything
Open: `TESTING_CHECKLIST.md`

Run through:
- [ ] Mandatory tests (5 tests)
- [ ] Material-specific tests
- [ ] Edge cases
- [ ] Manual calculation spot check

**Say to Claude:**
```
"Please run Test 1 from TESTING_CHECKLIST.md with the updated code."
```

Claude will:
- Run the calculation
- Show you the output
- Compare to expected results
- Flag any issues

---

### Step 6: Verify All Tests Pass
**Requirement:** 100% pass rate

If any tests fail:
```
"Test 2 failed. Please read CALCULATION_ENGINE_SKILL.md and debug 
the issue. Here's what I expected vs what I got: [DETAILS]"
```

Claude will:
- Review the logic
- Identify the problem
- Fix the issue
- Re-run tests

---

### Step 7: Document the Change
**Say to Claude:**
```
"Please add a comment in bomCalculator.js documenting this change 
with today's date and reason."
```

Example comment added:
```javascript
// 2025-11-04: Added support for 5m metric tanks (6.0mm base, 5 tiers)
// Requested for customer projects requiring taller storage
else if (heightMM >= 5000 && heightMM <= 5100) {
  ...
}
```

---

### Step 8: Update the Skill (if major change)
If you made a significant modification:

```
"Please update CALCULATION_ENGINE_SKILL.md to reflect this new 
5m height tier in the appropriate sections."
```

This keeps your documentation current for future updates.

---

## 🎓 LEARNING CURVE

### Week 1: Getting Comfortable
- Read CALCULATION_ENGINE_SKILL.md (skim, don't memorize)
- Run some test calculations
- Try a simple change (like roof accessory count)

**Goal:** Understand the system structure

### Week 2: Making Changes
- Use QUICK_START_GUIDE.md templates
- Make 2-3 actual modifications
- Complete full test cycle each time

**Goal:** Build confidence in the workflow

### Week 3: Independence
- Request changes without referring to guides
- Troubleshoot issues yourself
- Optimize the skill documentation

**Goal:** Self-sufficient with calculations

---

## 💡 KEY PRINCIPLES

### 1. Always Reference the Skill First
**Why:** Claude needs context about your specific calculation logic.

**Do this:**
```
"Read CALCULATION_ENGINE_SKILL.md first, then..."
```

**Not this:**
```
"Add support for 5m tanks" ← Claude might guess wrong
```

---

### 2. Be Specific
**Why:** Vague requests lead to incorrect implementations.

**Do this:**
```
"Add 5m height for METRIC panels (5000-5100mm) with 6.0mm base 
and these 5 tiers: [LIST]"
```

**Not this:**
```
"Make it work for taller tanks" ← Too vague
```

---

### 3. Test Everything
**Why:** Calculation errors = wrong quotes = money lost.

**Do this:**
- Run ALL tests from TESTING_CHECKLIST.md
- Verify 100% pass rate
- Manual spot-check at least one calculation

**Not this:**
- "Looks good" without testing ← DANGER!

---

### 4. Ask Questions
**Why:** Understanding beats blind trust.

**Always ask:**
- "Why did you make this change?"
- "What else does this affect?"
- "Are there edge cases I should worry about?"

**Example:**
```
"You changed the partition calculation. Can you explain why and 
show me how it affects a 10m × 5m tank with 2 partitions?"
```

---

### 5. Document Changes
**Why:** Future you will thank past you.

**After each update:**
- Add code comment with date
- Note in testing checklist
- Update skill doc if major change

---

## 🚨 COMMON MISTAKES TO AVOID

### ❌ Mistake 1: Skipping the Skill Reference
**Problem:** Claude makes changes without full context.

**Solution:** ALWAYS start with "Read CALCULATION_ENGINE_SKILL.md..."

---

### ❌ Mistake 2: Not Testing
**Problem:** Broken calculations go to production.

**Solution:** Use TESTING_CHECKLIST.md after EVERY change.

---

### ❌ Mistake 3: Ignoring Failed Tests
**Problem:** "Test 3 failed but others passed, ship it!"

**Solution:** 100% pass rate required. Debug until all pass.

---

### ❌ Mistake 4: Changing Multiple Things at Once
**Problem:** If something breaks, you don't know which change caused it.

**Solution:** One change at a time. Test. Then next change.

---

### ❌ Mistake 5: Not Verifying SKU Matches
**Problem:** Generated SKUs don't exist in price CSV = $0.00 quotes.

**Solution:** Always verify SKUs against sku_prices.csv.

---

## 📞 GETTING HELP

### If You're Stuck

**Step 1: Check the guides**
- Is it covered in CALCULATION_ENGINE_SKILL.md?
- Does QUICK_START_GUIDE.md have a template?
- Is there a similar example in the skill?

**Step 2: Ask Claude to explain**
```
"I'm trying to [TASK] but I'm not sure how. Please read 
CALCULATION_ENGINE_SKILL.md and explain the relevant section 
in simple terms."
```

**Step 3: Request a walkthrough**
```
"Please walk me through how the partition calculation works step 
by step using an 8m × 5m tank as an example."
```

**Step 4: Debug together**
```
"Something's wrong with [X]. Please read the skill and help me 
debug. Here's what I expected vs what happened: [DETAILS]"
```

---

## 🎯 SUCCESS METRICS

You'll know the subagent system is working when:

✅ **Speed:** Updates that used to take hours now take 15-30 minutes  
✅ **Accuracy:** 100% test pass rate every time  
✅ **Confidence:** You can request changes without anxiety  
✅ **Consistency:** Every calculation follows the same rules  
✅ **Documentation:** Changes are tracked and explainable  

---

## 📁 FILE LOCATIONS SUMMARY

```
/home/claude/
├── CALCULATION_ENGINE_SKILL.md  ← Main reference (read this first)
├── QUICK_START_GUIDE.md         ← How to use the system
├── TESTING_CHECKLIST.md         ← Quality control
└── (This file) MASTER_OVERVIEW.md

/home/claude/sunnik_calc/app/lib/
└── bomCalculator.js             ← The actual code (Claude edits this)
```

---

## 🎉 YOU'RE READY!

You now have:
- ✅ Complete calculation logic documented
- ✅ Clear procedures for updates
- ✅ Comprehensive testing system
- ✅ Quality control measures
- ✅ A dedicated AI subagent to help

**Next Steps:**
1. Read through CALCULATION_ENGINE_SKILL.md (skim, familiarize)
2. Review QUICK_START_GUIDE.md (your daily driver)
3. Try a small change using the templates
4. Run through TESTING_CHECKLIST.md
5. Build confidence!

---

## 💪 REMEMBER

**This system exists to:**
- Prevent you from redoing work ✓
- Ensure accuracy and consistency ✓
- Make updates fast and safe ✓
- Keep documentation current ✓
- Give you confidence in changes ✓

**You're not expected to:**
- Memorize all the calculation logic ✗
- Write code manually ✗
- Debug JavaScript errors ✗
- Know exactly how everything works ✗

**Your job is to:**
- Know what you want to achieve ✓
- Use the guides to communicate with Claude ✓
- Verify results through testing ✓
- Make informed business decisions ✓

---

**Welcome to your calculation subagent system! 🚀**

*This is the most important part of your app - and now it's properly managed and documented.*
