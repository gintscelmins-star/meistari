import { getSupabaseServer } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function err(step: string, detail: unknown, status: number, msg: string) {
  console.error(JSON.stringify({ step, detail: String(detail), status }))
  return NextResponse.json({ error: msg, debug: `${step}: ${String(detail)}` }, { status })
}

export async function POST(request: NextRequest) {
  // 1. Parse body
  let body: {
    vards: string; uzvards: string; epasts: string; parole: string
    specialitate: string; telefons: string; pilseta?: string
    pieredze_gadi?: string; darba_tipi_ids: string[]; regioni_ids: string[]
  }

  try {
    body = await request.json()
  } catch (e) {
    return err('parse_body', e, 400, 'Nepareizs pieprasījuma formāts')
  }

  const { vards, uzvards, epasts, parole, specialitate, telefons, pilseta, pieredze_gadi, darba_tipi_ids, regioni_ids } = body

  // 2. Validate required fields
  const missing = ['vards', 'uzvards', 'epasts', 'parole', 'specialitate', 'telefons']
    .filter(f => !body[f as keyof typeof body])
  if (missing.length > 0) {
    return err('validation', `missing: ${missing.join(',')}`, 400, `Trūkst: ${missing.join(', ')}`)
  }

  // 3. Check env
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_KEY
  const supabase = getSupabaseServer()

  // 4. Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: epasts,
    password: parole,
    email_confirm: true,
  })

  if (authError || !authData?.user) {
    return err('auth_create', `hasServiceKey=${hasServiceKey} err=${authError?.message} status=${(authError as {status?:number}|null)?.status}`, 400, authError?.message ?? 'Neizdevās izveidot kontu')
  }

  const userId = authData.user.id

  // 5. Generate unique slug
  const baseSlug = slugify(`${vards}-${uzvards}`)
  let slug = baseSlug
  let attempt = 0
  while (true) {
    const { data: existing } = await supabase.from('meistari').select('id').eq('slug', slug).maybeSingle()
    if (!existing) break
    slug = `${baseSlug}-${++attempt}`
  }

  // 6. Insert meistars record
  const { data: meistars, error: meistarsError } = await supabase
    .from('meistari')
    .insert({ vards, uzvards, specialitate, telefons, pilseta: pilseta || null, pieredze_gadi: pieredze_gadi ? parseInt(pieredze_gadi) : 0, slug, aktīvs: false, user_id: userId })
    .select()
    .single()

  if (meistarsError || !meistars) {
    await supabase.auth.admin.deleteUser(userId)
    return err('insert_meistars', meistarsError?.message, 500, 'Neizdevās izveidot profilu')
  }

  // 7. Link work types
  if (Array.isArray(darba_tipi_ids) && darba_tipi_ids.length > 0) {
    const { error: dtErr } = await supabase.from('meistars_darba_tipi').insert(
      darba_tipi_ids.map(id => ({ meistars_id: meistars.id, darba_tips_id: id }))
    )
    if (dtErr) console.error(JSON.stringify({ step: 'darba_tipi', detail: dtErr.message }))
  }

  // 8. Link regions
  if (Array.isArray(regioni_ids) && regioni_ids.length > 0) {
    const { error: regErr } = await supabase.from('meistars_regioni').insert(
      regioni_ids.map(id => ({ meistars_id: meistars.id, regions_id: id }))
    )
    if (regErr) console.error(JSON.stringify({ step: 'regioni', detail: regErr.message }))
  }

  console.error(JSON.stringify({ step: 'success', userId, meistarId: meistars.id }))
  return NextResponse.json({ success: true }, { status: 201 })
}
