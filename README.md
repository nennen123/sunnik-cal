# Sunnik Tank Calculator

Professional Bill of Materials (BOM) and quotation system for modular water tank construction.

## Features

- **Tank Configuration**: Calculate BOM for tanks with custom dimensions (length, width, height)
- **Multiple Materials**: Support for SS316, SS304, HDG, MS, and FRP panels
- **Real-time Pricing**: Live pricing from Supabase database (8,247+ SKUs)
- **Panel Types**: Metric (1M x 1M) and Imperial (4' x 4') panel sizes
- **Partition Support**: Calculate materials for internal partitions
- **Automatic SKU Matching**: Intelligent SKU generation and price matching

## Tech Stack

- **Framework**: Next.js 15.5.4 with Turbopack
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Language**: JavaScript/React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project

### Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the calculator.

## Project Structure

```
sunnik_calc/
├── app/
│   ├── calculator/          # Main calculator page
│   │   ├── page.js         # Calculator UI and logic
│   │   └── components/     # Calculator components
│   └── lib/
│       ├── supabase.js           # Supabase client
│       └── supabasePriceLoader.js # Price loading with pagination
├── lib/
│   └── bomCalculator.js    # BOM calculation engine
└── .env.local              # Environment variables (not in git)
```

## Supabase Integration

### Price Loading

The system loads prices from Supabase using pagination to handle 10,000+ products:

```javascript
import { loadPrices, getPrice } from './lib/supabasePriceLoader';

// Load all prices (with automatic pagination)
const prices = await loadPrices();

// Get price for specific SKU
const price = getPrice(prices, '1A3-m-S2');
```

### SKU Format

Panels use the format: `{type}{location}{thickness}-{size}-{material}`

Examples:
- `1A3-m-S2` = Type 1, Panel A, 3mm, Metric, SS316
- `1B25-i-HDG` = Type 1, Panel B, 2.5mm, Imperial, Hot-Dip Galvanized
- `3B30-FRP` = Type 3, Base Panel, 3.0mm depth, FRP

### Database Schema

Products table requirements:
- `sku` (string): Product SKU code
- `market_final_price` (decimal): Customer pricing
- `is_available` (boolean): Product availability
- `description` (text): Product description
- `item_category2` (string): Product category

## Features in Detail

### Material Support

- **SS316**: Stainless Steel 316 (food grade)
- **SS304**: Stainless Steel 304
- **HDG**: Hot-Dip Galvanized steel
- **MS**: Mild Steel
- **FRP**: Fiber Reinforced Plastic

### Price Caching

Prices are cached for 5 minutes to reduce database queries:
- Cache status displayed in UI
- Automatic refresh on expiration
- Manual cache clearing available

### Intelligent Price Matching

The system uses multiple fallback strategies:
1. Exact SKU match
2. Case-insensitive match
3. Partial match for FRP panels
4. Normalized match (handles special characters)
5. Fallback to RM 150.00 if no match found

## Database Statistics

- **Total SKUs**: 8,247 available products with prices
- **Categories**: Panels, Raw Materials, Consumables, Accessories
- **Panel Types**: 198 unique panel type codes
- **Materials**: FRP (749 SKUs), SS316 (614 SKUs), and others

## Recent Updates

### November 25, 2025 - Supabase Integration Complete

- ✅ Migrated from CSV to Supabase live pricing
- ✅ Implemented pagination to load all 8,247+ SKUs
- ✅ Fixed SKU matching for all material types
- ✅ Verified 100% price accuracy against database
- ✅ Added real-time cache status display

## Development

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

## Support

For issues or questions, please contact the development team.

---

**Last Updated**: November 25, 2025
**Version**: 2.0.0 (Supabase Integration)
