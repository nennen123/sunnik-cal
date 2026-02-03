// app/lib/quoteService.js
// Quote management service - save, retrieve, and manage quotes
// Version: 1.0.0

import { supabase } from './supabase';

/**
 * Save quote to database and get serial number
 * @param {Object} quoteData - Quote data to save
 * @returns {Object} - { serialNumber, quoteId, error }
 */
export async function saveQuote({
  userId,
  customerCompany,
  tankLocation,
  tankConfig,
  basePrice,
  markupPercentage,
  finalPrice,
  commissionType,
  commissionValue,
  commissionAmount,
  customComponents
}) {
  try {
    // 1. Generate serial number using Supabase function
    const { data: serialData, error: serialError } = await supabase
      .rpc('generate_serial_number');

    if (serialError) {
      console.error('Error generating serial number:', serialError);
      return { serialNumber: null, quoteId: null, error: serialError };
    }

    const serialNumber = serialData;

    // 2. Insert quote into database
    const { data: quoteData, error: insertError } = await supabase
      .from('quotes')
      .insert({
        serial_number: serialNumber,
        user_id: userId,
        customer_company: customerCompany,
        tank_location: tankLocation,
        tank_config: tankConfig,
        base_price: basePrice,
        markup_percentage: markupPercentage,
        final_price: finalPrice,
        commission_type: commissionType || null,
        commission_value: commissionValue || 0,
        commission_amount: commissionAmount || 0,
        custom_components: customComponents || [],
        version: 1,
        status: 'final'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving quote:', insertError);
      return { serialNumber: null, quoteId: null, error: insertError };
    }

    console.log(`Quote saved: ${serialNumber}`);
    return {
      serialNumber: quoteData.serial_number,
      quoteId: quoteData.id,
      error: null
    };

  } catch (err) {
    console.error('Unexpected error saving quote:', err);
    return { serialNumber: null, quoteId: null, error: err };
  }
}

/**
 * Get all quotes for a user
 * @param {string} userId - User ID
 * @returns {Object} - { quotes, error }
 */
export async function getMyQuotes(userId) {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quotes:', error);
      return { quotes: [], error };
    }

    return { quotes: data, error: null };

  } catch (err) {
    console.error('Unexpected error fetching quotes:', err);
    return { quotes: [], error: err };
  }
}

/**
 * Get single quote by serial number
 * @param {string} serialNumber - Quote serial number (e.g., SQ-2026-000001)
 * @returns {Object} - { quote, error }
 */
export async function getQuoteBySerial(serialNumber) {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('serial_number', serialNumber)
      .single();

    if (error) {
      console.error('Error fetching quote:', error);
      return { quote: null, error };
    }

    return { quote: data, error: null };

  } catch (err) {
    console.error('Unexpected error fetching quote:', err);
    return { quote: null, error: err };
  }
}

/**
 * Update quote status
 * @param {string} quoteId - Quote ID
 * @param {string} status - New status ('draft', 'final', 'accepted', 'rejected')
 * @returns {Object} - { success, error }
 */
/**
 * Strip trailing revision letter from serial number
 * "SQ-2026-000001A" → "SQ-2026-000001"
 */
export function getBaseSerialNumber(serialNumber) {
  return serialNumber.replace(/[A-Z]$/, '');
}

/**
 * Detect changes between old quote and new values
 * Returns human-readable summary string
 */
export function detectChanges(oldQuote, newValues) {
  const changes = [];
  const oldConfig = oldQuote.tank_config || {};

  if (oldConfig.length !== newValues.tankConfig?.length ||
      oldConfig.width !== newValues.tankConfig?.width ||
      oldConfig.height !== newValues.tankConfig?.height) {
    changes.push(`Dimensions: ${oldConfig.length}×${oldConfig.width}×${oldConfig.height}m → ${newValues.tankConfig?.length}×${newValues.tankConfig?.width}×${newValues.tankConfig?.height}m`);
  }
  if (oldConfig.material !== newValues.tankConfig?.material) {
    changes.push(`Material: ${oldConfig.material} → ${newValues.tankConfig?.material}`);
  }
  if (oldQuote.markup_percentage !== newValues.markupPercentage) {
    changes.push(`Markup: ${oldQuote.markup_percentage}% → ${newValues.markupPercentage}%`);
  }
  if (Math.abs((oldQuote.final_price || 0) - (newValues.finalPrice || 0)) > 0.01) {
    changes.push(`Final price: RM ${Number(oldQuote.final_price).toLocaleString()} → RM ${Number(newValues.finalPrice).toLocaleString()}`);
  }
  if (oldQuote.customer_company !== newValues.customerCompany) {
    changes.push(`Customer: ${oldQuote.customer_company} → ${newValues.customerCompany}`);
  }

  return changes.length > 0 ? changes.join('; ') : 'Minor adjustments';
}

/**
 * Save a revision of an existing quote
 * Creates new quote with next letter (A, B, C...) and links to parent
 */
export async function saveRevision({
  parentQuoteId,
  baseSerialNumber,
  userId,
  customerCompany,
  tankLocation,
  tankConfig,
  basePrice,
  markupPercentage,
  finalPrice,
  commissionType,
  commissionValue,
  commissionAmount,
  customComponents,
  changesSummary
}) {
  try {
    // 1. Find existing revisions to determine next letter
    const { data: existing, error: fetchError } = await supabase
      .from('quotes')
      .select('revision_letter')
      .eq('parent_quote_id', parentQuoteId)
      .order('revision_letter', { ascending: false });

    if (fetchError) {
      console.error('Error fetching revisions:', fetchError);
      return { serialNumber: null, quoteId: null, error: fetchError };
    }

    // 2. Determine next letter
    const usedLetters = (existing || [])
      .map(r => r.revision_letter)
      .filter(Boolean)
      .sort();
    const nextLetter = usedLetters.length === 0
      ? 'A'
      : String.fromCharCode(usedLetters[usedLetters.length - 1].charCodeAt(0) + 1);

    const revisionSerial = baseSerialNumber + nextLetter;

    // 3. Insert revision into quotes table
    const { data: quoteData, error: insertError } = await supabase
      .from('quotes')
      .insert({
        serial_number: revisionSerial,
        user_id: userId,
        customer_company: customerCompany,
        tank_location: tankLocation,
        tank_config: tankConfig,
        base_price: basePrice,
        markup_percentage: markupPercentage,
        final_price: finalPrice,
        commission_type: commissionType || null,
        commission_value: commissionValue || 0,
        commission_amount: commissionAmount || 0,
        custom_components: customComponents || [],
        revision_letter: nextLetter,
        parent_quote_id: parentQuoteId,
        version: 1,
        status: 'final'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving revision:', insertError);
      return { serialNumber: null, quoteId: null, error: insertError };
    }

    // 4. Insert audit record into quote_revisions
    await supabase
      .from('quote_revisions')
      .insert({
        quote_id: quoteData.id,
        parent_quote_id: parentQuoteId,
        revision_letter: nextLetter,
        tank_config: tankConfig,
        final_price: finalPrice,
        changes_summary: changesSummary || null,
        created_by: userId
      });

    // 5. Mark parent quote status as 'revised'
    await supabase
      .from('quotes')
      .update({ status: 'revised', updated_at: new Date().toISOString() })
      .eq('id', parentQuoteId);

    console.log(`Revision saved: ${revisionSerial}`);
    return {
      serialNumber: revisionSerial,
      quoteId: quoteData.id,
      error: null
    };

  } catch (err) {
    console.error('Unexpected error saving revision:', err);
    return { serialNumber: null, quoteId: null, error: err };
  }
}

export async function updateQuoteStatus(quoteId, status) {
  try {
    const { error } = await supabase
      .from('quotes')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', quoteId);

    if (error) {
      console.error('Error updating quote status:', error);
      return { success: false, error };
    }

    return { success: true, error: null };

  } catch (err) {
    console.error('Unexpected error updating quote:', err);
    return { success: false, error: err };
  }
}
