import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { getSupabaseSSR } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'

type Params = { params: Promise<{ id: string }> }

async function getAuthUser() {
  const supabaseSSR = await getSupabaseSSR()
  const { data: { user } } = await supabaseSSR.auth.getUser()
  return user
}

export async function GET(req: NextRequest, { params }: Params) {
  if (!rateLimit(req)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = getSupabaseServer()

  const [{ data: prospect, error }, { data: atsauksmes }] = await Promise.all([
    supabase.from('prospects').select('*').eq('id', id).single(),
    supabase.from('prospect_atsauksmes').select('*').eq('prospect_id', id).order('created_at'),
  ])

  if (error || !prospect) return NextResponse.json({ error: 'Nav atrasts' }, { status: 404 })

  return NextResponse.json({ ...prospect, atsauksmes: atsauksmes ?? [] })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!rateLimit(req)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const supabase = getSupabaseServer()

  // Verify prospect exists
  const { data: existing } = await supabase.from('prospects').select('id').eq('id', id).single()
  if (!existing) return NextResponse.json({ error: 'Nav atrasts' }, { status: 404 })

  // Build update object — only include fields present in body
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = { updated_at: new Date().toISOString() }

  const textFields = [
    'vards', 'uzvards', 'telefons', 'email', 'regions', 'nodarbosanas',
    'apraksts', 'demo_slug', 'hero_virsraksts', 'hero_apaksteksts',
    'meta_title', 'meta_description', 'sia_nosaukums', 'sia_reg',
  ] as const
  for (const f of textFields) {
    if (body[f] !== undefined) update[f] = body[f] ?? null
  }

  if (body.whatsapp !== undefined) {
    if (body.whatsapp) {
      const raw = typeof body.telefons === 'string' ? body.telefons : ''
      update.whatsapp = raw.replace(/\D/g, '') || null
    } else {
      update.whatsapp = null
    }
  }
  if (body.valoda !== undefined && ['lv', 'ru'].includes(body.valoda)) {
    update.valoda = body.valoda
  }
  if (body.pieredze_gadi !== undefined) update.pieredze_gadi = body.pieredze_gadi ? Number(body.pieredze_gadi) : null
  if (body.cena_no !== undefined) update.cena_no = body.cena_no ? Number(body.cena_no) : null
  if (body.cena_lidz !== undefined) update.cena_lidz = body.cena_lidz ? Number(body.cena_lidz) : null
  if (body.sertificets !== undefined) update.sertificets = Boolean(body.sertificets)
  if (body.avarijas_24_7 !== undefined) update.avarijas_24_7 = Boolean(body.avarijas_24_7)
  if (body.featured !== undefined) update.featured = Boolean(body.featured)
  if (body.publiskets !== undefined) update.publiskets = Boolean(body.publiskets)
  if (body.featured_lidz !== undefined) update.featured_lidz = body.featured_lidz || null
  if (body.kategorijas !== undefined) update.kategorijas = body.kategorijas
  if (body.darba_laiki !== undefined) update.darba_laiki = body.darba_laiki
  if (body.pakalpojumi_detail !== undefined) update.pakalpojumi_detail = body.pakalpojumi_detail

  const { error: updateError } = await supabase.from('prospects').update(update).eq('id', id)
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // Sync atsauksmes — replace all if provided
  if (Array.isArray(body.atsauksmes)) {
    await supabase.from('prospect_atsauksmes').delete().eq('prospect_id', id)

    if (body.atsauksmes.length > 0) {
      const rows = body.atsauksmes.map((a: { autors: string; teksts: string; vertejums: number; datums: string }) => ({
        prospect_id: id,
        autors: String(a.autors ?? '').trim(),
        teksts: String(a.teksts ?? '').trim(),
        vertejums: a.vertejums ? Number(a.vertejums) : null,
        datums: a.datums ? String(a.datums).trim() : null,
      })).filter((a: { autors: string; teksts: string }) => a.autors && a.teksts)

      if (rows.length > 0) {
        await supabase.from('prospect_atsauksmes').insert(rows)
      }
    }
  }

  return NextResponse.json({ ok: true })
}
