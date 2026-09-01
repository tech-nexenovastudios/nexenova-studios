import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from '../utils/supabase/info'

export interface CareerPosting {
  id: string
  slug: string
  title: string
  location: string | null
  employment_type: string | null
  short_summary: string | null
  description: string
  apply_email: string | null
  posted_at: string
  closed_at: string | null
  created_at: string
  updated_at: string
}

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  { auth: { persistSession: false } },
)

/**
 * Placeholder postings that seeded the careers table. They are filtered here
 * rather than deleted, because the only delete path available from the client
 * is an anon key that should not have write access at all (see the RLS note in
 * the handover). Remove the rows with the service role, then drop these slugs.
 */
const PLACEHOLDER_ROLES = new Set(['game-mathematician', 'senior-2d-animator'])

export async function listOpenRoles(): Promise<CareerPosting[]> {
  const { data, error } = await supabase
    .from('careers')
    .select('*')
    .order('posted_at', { ascending: false })

  if (error) {
    console.warn('Failed to fetch careers:', error.message)
    return []
  }
  return ((data as CareerPosting[]) ?? []).filter(
    r => !PLACEHOLDER_ROLES.has(r.slug) && !r.closed_at,
  )
}

export async function getRoleBySlug(slug: string): Promise<CareerPosting | null> {
  if (PLACEHOLDER_ROLES.has(slug)) return null

  const { data, error } = await supabase
    .from('careers')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.warn('Failed to fetch career:', error.message)
    return null
  }
  return (data as CareerPosting) ?? null
}
