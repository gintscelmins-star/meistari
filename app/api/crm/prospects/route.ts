import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { getSupabaseSSR } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'

const VALID_STATUSI = ['jauns', 'nosutits', 'atbildeja', 'demo_nosutits', 'maksatajs', 'atteicas']

export async function GET(req: NextRequest) {
  if (!rateLimit(req)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabaseSSR = await getSupabaseSSR()
  const { data: { user } } = await supabaseSSR.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(0, parseInt(searchParams.get('page') ?? '0'))
  const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') ?? '50'))
  const statuss = searchParams.get('statuss')

  const supabase = getSupabaseServer()

  let query = supabase
    .from('prospects')
    .select('id, vards, uzvards, telefons, whatsapp, valoda, statuss, regions, demo_url, piezimes, created_at', { count: 'exact' })
    .eq('dzesanas_pieprasits', false)
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (statuss && VALID_STATUSI.includes(statuss)) {
    query = query.eq('statuss', statuss)
  }

  const { data: prospects, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const statsQuery = await supabase
    .from('prospects')
    .select('statuss')
    .eq('dzesanas_pieprasits', false)

  const statsRaw = statsQuery.data ?? []
  const stats = {
    total: statsRaw.length,
    jauns: statsRaw.filter(r => r.statuss === 'jauns').length,
    nosutits: statsRaw.filter(r => r.statuss === 'nosutits').length,
    atbildeja: statsRaw.filter(r => r.statuss === 'atbildeja').length,
    demo_nosutits: statsRaw.filter(r => r.statuss === 'demo_nosutits').length,
    maksatajs: statsRaw.filter(r => r.statuss === 'maksatajs').length,
    atteicas: statsRaw.filter(r => r.statuss === 'atteicas').length,
  }

  return NextResponse.json({ prospects: prospects ?? [], total: count ?? 0, stats })
}

export async function POST(req: NextRequest) {
  if (!rateLimit(req)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabaseSSR = await getSupabaseSSR()
  const { data: { user } } = await supabaseSSR.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const supabase = getSupabaseServer()

  if (Array.isArray(body)) {
    const rows = body.map(r => ({
      vards: String(r.vards ?? '').trim(),
      uzvards: String(r.uzvards ?? '').trim(),
      telefons: String(r.telefons ?? '').trim(),
      whatsapp: r.whatsapp ?? null,
      valoda: ['lv', 'ru'].includes(r.valoda) ? r.valoda : 'lv',
      regions: r.regions ?? null,
      piezimes: r.piezimes ?? null,
      demo_slug: r.demo_slug ?? null,
      statuss: 'jauns',
      gdpr_piekrits: false,
    })).filter(r => r.vards && r.telefons)

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Nav derīgu ierakstu' }, { status: 400 })
    }

    const { error } = await supabase.from('prospects').insert(rows)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ inserted: rows.length }, { status: 201 })
  }

  const { vards, uzvards, telefons } = body
  if (!vards || !uzvards || !telefons) {
    return NextResponse.json({ error: 'Obligātie lauki: vards, uzvards, telefons' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('prospects')
    .insert({
      vards: String(vards).trim(),
      uzvards: String(uzvards).trim(),
      telefons: String(telefons).trim(),
      whatsapp: body.whatsapp ?? null,
      valoda: ['lv', 'ru'].includes(body.valoda) ? body.valoda : 'lv',
      regions: body.regions ?? null,
      piezimes: body.piezimes ?? null,
      demo_slug: body.demo_slug ?? null,
      statuss: 'jauns',
      gdpr_piekrits: body.gdpr_piekrits ?? false,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: data.id }, { status: 201 })
}
