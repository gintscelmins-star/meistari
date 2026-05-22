import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  if (!rateLimit(req)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const supabase = getSupabaseServer()

  const { data } = await supabase
    .from('prospects')
    .select('id, vards, uzvards, telefons, nodarbosanas, regions, anketa_aizpildita, dzesanas_pieprasits')
    .eq('anketa_unique_code', code)
    .single()

  if (!data || data.dzesanas_pieprasits) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  if (data.anketa_aizpildita) {
    return NextResponse.json({ error: 'already_filled' }, { status: 200 })
  }

  return NextResponse.json({
    id: data.id,
    vards: data.vards,
    uzvards: data.uzvards,
    telefons: data.telefons,
    nodarbosanas: data.nodarbosanas,
    regions: data.regions,
  })
}
