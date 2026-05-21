import { getSupabaseServer } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  if (!rateLimit(req, 10, 3600000)) {
    return NextResponse.json(
      { error: 'Pārāk daudz pieprasījumu' },
      { status: 429 }
    )
  }

  let body: { telefons?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Nepareizs pieprasījuma formāts' }, { status: 400 })
  }

  const { telefons } = body
  if (!telefons) {
    return NextResponse.json({ error: 'Trūkst tālruņa numurs' }, { status: 400 })
  }

  const supabase = getSupabaseServer()

  const { data: prospect, error: findError } = await supabase
    .from('prospects')
    .select('id')
    .eq('telefons', telefons)
    .maybeSingle()

  if (findError) {
    return NextResponse.json({ error: 'Datu bāzes kļūda' }, { status: 500 })
  }

  if (!prospect) {
    return NextResponse.json({ success: true })
  }

  const { error: updateError } = await supabase
    .from('prospects')
    .update({
      vards: 'DZĒSTS',
      uzvards: 'DZĒSTS',
      telefons: 'DZĒSTS',
      ss_url: null,
      piezimes: null,
      dzesanas_pieprasits: true,
      dzesanas_datums: new Date().toISOString(),
    })
    .eq('id', prospect.id)

  if (updateError) {
    return NextResponse.json({ error: 'Neizdevās dzēst datus' }, { status: 500 })
  }

  await supabase
    .from('zinojumi')
    .delete()
    .eq('prospect_id', prospect.id)

  return NextResponse.json({ success: true })
}
