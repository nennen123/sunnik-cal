// app/lib/userProfile.js
import { supabase } from './supabase';

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('role, display_name, base_price_multiplier')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return {
    role: data.role,
    display_name: data.display_name,
    base_price_multiplier: data.base_price_multiplier,
  };
}
