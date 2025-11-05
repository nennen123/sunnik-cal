# 🎯 QUICK START: Using the Calculation Engine Subagent

**For:** Non-coders using Cursor + Claude Code  
**Purpose:** How to work with the calculation subagent effectively

---

## 📁 WHAT YOU HAVE NOW

### Main Documents
1. **CALCULATION_ENGINE_SKILL.md** (This is your subagent)
   - Complete calculation logic reference
   - Update procedures
   - Testing guidelines
   - Located: `/home/claude/CALCULATION_ENGINE_SKILL.md`

2. **bomCalculator.js** (The actual code file)
   - Live calculation engine
   - Located: `/home/claude/sunnik_calc/app/lib/bomCalculator.js`

---

## 🔧 HOW TO REQUEST UPDATES

### Template for Calculation Changes

When you want to modify calculations, tell Claude:

```
"Please read CALCULATION_ENGINE_SKILL.md and update the calculation 
for [SPECIFIC THING].

Change needed: [DESCRIBE WHAT YOU WANT]

Example: [PROVIDE EXAMPLE IF POSSIBLE]

Please:
1. Show me the BEFORE code
2. Show me the AFTER code  
3. Explain what changed
4. Provide test cases to verify"
```

### Example Requests

**Example 1: Add New Height**
```
"Please read CALCULATION_ENGINE_SKILL.md and add support for 5m height 
metric tanks.

Use these specifications:
- Base: 6.0mm
- Tier 1: 6.0mm (A)
- Tier 2: 5.0mm (A)  
- Tier 3: 4.5mm (A)
- Tier 4: 3.0mm (A)
- Tier 5: 3.0mm (C)

Show me the before/after code and explain the changes."
```

**Example 2: Modify Partition Logic**
```
"Please read CALCULATION_ENGINE_SKILL.md and change the partition 
base support calculation.

Currently: AB panels = partitionSpan - 4
Change to: AB panels = partitionSpan - 2

Explain why this affects the calculations and show test examples."
```

**Example 3: Add New Material**
```
"Please read CALCULATION_ENGINE_SKILL.md and add support for a new 
material type called 'BRONZE'.

Material code should be: BRZ
Should work with all panel types (metric and imperial)

Show me all the code changes needed."
```

---

## ✅ BEFORE YOU CHANGE ANYTHING

### Always Do This First:
1. **Read the skill first**: Tell Claude to read CALCULATION_ENGINE_SKILL.md
2. **Be specific**: Exactly what do you want to change?
3. **Provide examples**: Give sample input/output if possible
4. **Ask for explanation**: Always request before/after comparison

### Checklist Before Updates
- [ ] I know exactly what I want to change
- [ ] I've checked if it's covered in CALCULATION_ENGINE_SKILL.md
- [ ] I have an example to validate against
- [ ] I'm ready to test the changes

---

## 🧪 HOW TO TEST CHANGES

### After ANY Calculation Update

**Step 1: Quick Visual Check**
```
"Run a test calculation with these inputs:
- Tank: 5m × 5m × 2m
- Panel Type: Metric
- Material: SS316
- Partitions: 0

Show me the complete BOM output."
```

**Step 2: Compare to Manual Calculation**
Use the examples in CALCULATION_ENGINE_SKILL.md (section: Testing & Validation)

**Step 3: Test Edge Cases**
```
"Now test with:
1. Very small tank: 1m × 1m × 1m
2. With partition: 8m × 5m × 3m, 1 partition
3. Imperial panels: 12ft × 12ft × 8ft"
```

**Step 4: Verify SKUs**
```
"Check if all generated SKUs exist in sku_prices.csv and show me 
any missing SKUs."
```

---

## 🚨 WARNING SIGNS

### When Something Is Wrong

❌ **Negative Quantities**
- Indicates logic error in calculation
- Review the specific panel type calculation

❌ **Zero Prices**
- SKU not found in price CSV
- Check SKU format matches exactly

❌ **Unexpected Panel Counts**
- Manual calculation doesn't match output
- Check tier logic or partition calculation

❌ **Missing SKUs**
- Generated SKU doesn't exist in price list
- Verify material code and thickness format

### What to Say to Claude
```
"I got [ERROR/ISSUE]. Please read CALCULATION_ENGINE_SKILL.md 
and diagnose the problem.

Error details: [PASTE ERROR OR DESCRIBE]

Expected: [WHAT SHOULD HAPPEN]
Got: [WHAT ACTUALLY HAPPENED]"
```

---

## 📋 COMMON TASKS

### Task 1: Update Thickness for New Height
**Say to Claude:**
```
"Read CALCULATION_ENGINE_SKILL.md and update thickness selection 
for [HEIGHT]m [METRIC/IMPERIAL] panels.

Specifications: [LIST THICKNESSES PER TIER]"
```

### Task 2: Change Roof Accessory Count
**Say to Claude:**
```
"Read CALCULATION_ENGINE_SKILL.md and change roof accessories to:
- Vents: [NUMBER]
- Manholes: [NUMBER]

Update the roof panel reservation logic accordingly."
```

### Task 3: Modify Partition Base Support
**Say to Claude:**
```
"Read CALCULATION_ENGINE_SKILL.md and change partition base 
support formula from (span - 4) to (span - [NUMBER]).

Explain the impact and show examples."
```

### Task 4: Add New Material Type
**Say to Claude:**
```
"Read CALCULATION_ENGINE_SKILL.md and add new material [NAME]
with code [CODE].

Ensure it works with all panel types and generates valid SKUs."
```

### Task 5: Debug Calculation Issue
**Say to Claude:**
```
"Read CALCULATION_ENGINE_SKILL.md and help me debug this issue:

Input: [YOUR INPUTS]
Expected: [WHAT YOU EXPECT]
Got: [WHAT YOU GOT]

Please trace through the calculation logic and identify the problem."
```

---

## 🎓 LEARNING PATH

### Week 1: Understand the Structure
- Read through CALCULATION_ENGINE_SKILL.md completely
- Run test calculations with known examples
- Compare calculator output to manual calculations

### Week 2: Make Simple Changes
- Add a new thickness tier
- Modify roof accessory counts
- Test changes thoroughly

### Week 3: Advanced Modifications
- Adjust partition logic
- Add new material types
- Create custom calculation variations

---

## 💡 PRO TIPS

### 1. Always Reference the Skill First
```
"Read CALCULATION_ENGINE_SKILL.md before we start..."
```
This ensures Claude has the full context.

### 2. Request Before/After Comparisons
```
"Show me the BEFORE code, then the AFTER code with changes highlighted."
```

### 3. Ask for Explanations
```
"Explain why this change affects [X] and what else it impacts."
```

### 4. Test Immediately
```
"Now run a test calculation to verify this works correctly."
```

### 5. Document Your Changes
```
"Add a comment in the code explaining this change with today's date."
```

---

## 📞 EXAMPLE CONVERSATION

**You:**
```
Hi Claude, I need to add support for 5 meter tall metric tanks.

Please read CALCULATION_ENGINE_SKILL.md first, then add this specification:
- Height range: 5000-5100mm
- Base: 6.0mm
- Tier 1: 6.0mm (A)
- Tier 2: 5.0mm (A)
- Tier 3: 4.5mm (A)
- Tier 4: 3.0mm (A)
- Tier 5: 3.0mm (C)

Show me the code changes and test it with a 5m × 5m × 5m tank.
```

**Claude Will:**
1. Read CALCULATION_ENGINE_SKILL.md
2. Show you the current code
3. Show you the new code with changes
4. Explain what changed
5. Run a test calculation
6. Show you the BOM output
7. Verify all SKUs are valid

---

## 🎯 REMEMBER

### Do This:
✅ Always reference CALCULATION_ENGINE_SKILL.md first  
✅ Be specific about what you want  
✅ Test every change  
✅ Compare to manual calculations  
✅ Ask questions if unsure

### Don't Do This:
❌ Make changes without reading the skill  
❌ Skip testing  
❌ Ignore SKU validation errors  
❌ Change code without understanding impact  
❌ Forget to document changes

---

## 📚 KEY SECTIONS IN THE SKILL

Quick reference to important sections:

- **Calculation Flow** → How the whole system works
- **Thickness Selection Logic** → When different thicknesses apply
- **SKU Generation Rules** → How SKU codes are formatted
- **BOM Components Breakdown** → Panel calculation details
- **Partition System** → How partitions are calculated
- **How to Update Calculations** → Step-by-step modification guide
- **Common Modifications** → Examples of typical changes
- **Testing & Validation** → How to verify changes work

---

**You now have a dedicated calculation subagent! Use this guide whenever you need to update calculation logic.**

*Save this file for quick reference: QUICK_START_GUIDE.md*
