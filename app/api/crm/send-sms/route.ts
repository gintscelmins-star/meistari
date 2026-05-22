import { NextRequest, NextResponse } from 'next/server'
import { twilioClient, SMS_TEKSTI } from '@/lib/twilio'
import { getSupabaseServer } from '@/lib/supabase'
import { getSupabaseSSR } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  if (!rateLimit(req, 20, 60000)) {
    return NextResponse.json({ error: 'Rate limit' }, { status: 429 })
  }

  const supabaseSSR = await getSupabaseSSR()
  const { data: { user } } = await supabaseSSR.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body?.prospect_id) {
    return NextResponse.json({ error: 'prospect_id obligāts' }, { status: 400 })
  }

  const supabase = getSupabaseServer()

  const { data: p } = await supabase
    .from('prospects')
    .select('*')
    .eq('id', body.prospect_id)
    .single()

  if (!p) return NextResponse.json({ error: 'Nav atrasts' }, { status: 404 })

  const valoda = (p.valoda === 'ru' ? 'RU' : 'LV') as 'LV' | 'RU'
  const defaultTeksts = SMS_TEKSTI[valoda].pirmais(
    p.vards,
    p.demo_url ?? 'promeistars.lv'
  )
  const teksts: string = body.custom_teksts?.trim() || defaultTeksts

  try {
    const msg = await twilioClient.messages.create({
      body: teksts,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: p.telefons,
    })

    await supabase.from('zinojumi').insert({
      prospect_id: p.id,
      kanals: 'sms',
      virziens: 'out',
      teksts,
      statuss: 'nosutits',
    })

    await supabase
      .from('prospects')
      .update({
        statuss: 'nosutits',
        pedeja_kontakts: new Date().toISOString(),
      })
      .eq('id', p.id)

    return NextResponse.json({ success: true, sid: msg.sid })
  } catch {
    return NextResponse.json({ error: 'Twilio kļūda' }, { status: 500 })
  }
}
