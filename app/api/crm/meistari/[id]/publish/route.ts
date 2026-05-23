import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { getSupabaseSSR } from '@/lib/supabase-server'
import { rateLimit } from '@/lib/rate-limit'
import { canPublish } from '@/lib/validate-publish'
import { twilioClient } from '@/lib/twilio'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  if (!rateLimit(req)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const supabaseSSR = await getSupabaseSSR()
  const { data: { user } } = await supabaseSSR.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = getSupabaseServer()

  const { data: meistars } = await supabase
    .from('prospects')
    .select('*')
    .eq('id', id)
    .single()

  if (!meistars) return NextResponse.json({ error: 'Nav atrasts' }, { status: 404 })

  const validation = canPublish(meistars)
  if (!validation.valid) {
    return NextResponse.json({ error: 'Nevar publicēt', errors: validation.errors }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('prospects')
    .select('id')
    .eq('demo_slug', meistars.demo_slug!)
    .neq('id', id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: `Slug "${meistars.demo_slug}" jau eksistē` }, { status: 400 })
  }

  const now = new Date().toISOString()
  const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  const pageUrl = `promeistars.lv/meistari/${meistars.demo_slug}`

  const { error: updateError } = await supabase
    .from('prospects')
    .update({
      publiskets: true,
      publiskets_datums: now,
      trial_sakums: now,
      trial_beigas: trialEnd,
      demo_url: pageUrl,
      lapa_izveidota: true,
    })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  const smsUrl = `https://${pageUrl}`
  const smsText = meistars.valoda === 'ru'
    ? `Ваша страница опубликована!\n\n${smsUrl}\n\nПервые 14 дней бесплатно.`
    : `Tava lapa ir publicēta!\n\n${smsUrl}\n\nPirmās 14 dienas bezmaksas.`

  try {
    await twilioClient.messages.create({
      body: smsText,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: meistars.telefons,
    })
  } catch (err) {
    console.error('SMS kļūda:', err)
  }

  try {
    await twilioClient.messages.create({
      body: `📢 JAUNA LAPA PUBLICĒTA!\n\n${meistars.vards} ${meistars.uzvards}\n${smsUrl}\n\nTrial: 14 dienas`,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${process.env.ADMIN_WHATSAPP}`,
    })
  } catch (err) {
    console.error('WA kļūda:', err)
  }

  return NextResponse.json({ success: true, url: smsUrl })
}
