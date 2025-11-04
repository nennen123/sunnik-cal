# ⚠️ IMPORTANT CORRECTION - PRICE COLUMN

**Date:** November 4, 2025  
**Status:** ✅ CORRECTED in all documentation

---

## 🎯 THE CORRECTION

### WRONG (Initial Documentation):
```javascript
// ❌ INCORRECT - Do NOT use this
const unitPrice = parseFloat(priceData.our_final_price);
```

### CORRECT (Updated):
```javascript
// ✅ CORRECT - Use this for customer quotes
const unitPrice = parseFloat(priceData.market_final_price);
```

---

## 📊 PRICE COLUMNS EXPLAINED

Your `sku_prices.csv` has TWO price columns:

### 1. `our_final_price`
- **What it is:** Internal cost / base cost
- **Use for:** Cost analysis, profit margin calculations, internal reporting
- **NOT for:** Customer quotes

### 2. `market_final_price` ✅
- **What it is:** Customer-facing price (includes markup)
- **Use for:** BOM calculations, customer quotes, invoice generation
- **THIS IS THE ONE TO USE**

---

## 🔧 WHERE THIS APPLIES

### In Code (`bomCalculator.js`)
When looking up prices from CSV:
```javascript
// Price lookup from sku_prices.csv
const priceRow = csvData.find(row => row.InternalReference === sku);

// Use market_final_price for customer quotes
const unitPrice = parseFloat(priceRow.market_final_price);

// Calculate line total
const lineTotal = quantity * unitPrice;
```

### In Documentation
✅ **CALCULATION_ENGINE_SKILL.md** - Section "Pricing Integration" (CORRECTED)  
✅ All code examples updated  
✅ Testing checklist references correct column  

---

## 💡 WHY THIS MATTERS

Using the wrong price column would mean:
- ❌ Quotes at internal cost (losing profit margin)
- ❌ Underpricing to customers
- ❌ Business loses money on every quote

Using the correct column:
- ✅ Proper customer pricing
- ✅ Maintains profit margins
- ✅ Competitive market rates

---

## ✅ VERIFICATION CHECKLIST

When implementing or reviewing price calculations:

- [ ] Price lookup uses `market_final_price` column
- [ ] NOT using `our_final_price` for customer quotes
- [ ] Line totals = quantity × market_final_price
- [ ] Grand totals sum all line totals
- [ ] Test with known SKU to verify correct price pulled

---

## 📝 EXAMPLE FROM YOUR CSV

```csv
InternalReference,our_final_price,market_final_price
1A3-m-S2,165.00,175.00
```

**For customer quote:**
- Quantity: 10 panels
- Unit Price: RM 175.00 ✅ (market_final_price)
- Line Total: RM 1,750.00
- NOT: RM 1,650.00 ❌ (would be if using our_final_price)

**Difference:** RM 100.00 per 10 panels = your profit margin!

---

## 🎯 REMEMBER

**Simple Rule:**
> Customer quotes = `market_final_price` (always!)

**Why it's called "market_final_price":**
- Market = customer-facing / competitive pricing
- Final = includes all markups and margins
- This is what goes on the quote/invoice

---

## 📞 IF YOU SEE `our_final_price` IN CODE

**STOP!** 

Ask:
- "Is this for customer quotes?" → Should be `market_final_price`
- "Is this for internal analysis?" → Then `our_final_price` is okay

When in doubt: **Customer-facing = market_final_price**

---

## ✅ STATUS

All documentation has been corrected to reflect:
- `market_final_price` for customer BOM calculations
- `our_final_price` mentioned only as reference/internal cost

**No further action needed** - documentation is now accurate! ✓

---

**This correction was made based on user feedback and is now the standard across all subagent documentation.**
