import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'
import type { Database } from '@/lib/database.types'

type ProspectUpdate = Database['public']['Tables']['prospects']['Update']

const VALID_TIPS = ['hero', 'darbs_1', 'darbs_2', 'darbs_3', 'darbs_4', 'profils'] as const
type FotoTips = (typeof VALID_TIPS)[number]

export async function POST(req: NextRequest) {
  if (!rateLimit(req)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const formData = await req.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })

  const file = formData.get('file') as File | null
  const anketaCode = formData.get('anketa_code') as string | null
  const fotoTips = formData.get('foto_tips') as string | null

  if (!file || !anketaCode || !fotoTips) {
    return NextResponse.json({ error: 'Trūkst lauku' }, { status: 400 })
  }

  if (!VALID_TIPS.includes(fotoTips as FotoTips)) {
    return NextResponse.json({ error: 'Nederīgs foto_tips' }, { status: 400 })
  }

  const supabase = getSupabaseServer()

  const { data: prospect } = await supabase
    .from('prospects')
    .select('id, anketa_aizpildita, dzesanas_pieprasits')
    .eq('anketa_unique_code', anketaCode)
    .single()

  if (!prospect || prospect.dzesanas_pieprasits || prospect.anketa_aizpildita) {
    return NextResponse.json({ error: 'Nav atļauts' }, { status: 403 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const fileBytes = new Uint8Array(arrayBuffer)
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${prospect.id}/${fotoTips}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('meistaru-foto')
    .upload(path, fileBytes, {
      contentType: file.type || 'image/jpeg',
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: publicData } = supabase.storage
    .from('meistaru-foto')
    .getPublicUrl(path)

  const url = publicData?.publicUrl
  if (typeof url !== 'string' || !url) {
    return NextResponse.json({ error: 'Neizdevās iegūt foto URL' }, { status: 500 })
  }

  const fotoUpdate: ProspectUpdate = { updated_at: new Date().toISOString() }
  if (fotoTips === 'hero') fotoUpdate.foto_hero = url
  else if (fotoTips === 'darbs_1') fotoUpdate.foto_darbs_1 = url
  else if (fotoTips === 'darbs_2') fotoUpdate.foto_darbs_2 = url
  else if (fotoTips === 'darbs_3') fotoUpdate.foto_darbs_3 = url
  else if (fotoTips === 'darbs_4') fotoUpdate.foto_darbs_4 = url
  else if (fotoTips === 'profils') fotoUpdate.foto_profils = url

  await supabase
    .from('prospects')
    .update(fotoUpdate)
    .eq('id', prospect.id)

  return NextResponse.json({ url })
}
