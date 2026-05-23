import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { getSupabaseSSR } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import type { Database } from '@/lib/database.types'

const VALID_SLOTS = ['hero', 'darbs_1', 'darbs_2', 'darbs_3', 'darbs_4', 'profils'] as const
type FotoSlot = (typeof VALID_SLOTS)[number]
type ProspectUpdate = Database['public']['Tables']['prospects']['Update']

type Params = { params: Promise<{ id: string }> }

function buildFotoUpdate(slot: FotoSlot, url: string | null): ProspectUpdate {
  const ts = new Date().toISOString()
  if (slot === 'hero')    return { updated_at: ts, foto_hero: url }
  if (slot === 'darbs_1') return { updated_at: ts, foto_darbs_1: url }
  if (slot === 'darbs_2') return { updated_at: ts, foto_darbs_2: url }
  if (slot === 'darbs_3') return { updated_at: ts, foto_darbs_3: url }
  if (slot === 'darbs_4') return { updated_at: ts, foto_darbs_4: url }
  return { updated_at: ts, foto_profils: url }
}

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

  const urlWithBust = `${url}?t=${Date.now()}`

  await supabase.from('prospects')
    .update(buildFotoUpdate(slot as FotoSlot, urlWithBust))
    .eq('id', id)

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

  await supabase.from('prospects')
    .update(buildFotoUpdate(slot as FotoSlot, null))
    .eq('id', id)

  return NextResponse.json({ ok: true })
}
