
import { supabase } from './supabase-client';
import { Organization } from '@/types/auth';

export async function getUserOrganization(userId: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_id', userId)
    .single();

  if (error) {
    console.error('Error fetching organization:', error);
    return null;
  }

  return data;
}

export async function upsertOrganization(organization: Partial<Organization>) {
  const { data, error } = await supabase
    .from('organizations')
    .upsert([organization], {
      onConflict: 'owner_id',
      defaultToNull: false
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting organization:', error);
    throw error;
  }

  return data;
}
