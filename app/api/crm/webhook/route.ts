import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { twilioClient } from '@/lib/twilio'
import { getSupabaseServer } from '@/lib/supabase'

const TWIML_OK = '<?xml version="1.0"?><Response></Response>'
const SITE_URL = 'https://promeistars.lv'

const JA_REGEX = /^\s*(jā|ja|jaa|yes|ok|labi|piekritu|да|ок|согласен)\s*[!.]*\s*$/i

export async function POST(req: NextRequest) {
  const body = await req.formData()
  const no = body.get('From') as string
  const teksts = body.get('Body') as string

  if (!no || !teksts) {
    return new NextResponse(TWIML_OK, { headers: { 'Content-Type': 'text/xml' } })
  }

  const kanals = no.startsWith('whatsapp:') ? 'whatsapp' : 'sms'
  const talrunis = no.replace('whatsapp:', '')

  const supabase = getSupabaseServer()

  const { data: prospect } = await supabase
    .from('prospects')
    .select('id, vards, uzvards, valoda, anketa_unique_code, telefons, whatsapp')
    .eq('telefons', talrunis)
    .single()

  if (!prospect) {
    return new NextResponse(TWIML_OK, { headers: { 'Content-Type': 'text/xml' } })
  }

  await supabase.from('zinojumi').insert({
    prospect_id: prospect.id,
    kanals,
    virziens: 'in',
    teksts,
    statuss: 'nosutits',
  })

  await supabase
    .from('prospects')
    .update({ statuss: 'atbildeja', pedeja_kontakts: new Date().toISOString() })
    .eq('id', prospect.id)

  const adminWa = process.env.ADMIN_WHATSAPP
  const isJa = JA_REGEX.test(teksts.trim())

  if (isJa && !prospect.anketa_unique_code) {
    const anketaCode = crypto.randomUUID()
    const anketaUrl = `${SITE_URL}/anketa/${anketaCode}`

    await supabase
      .from('prospects')
      .update({
        anketa_unique_code: anketaCode,
        statuss: 'anketa_nosutita',
        updated_at: new Date().toISOString(),
      })
      .eq('id', prospect.id)

    const smsTeksts = prospect.valoda === 'ru'
      ? `Отлично! Заполни анкету (займёт 3 мин): ${anketaUrl}`
      : `Lieliski! Aizpildi anketu (3 min): ${anketaUrl}`

    await twilioClient.messages.create({
      body: smsTeksts,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: prospect.telefons,
    }).catch(() => {})

    if (adminWa) {
      await twilioClient.messages.create({
        body: `🎉 JĀ! ${prospect.vards} ${prospect.uzvards} piekrita.\nAnketa: ${anketaUrl}\nTel: ${talrunis}`,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER!}`,
        to: `whatsapp:${adminWa}`,
      }).catch(() => {})
    }
  } else {
    if (adminWa) {
      await twilioClient.messages.create({
        body: `🔔 JAUNA ATBILDE!\n${prospect.vards} ${prospect.uzvards}: "${teksts}"\nTel: ${talrunis}`,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER!}`,
        to: `whatsapp:${adminWa}`,
      }).catch(() => {})
    }
  }

  return new NextResponse(TWIML_OK, { headers: { 'Content-Type': 'text/xml' } })
}
