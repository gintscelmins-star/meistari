import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServer()

  const { data } = await supabase
    .from('prospects')
    .select('id, vards, uzvards, nodarbosanas, regions, pakalpojumi, darba_laiki, foto_hero, demo_url, demo_slug')
    .eq('anketa_apstiprinata', true)
    .eq('dzesanas_pieprasits', false)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json({ meistari: data ?? [] }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}
