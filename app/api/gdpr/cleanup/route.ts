import { getSupabaseServer } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = getSupabaseServer()

  const twoYearsAgo = new Date()
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

  const { data: old, error: findError } = await supabase
    .from('prospects')
    .select('id')
    .lt('updated_at', twoYearsAgo.toISOString())
    .eq('dzesanas_pieprasits', false)

  if (findError) {
    return NextResponse.json({ error: 'Kļūda meklējot', detail: findError.message }, { status: 500 })
  }

  const ids = (old ?? []).map(r => r.id)

  if (ids.length === 0) {
    return NextResponse.json({ success: true, cleaned: 0 })
  }

  await supabase.from('zinojumi').delete().in('prospect_id', ids)

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
    .in('id', ids)

  if (updateError) {
    return NextResponse.json({ error: 'Kļūda dzēšot', detail: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, cleaned: ids.length })
}
