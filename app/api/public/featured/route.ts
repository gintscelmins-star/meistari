import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'

export const revalidate = 60

export async function GET() {
  const supabase = getSupabaseServer()

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('prospects')
    .select('id, vards, uzvards, nodarbosanas, kategorijas, regions, demo_url, demo_slug, foto_hero, foto_profils, featured_prioritate')
    .eq('publiskets', true)
    .eq('featured', true)
    .eq('dzesanas_pieprasits', false)
    .or(`featured_sakums.is.null,featured_sakums.lte.${now}`)
    .or(`featured_lidz.is.null,featured_lidz.gte.${now}`)
    .order('featured_prioritate', { ascending: false })
    .limit(5)

  if (error) {
    return NextResponse.json({ featured: [] })
  }

  return NextResponse.json(
    { featured: data ?? [] },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' } }
  )
}
