-- SQL statements to update Supabase materials_pricing table
-- Source: sku_prices.csv and Sunnik-Calculator.pdf
-- Components: SS316/SS304/HDG rectangular tank components
-- Uses category and subcategory fields to distinguish components

-- Insert SS316/SS304/HDG pricing data into materials_pricing table
INSERT INTO public.materials_pricing (
  material_type,
  category,
  subcategory,
  height_range,
  panel_range,
  currency,
  unit_price,
  is_active,
  created_at
)
VALUES
  -- SS316 PANELS (Stainless Steel 316)
  ('SS316', 'panel', '1m_x_1m', '1.0M', 'panels_1_50', 'MYR', 175.62, true, now()),
  ('SS316', 'panel', '4ft_x_4ft', '1.0M', 'panels_1_50', 'MYR', 259.98, true, now()),

  -- SS304 PANELS (Stainless Steel 304)
  ('SS304', 'panel', '1m_x_1m', '1.0M', 'panels_1_50', 'MYR', 175.62, true, now()),
  ('SS304', 'panel', '4ft_x_4ft', '1.0M', 'panels_1_50', 'MYR', 259.98, true, now()),

  -- HDG PANELS (Hot Dip Galvanized)
  ('HDG', 'panel', '4ft_x_4ft', '1.0M', 'panels_1_50', 'MYR', 357.48, true, now()),

  -- SS316 STAYS (Structural Support)
  ('SS316', 'stay', '4ft', '1.0M', 'panels_1_50', 'MYR', 17.36, true, now()),

  -- HDG BRACES (I-Beam Structural Brace)
  ('HDG', 'brace', 'I-beam', '1.0M', 'panels_1_50', 'MYR', 62.50, true, now()),

  -- SS316 VORTEX INHIBITORS
  ('SS316', 'vortex_inhibitor', 'standard', '1.0M', 'panels_1_50', 'MYR', 860.00, true, now()),

  -- CONCRETE FOUNDATION (per square meter)
  ('CONCRETE', 'foundation', 'per_m2', '1.0M', 'panels_1_50', 'MYR', 430.00, true, now()),

  -- SS316 BOLTS (per set)
  ('SS316', 'bolt', 'standard', '1.0M', 'panels_1_50', 'MYR', 10.00, true, now()),

  -- HDG SEALANTS (per roll)
  ('HDG', 'sealant', 'roll', '1.0M', 'panels_1_50', 'MYR', 14.90, true, now()),

  -- SS316 LADDERS (per piece)
  ('SS316', 'ladder', 'standard', '1.0M', 'panels_1_50', 'MYR', 500.00, true, now())

ON CONFLICT ON CONSTRAINT uq_active_materials_pricing
DO UPDATE SET
  unit_price = EXCLUDED.unit_price,
  is_active = true,
  updated_at = now();

-- Verification query to check the inserted/updated data
SELECT
  material_type,
  category,
  subcategory,
  unit_price,
  currency,
  is_active,
  created_at,
  updated_at
FROM public.materials_pricing
WHERE material_type IN ('SS316', 'SS304', 'HDG', 'CONCRETE')
ORDER BY material_type, category, subcategory;

-- Alternative view using current_materials_pricing view (if available)
SELECT
  material_type,
  category,
  subcategory,
  unit_price,
  currency
FROM public.current_materials_pricing
WHERE material_type IN ('SS316', 'SS304', 'HDG', 'CONCRETE')
ORDER BY material_type, category, subcategory;

-- Summary by material type
SELECT
  material_type,
  COUNT(*) as component_count,
  SUM(unit_price) as total_base_price,
  currency
FROM public.materials_pricing
WHERE material_type IN ('SS316', 'SS304', 'HDG', 'CONCRETE')
  AND is_active = true
GROUP BY material_type, currency
ORDER BY material_type;

-- Component breakdown with descriptions
SELECT
  material_type || ' - ' || category || ' (' || subcategory || ')' as component,
  unit_price,
  currency,
  CASE category
    WHEN 'panel' THEN 'Panel size: ' || subcategory
    WHEN 'stay' THEN 'Stay length: ' || subcategory
    WHEN 'brace' THEN 'Brace type: ' || subcategory
    WHEN 'vortex_inhibitor' THEN 'Vortex inhibitor (prevents water swirl)'
    WHEN 'foundation' THEN 'Foundation cost ' || subcategory
    WHEN 'bolt' THEN 'Bolt set for panel connections'
    WHEN 'sealant' THEN 'Sealant for waterproofing'
    WHEN 'ladder' THEN 'Access ladder for tank'
    ELSE 'Component'
  END as description
FROM public.materials_pricing
WHERE material_type IN ('SS316', 'SS304', 'HDG', 'CONCRETE')
  AND is_active = true
ORDER BY
  CASE material_type
    WHEN 'SS316' THEN 1
    WHEN 'SS304' THEN 2
    WHEN 'HDG' THEN 3
    WHEN 'CONCRETE' THEN 4
  END,
  CASE category
    WHEN 'panel' THEN 1
    WHEN 'stay' THEN 2
    WHEN 'brace' THEN 3
    WHEN 'vortex_inhibitor' THEN 4
    WHEN 'foundation' THEN 5
    WHEN 'bolt' THEN 6
    WHEN 'sealant' THEN 7
    WHEN 'ladder' THEN 8
  END;



