import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { getSupabaseSSR } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'

const VALID_SLOTS = ['hero', 'darbs_1', 'darbs_2', 'darbs_3', 'darbs_4', 'profils'] as const
type FotoSlot = (typeof VALID_SLOTS)[number]

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  if (!rateLimit(req)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const supabaseSSR = await getSupabaseSSR()
  const { data: { user } } = await supabaseSSR.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const formData = await req.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })

  const file = formData.get('file') as File | null
  const slot = formData.get('slot') as string | null

  if (!file || !slot) return NextResponse.json({ error: 'Trūkst lauku' }, { status: 400 })
  if (!VALID_SLOTS.includes(slot as FotoSlot)) {
    return NextResponse.json({ error: 'Nederīgs slots' }, { status: 400 })
  }

  const supabase = getSupabaseServer()

  const { data: prospect } = await supabase
    .from('prospects')
    .select('id')
    .eq('id', id)
    .single()
  if (!prospect) return NextResponse.json({ error: 'Nav atrasts' }, { status: 404 })

  const arrayBuffer = await file.arrayBuffer()
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${id}/${slot}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('meistaru-foto')
    .upload(path, new Uint8Array(arrayBuffer), {
      contentType: file.type || 'image/jpeg',
      upsert: true,
    })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: publicData } = supabase.storage.from('meistaru-foto').getPublicUrl(path)
  const url = publicData?.publicUrl
  if (!url) return NextResponse.json({ error: 'Neizdevās iegūt URL' }, { status: 500 })

  // Add cache-bust param so stale browser cache doesn't show old image
  const urlWithBust = `${url}?t=${Date.now()}`

  const colMap: Record<FotoSlot, string> = {
    hero: 'foto_hero', darbs_1: 'foto_darbs_1', darbs_2: 'foto_darbs_2',
    darbs_3: 'foto_darbs_3', darbs_4: 'foto_darbs_4', profils: 'foto_profils',
  }
  const col = colMap[slot as FotoSlot]

  await supabase.from('prospects').update({
    [col]: urlWithBust,
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  return NextResponse.json({ url: urlWithBust })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!rateLimit(req)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const supabaseSSR = await getSupabaseSSR()
  const { data: { user } } = await supabaseSSR.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { slot } = await req.json().catch(() => ({}))

  if (!slot || !VALID_SLOTS.includes(slot as FotoSlot)) {
    return NextResponse.json({ error: 'Nederīgs slots' }, { status: 400 })
  }

  const supabase = getSupabaseServer()
  const colMap: Record<FotoSlot, string> = {
    hero: 'foto_hero', darbs_1: 'foto_darbs_1', darbs_2: 'foto_darbs_2',
    darbs_3: 'foto_darbs_3', darbs_4: 'foto_darbs_4', profils: 'foto_profils',
  }

  await supabase.from('prospects').update({
    [colMap[slot as FotoSlot]]: null,
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  return NextResponse.json({ ok: true })
}
