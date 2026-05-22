import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { getSupabaseSSR } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import type { Database } from '@/lib/database.types'

const VALID_STATUSI = ['jauns', 'nosutits', 'atbildeja', 'anketa_nosutita', 'gaida_apstiprinasanu', 'demo_nosutits', 'maksatajs', 'atteicas']

type ProspectUpdate = Database['public']['Tables']['prospects']['Update']
type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  if (!rateLimit(req)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabaseSSR = await getSupabaseSSR()
  const { data: { user } } = await supabaseSSR.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from('prospects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Nav atrasts' }, { status: 404 })

  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!rateLimit(req)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabaseSSR = await getSupabaseSSR()
  const { data: { user } } = await supabaseSSR.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const update: ProspectUpdate = { updated_at: new Date().toISOString() }

  if (body.statuss !== undefined) {
    if (!VALID_STATUSI.includes(body.statuss)) {
      return NextResponse.json({ error: 'Nederīgs statuss' }, { status: 400 })
    }
    update.statuss = body.statuss
    update.pedeja_kontakts = new Date().toISOString()
  }

  if (body.vards !== undefined) update.vards = String(body.vards).trim()
  if (body.uzvards !== undefined) update.uzvards = String(body.uzvards).trim()
  if (body.telefons !== undefined) update.telefons = String(body.telefons).trim()
  if (body.whatsapp !== undefined) update.whatsapp = body.whatsapp
  if (body.valoda !== undefined && ['lv', 'ru'].includes(body.valoda)) update.valoda = body.valoda
  if (body.nodarbosanas !== undefined && ['santehnikis', 'elektrikis'].includes(body.nodarbosanas)) update.nodarbosanas = body.nodarbosanas
  if (body.regions !== undefined) update.regions = body.regions
  if (body.ss_url !== undefined) update.ss_url = body.ss_url
  if (body.piezimes !== undefined) update.piezimes = body.piezimes
  if (body.apraksts !== undefined) update.apraksts = body.apraksts
  if (body.demo_slug !== undefined) update.demo_slug = body.demo_slug
  if (body.demo_url !== undefined) update.demo_url = body.demo_url

  const supabase = getSupabaseServer()
  const { error } = await supabase
    .from('prospects')
    .update(update)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!rateLimit(req)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabaseSSR = await getSupabaseSSR()
  const { data: { user } } = await supabaseSSR.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = getSupabaseServer()

  await supabase
    .from('zinojumi')
    .delete()
    .eq('prospect_id', id)

  const { error } = await supabase
    .from('prospects')
    .update({
      vards: 'DZĒSTS',
      uzvards: 'DZĒSTS',
      telefons: 'DZĒSTS',
      whatsapp: null,
      piezimes: null,
      ss_url: null,
      demo_slug: null,
      demo_url: null,
      dzesanas_pieprasits: true,
      dzesanas_datums: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
