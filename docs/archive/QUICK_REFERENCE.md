# Quick Reference - Sunnik Tank Calculator

## Common Tasks

### Start Development
```bash
npm run dev
```

### Calculate Test Tank
- Dimensions: 8m × 8m × 3m
- Material: SS316
- Result: RM 102,641.24

### Check SKU Format
Should be: `1B45-m-S2` NOT `SS316-BP-3MM-M`

### Fix Cache Issues
```bash
rm -rf .next
npm run dev
```

### Backup Current Version
```bash
cp -r app lib public backups/backup_$(date +%Y%m%d)/
```

## File Locations
- Calculator Logic: `lib/bomCalculator.js`
- Price Loader: `lib/priceLoader.js`
- PDF Generator: `lib/pdfGenerator.js`
- Main Page: `app/calculator/page.js`
- Price Data: `public/sku_prices.csv`
