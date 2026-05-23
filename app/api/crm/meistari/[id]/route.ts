import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { getSupabaseSSR } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import type { Database } from '@/lib/database.types'

type ProspectUpdate = Database['public']['Tables']['prospects']['Update']
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function str(v: any): string | null {
  if (v === null || v === undefined || v === '') return null
  return String(v).trim()
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!rateLimit(req)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const supabase = getSupabaseServer()

  const { data: existing } = await supabase.from('prospects').select('id').eq('id', id).single()
  if (!existing) return NextResponse.json({ error: 'Nav atrasts' }, { status: 404 })

  const update: ProspectUpdate = { updated_at: new Date().toISOString() }

  if (body.vards !== undefined)            update.vards            = String(body.vards).trim()
  if (body.uzvards !== undefined)          update.uzvards          = String(body.uzvards).trim()
  if (body.telefons !== undefined)         update.telefons         = String(body.telefons).trim()
  if (body.email !== undefined)            update.email            = str(body.email)
  if (body.regions !== undefined)          update.regions          = str(body.regions)
  if (body.nodarbosanas !== undefined)     update.nodarbosanas     = str(body.nodarbosanas)
  if (body.apraksts !== undefined)         update.apraksts         = str(body.apraksts)
  if (body.demo_slug !== undefined)        update.demo_slug        = str(body.demo_slug)
  if (body.hero_virsraksts !== undefined)  update.hero_virsraksts  = str(body.hero_virsraksts)
  if (body.hero_apaksteksts !== undefined) update.hero_apaksteksts = str(body.hero_apaksteksts)
  if (body.meta_title !== undefined)       update.meta_title       = str(body.meta_title)
  if (body.meta_description !== undefined) update.meta_description = str(body.meta_description)
  if (body.sia_nosaukums !== undefined)    update.sia_nosaukums    = str(body.sia_nosaukums)
  if (body.sia_reg !== undefined)          update.sia_reg          = str(body.sia_reg)

  if (body.whatsapp !== undefined) {
    update.whatsapp = body.whatsapp
      ? (typeof body.telefons === 'string' ? body.telefons : '').replace(/\D/g, '') || null
      : null
  }

  if (body.valoda !== undefined && ['lv', 'ru'].includes(body.valoda)) {
    update.valoda = body.valoda
  }

  if (body.pieredze_gadi !== undefined)
    update.pieredze_gadi = body.pieredze_gadi ? Number(body.pieredze_gadi) : null
  if (body.cena_no !== undefined)
    update.cena_no = body.cena_no ? Number(body.cena_no) : null
  if (body.cena_lidz !== undefined)
    update.cena_lidz = body.cena_lidz ? Number(body.cena_lidz) : null

  if (body.sertificets !== undefined)    update.sertificets    = Boolean(body.sertificets)
  if (body.avarijas_24_7 !== undefined)  update.avarijas_24_7  = Boolean(body.avarijas_24_7)
  if (body.featured !== undefined)       update.featured       = Boolean(body.featured)
  if (body.publiskets !== undefined)     update.publiskets     = Boolean(body.publiskets)

  if (body.featured_lidz !== undefined)
    update.featured_lidz = body.featured_lidz || null
  if (body.kategorijas !== undefined)
    update.kategorijas = Array.isArray(body.kategorijas) ? body.kategorijas : null
  if (body.darba_laiki !== undefined)
    update.darba_laiki = body.darba_laiki ?? null
  if (body.pakalpojumi_detail !== undefined)
    update.pakalpojumi_detail = body.pakalpojumi_detail ?? null

  const { error: updateError } = await supabase.from('prospects').update(update).eq('id', id)
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // Atsauksmes — batch replace
  if (Array.isArray(body.atsauksmes)) {
    await supabase.from('prospect_atsauksmes').delete().eq('prospect_id', id)

    if (body.atsauksmes.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = (body.atsauksmes as any[])
        .map(a => ({
          prospect_id: id,
          autors: String(a.autors ?? '').trim(),
          teksts: String(a.teksts ?? '').trim(),
          vertejums: a.vertejums ? Number(a.vertejums) : null,
          datums: a.datums ? String(a.datums).trim() : null,
        }))
        .filter(a => a.autors && a.teksts)

      if (rows.length > 0) {
        await supabase.from('prospect_atsauksmes').insert(rows)
      }
    }
  }

  return NextResponse.json({ ok: true })
}
