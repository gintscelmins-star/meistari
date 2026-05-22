import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { getSupabaseSSR } from '@/lib/supabase-server'
import { twilioClient } from '@/lib/twilio'
import { rateLimit } from '@/lib/rate-limit'
import type { Database } from '@/lib/database.types'

type ProspectUpdate = Database['public']['Tables']['prospects']['Update']

const SITE_URL = 'https://promeistars.lv'

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  if (!rateLimit(req)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabaseSSR = await getSupabaseSSR()
  const { data: { user } } = await supabaseSSR.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => ({}))

  const supabase = getSupabaseServer()

  const { data: prospect } = await supabase
    .from('prospects')
    .select('id, vards, uzvards, telefons, demo_slug, anketa_aizpildita, anketa_apstiprinata')
    .eq('id', id)
    .single()

  if (!prospect) return NextResponse.json({ error: 'Nav atrasts' }, { status: 404 })
  if (!prospect.anketa_aizpildita) return NextResponse.json({ error: 'Anketa nav aizpildīta' }, { status: 400 })
  if (prospect.anketa_apstiprinata) return NextResponse.json({ error: 'Jau apstiprināts' }, { status: 409 })

  const slug = prospect.demo_slug || slugify(`${prospect.vards}-${prospect.uzvards}`)
  const demoUrl = `${SITE_URL}/meistari/${slug}`

  const now = new Date()
  const trialBeigas = new Date(now)
  trialBeigas.setDate(trialBeigas.getDate() + 14)

  const updateData: ProspectUpdate = {
    demo_slug: slug,
    demo_url: demoUrl,
    anketa_apstiprinata: true,
    lapa_izveidota: true,
    trial_sakums: now.toISOString(),
    trial_beigas: trialBeigas.toISOString(),
    statuss: 'maksatajs',
    updated_at: now.toISOString(),
  }

  if (body.apraksts !== undefined) {
    updateData.apraksts = body.apraksts ? String(body.apraksts).trim() : null
  }

  const { error } = await supabase
    .from('prospects')
    .update(updateData)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await twilioClient.messages.create({
    body: `Sveiks ${prospect.vards}! Tava lapa ir live: ${demoUrl} — 14 dienas bezmaksas!`,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: prospect.telefons,
  }).catch(() => {})

  return NextResponse.json({ ok: true, demo_url: demoUrl, demo_slug: slug })
}
