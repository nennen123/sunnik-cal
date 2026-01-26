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
  finalPrice
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
