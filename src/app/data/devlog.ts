import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from '../utils/supabase/info'

export interface DevlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body: string
  cover_image: string | null
  tags: string[]
  published_at: string
  created_at: string
  updated_at: string
}

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  { auth: { persistSession: false } },
)

export async function listPosts(limit = 20): Promise<DevlogPost[]> {
  const { data, error } = await supabase
    .from('devlog_posts')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.warn('Failed to fetch devlog posts:', error.message)
    return []
  }
  return (data as DevlogPost[]) ?? []
}

export async function getPostBySlug(slug: string): Promise<DevlogPost | null> {
  const { data, error } = await supabase
    .from('devlog_posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.warn('Failed to fetch devlog post:', error.message)
    return null
  }
  return (data as DevlogPost) ?? null
}
