// app/lib/accessoryDefaults.js
// Sunnik Tank Calculator - Accessory Preset Configurations
// Based on MS1390:2010 (SPAN) and SS245/BSEN13280 specifications

/**
 * MS1390:2010 (SPAN Approved) - Default Configuration
 * Source: Customer screenshot at 1.47.18pm
 */
export const MS1390_DEFAULTS = {
    // TANK REINFORCEMENT
    specification: 'MS1390:2010 (SPAN Approved)',
    tankSealant: 'EPDM Sealant',
    bracing: 'Internal Brace',
    externalBraceType: null, // Only enabled when external brace selected
    tierods: 'SS304',
    internalBracket: 'SS304',
    externalBracket: 'HDG',
    roofBracket: 'ABS',
    roofPipe: 'ABS',

    // TANK ACCESSORIES
    manhole: {
      quantity: 1,
      type: 'Normal'
    },
    wli: {
      quantity: 1,
      type: 'HDG Ball Float'
    },
    internalLadder: {
      quantity: 1,
      material: 'FRP'
    },
    externalLadder: {
      quantity: 1,
      material: 'HDG'
    },
    safetyCage: {
      enabled: true,
      extensionHeight: '' // In mm
    },
    airVent: {
      quantity: 2,
      size: '50mm'
    },

    // SKID BASE MATERIALS
    rcPlinth: 'Vertical Orientation',
    skidBaseMaterial: 'C-Channel',
    mainBeam: 'C-Channel 100mm x 50mm x 5mm',
    subBeam: 'Angle 80mm x 80mm x 8mm',
    lengthType: 'Standard Length',
    customLength: null,
    coating: 'Hot-Dipped Galvanize',

    // BOLT, NUT & WASHER
    externalBNW: 'HDG',
    internalBNW: 'SS304',
    roofBNW: 'SS304',
    bnwSpecialRequest: '',

    // PIPE FITTINGS
    pipeFittings: [], // Empty by default - user adds as needed

    // REMARKS
    remarks: ''
  };

  /**
   * SS245/BSEN13280 (Without SPAN) - Default Configuration
   * Source: Customer screenshot at 1.47.25pm
   *
   * Key Differences from MS1390:
   * - Tank Sealant: PVC Foam (instead of EPDM)
   * - Roof Pipe: UPVC (instead of ABS)
   * - Roof BNW: HDG (instead of SS304)
   */
  export const SS245_DEFAULTS = {
    // TANK REINFORCEMENT
    specification: 'SS245/BSEN13280 (Without SPAN)',
    tankSealant: 'PVC Foam Sealant', // ← DIFFERENT
    bracing: 'Internal Brace',
    externalBraceType: null,
    tierods: 'SS304',
    internalBracket: 'SS304',
    externalBracket: 'HDG',
    roofBracket: 'ABS',
    roofPipe: 'UPVC', // ← DIFFERENT (not ABS)

    // TANK ACCESSORIES (same as MS1390)
    manhole: {
      quantity: 1,
      type: 'Normal'
    },
    wli: {
      quantity: 1,
      type: 'HDG Ball Float'
    },
    internalLadder: {
      quantity: 1,
      material: 'FRP'
    },
    externalLadder: {
      quantity: 1,
      material: 'HDG'
    },
    safetyCage: {
      enabled: true,
      extensionHeight: ''
    },
    airVent: {
      quantity: 2,
      size: '50mm'
    },

    // SKID BASE MATERIALS (same as MS1390)
    rcPlinth: 'Vertical Orientation',
    skidBaseMaterial: 'C-Channel',
    mainBeam: 'C-Channel 100mm x 50mm x 5mm',
    subBeam: 'Angle 80mm x 80mm x 8mm',
    lengthType: 'Standard Length',
    customLength: null,
    coating: 'Hot-Dipped Galvanize',

    // BOLT, NUT & WASHER
    externalBNW: 'HDG',
    internalBNW: 'SS304',
    roofBNW: 'HDG', // ← DIFFERENT (not SS304)
    bnwSpecialRequest: '',

    // PIPE FITTINGS
    pipeFittings: [],

    // REMARKS
    remarks: ''
  };

  /**
   * Get defaults based on specification selection
   */
  export function getAccessoryDefaults(specification) {
    if (specification === 'SS245/BSEN13280 (Without SPAN)') {
      return { ...SS245_DEFAULTS };
    }
    // Default to MS1390
    return { ...MS1390_DEFAULTS };
  }

  /**
   * Specification options
   */
  export const SPECIFICATIONS = [
    'MS1390:2010 (SPAN Approved)',
    'SS245/BSEN13280 (Without SPAN)'
  ];

  /**
   * Tank Sealant Options
   */
  export const TANK_SEALANTS = [
    'EPDM Sealant',
    'PVC Foam Sealant',
    'SEBS'
  ];

  /**
   * Bracing Options
   */
  export const BRACING_OPTIONS = [
    'Internal Brace',
    'External (I-beam)',
    'External (C-channel)',
    'Both (Internal + External)'
  ];

  /**
   * External Brace Types (I-beam options)
   */
  export const EXTERNAL_BRACE_TYPES = [
    '203 x 102mm 15kg/m',
    '203 x 102mm 20kg/m',
    '203 x 102mm 23kg/m',
    '254 x 102mm 25.3kg/m',
    '305 x 165mm 39kg/m'
  ];

  /**
   * Material Options (for brackets, tierods, etc.)
   */
  export const BRACKET_MATERIALS = ['HDG', 'SS304', 'SS316'];
  export const TIEROD_MATERIALS = ['SS304', 'SS316'];
  export const ROOF_MATERIALS = ['ABS', 'UPVC', 'HDG', 'SS304', 'SS316'];

  /**
   * Manhole Options
   */
  export const MANHOLE_TYPES = ['Normal', 'Sliding'];

  /**
   * WLI Options
   */
  export const WLI_TYPES = [
    'HDG Ball Float',
    'SS304 Ball Float',
    'Tube Type'
  ];

  /**
   * Ladder Materials
   */
  export const LADDER_MATERIALS = [
    'FRP',
    'Aluminium',
    'HDG',
    'SS304',
    'SS316'
  ];

  /**
   * Air Vent Sizes
   */
  export const AIR_VENT_SIZES = ['50mm', '100mm'];

  /**
   * RC Plinth Orientations
   */
  export const RC_PLINTH_OPTIONS = [
    'Vertical Orientation',
    'Horizontal Orientation'
  ];

  /**
   * Skid Base Materials
   */
  export const SKID_BASE_MATERIALS = [
    'SHS',
    'I-Beam',
    'C-Channel'
  ];

  /**
   * Main Beam Options
   */
  export const MAIN_BEAM_OPTIONS = [
    'SHS 50 x 50mm x 4t',
    'SHS 50 x 50mm x 4.5t',
    'C-Channel 100mm x 50mm x 5mm'
  ];

  /**
   * Sub Beam Options
   */
  export const SUB_BEAM_OPTIONS = [
    'SHS 50 x 50mm x 4t',
    'SHS 50 x 50mm x 4.5t',
    'Angle 80mm x 80mm x 8mm'
  ];

  /**
   * Coating Options
   */
  export const COATING_OPTIONS = [
    'Hot-Dipped Galvanize',
    'Painted'
  ];

  /**
   * Pipe Fitting Options
   */
  export const PIPE_OPENING_TYPES = [
    'Inlet',
    'Outlet',
    'Overflow/Warning',
    'Drain',
    'Balancing'
  ];

  export const PIPE_FLANGE_TYPES = [
    'PN16',
    'Table E',
    'ANSI',
    'JIS 10k',
    'JAMNUT'
  ];

  export const PIPE_SIZES = [
    '2" (50mm)',
    '2½" (65mm)',
    '3" (80mm)',
    '4" (100mm)',
    '6" (150mm)',
    '8" (200mm)',
    '10" (250mm)',
    '12" (300mm)'
  ];

  export const PIPE_MATERIALS = [
    'MS',
    'HDG',
    'SS304',
    'SS316'
  ];

  export const PIPE_ITEMS_OUTSIDE = [
    'Flange',
    'S/F Nozzle',
    'D/F Nozzle',
    'Socket'
  ];

  export const PIPE_ITEMS_INSIDE = [
    'Flange',
    'S/F Nozzle',
    'D/F Nozzle',
    'Socket',
    'Vortex Inhibitor'
  ];

  /**
   * Default pipe fitting object structure
   */
  export const DEFAULT_PIPE_FITTING = {
    opening: 'Outlet',
    flangeType: 'PN16',
    size: '6" (150mm)',
    outsideMaterial: 'SS316',
    outsideItem: 'Flange',
    insideMaterial: 'SS316',
    insideItem: 'Socket',
    quantity: 1
  };

  export default {
    MS1390_DEFAULTS,
    SS245_DEFAULTS,
    getAccessoryDefaults,
    SPECIFICATIONS,
    TANK_SEALANTS,
    BRACING_OPTIONS,
    EXTERNAL_BRACE_TYPES,
    BRACKET_MATERIALS,
    TIEROD_MATERIALS,
    ROOF_MATERIALS,
    MANHOLE_TYPES,
    WLI_TYPES,
    LADDER_MATERIALS,
    AIR_VENT_SIZES,
    RC_PLINTH_OPTIONS,
    SKID_BASE_MATERIALS,
    MAIN_BEAM_OPTIONS,
    SUB_BEAM_OPTIONS,
    COATING_OPTIONS,
    PIPE_OPENING_TYPES,
    PIPE_FLANGE_TYPES,
    PIPE_SIZES,
    PIPE_MATERIALS,
    PIPE_ITEMS_OUTSIDE,
    PIPE_ITEMS_INSIDE,
    DEFAULT_PIPE_FITTING
  };
