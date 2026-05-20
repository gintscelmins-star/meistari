import { getSupabaseServer } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('[register] POST started')

  try {
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch (parseErr) {
      console.error('[register] Failed to parse request body:', parseErr)
      return NextResponse.json({ error: 'Nepareizs pieprasījuma formāts' }, { status: 400 })
    }

    const {
      vards, uzvards, epasts, parole, specialitate,
      telefons, pilseta, pieredze_gadi,
      darba_tipi_ids, regioni_ids,
    } = body as Record<string, string | string[]>

    console.log('[register] Fields received:', {
      vards: !!vards,
      uzvards: !!uzvards,
      epasts: !!epasts,
      parole: parole ? `${String(parole).length} chars` : 'missing',
      specialitate: !!specialitate,
      telefons: !!telefons,
    })

    if (!vards || !uzvards || !epasts || !parole || !specialitate || !telefons) {
      const missing = ['vards', 'uzvards', 'epasts', 'parole', 'specialitate', 'telefons']
        .filter(f => !body[f])
      console.error('[register] Missing required fields:', missing)
      return NextResponse.json({ error: `Trūkst obligātie lauki: ${missing.join(', ')}` }, { status: 400 })
    }

    const serviceKeyPresent = !!process.env.SUPABASE_SERVICE_KEY
    const supabaseUrlPresent = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    console.log('[register] Env check — SUPABASE_SERVICE_KEY:', serviceKeyPresent, '| SUPABASE_URL:', supabaseUrlPresent)

    const supabase = getSupabaseServer()

    // 1. Izveido Auth lietotāju
    console.log('[register] Calling auth.admin.createUser for:', epasts)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: String(epasts),
      password: String(parole),
      email_confirm: true,
    })

    if (authError || !authData?.user) {
      console.error('[register] auth.admin.createUser failed:', {
        errorMessage: authError?.message,
        errorStatus: (authError as { status?: number } | null)?.status,
        hasUser: !!authData?.user,
      })
      const msg = authError?.message ?? 'Neizdevās izveidot kontu'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    console.log('[register] Auth user created:', authData.user.id)

    // 2. Ģenerē unikālu slug
    const baseSlug = slugify(`${vards}-${uzvards}`)
    let slug = baseSlug
    let attempt = 0

    while (true) {
      const { data: existing } = await supabase
        .from('meistari')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (!existing) break
      attempt++
      slug = `${baseSlug}-${attempt}`
    }

    console.log('[register] Slug generated:', slug)

    // 3. Izveido meistari ierakstu
    const { data: meistars, error: meistarsError } = await supabase
      .from('meistari')
      .insert({
        vards,
        uzvards,
        specialitate,
        telefons,
        pilseta: pilseta || null,
        pieredze_gadi: pieredze_gadi ? parseInt(String(pieredze_gadi)) : 0,
        slug,
        aktīvs: false,
        user_id: authData.user.id,
      })
      .select()
      .single()

    if (meistarsError || !meistars) {
      console.error('[register] meistari INSERT failed:', meistarsError?.message, meistarsError?.code)
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: 'Neizdevās izveidot profilu' }, { status: 500 })
    }

    console.log('[register] Meistars record created:', meistars.id)

    // 4. Izveido darba_tipi saites
    if (Array.isArray(darba_tipi_ids) && darba_tipi_ids.length > 0) {
      const { error: dtErr } = await supabase.from('meistars_darba_tipi').insert(
        darba_tipi_ids.map((id: string) => ({
          meistars_id: meistars.id,
          darba_tips_id: id,
        }))
      )
      if (dtErr) console.error('[register] darba_tipi insert error:', dtErr.message)
    }

    // 5. Izveido regioni saites
    if (Array.isArray(regioni_ids) && regioni_ids.length > 0) {
      const { error: regErr } = await supabase.from('meistars_regioni').insert(
        regioni_ids.map((id: string) => ({
          meistars_id: meistars.id,
          regions_id: id,
        }))
      )
      if (regErr) console.error('[register] regioni insert error:', regErr.message)
    }

    console.log('[register] Registration complete for:', epasts)
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[register] Unhandled exception:', err)
    return NextResponse.json({ error: 'Iekšēja servera kļūda' }, { status: 500 })
  }
}
