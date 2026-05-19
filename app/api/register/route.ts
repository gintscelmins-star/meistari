import { getSupabaseServer } from '@/lib/supabase'
import { slugify } from '@/lib/slugify'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      vards, uzvards, epasts, parole, specialitate,
      telefons, pilseta, pieredze_gadi,
      darba_tipi_ids, regioni_ids,
    } = body

    if (!vards || !uzvards || !epasts || !parole || !specialitate || !telefons) {
      return Response.json({ error: 'Trūkst obligātie lauki' }, { status: 400 })
    }

    const supabase = getSupabaseServer()

    // 1. Izveido Auth lietotāju
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: epasts,
      password: parole,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      const msg = authError?.message ?? 'Neizdevās izveidot kontu'
      return Response.json({ error: msg }, { status: 400 })
    }

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

    // 3. Izveido meistari ierakstu
    const { data: meistars, error: meistarsError } = await supabase
      .from('meistari')
      .insert({
        vards,
        uzvards,
        specialitate,
        telefons,
        pilseta: pilseta || null,
        pieredze_gadi: pieredze_gadi ? parseInt(pieredze_gadi) : 0,
        slug,
        aktīvs: false,
        user_id: authData.user.id,
      })
      .select()
      .single()

    if (meistarsError || !meistars) {
      // Atsauc Auth lietotāju ja DB insert neizdevās
      await supabase.auth.admin.deleteUser(authData.user.id)
      return Response.json({ error: 'Neizdevās izveidot profilu' }, { status: 500 })
    }

    // 4. Izveido darba_tipi saites
    if (Array.isArray(darba_tipi_ids) && darba_tipi_ids.length > 0) {
      await supabase.from('meistars_darba_tipi').insert(
        darba_tipi_ids.map((id: string) => ({
          meistars_id: meistars.id,
          darba_tips_id: id,
        }))
      )
    }

    // 5. Izveido regioni saites
    if (Array.isArray(regioni_ids) && regioni_ids.length > 0) {
      await supabase.from('meistars_regioni').insert(
        regioni_ids.map((id: string) => ({
          meistars_id: meistars.id,
          regions_id: id,
        }))
      )
    }

    return Response.json({ success: true }, { status: 201 })
  } catch {
    return Response.json({ error: 'Iekšēja servera kļūda' }, { status: 500 })
  }
}
