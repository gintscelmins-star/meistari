import { NextRequest, NextResponse } from 'next/server'
import { twilioClient } from '@/lib/twilio'
import { SMS_TEKSTI } from '@/lib/sms-teksti'
import { getSupabaseServer } from '@/lib/supabase'
import { createMeistaraLapa } from '@/lib/create-meistars-page'

const TWIML_OK = '<?xml version="1.0"?><Response></Response>'

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
    .select('id, vards, uzvards, valoda, lapa_izveidota, telefons, whatsapp')
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
    .update({
      statuss: 'atbildeja',
      pedeja_kontakts: new Date().toISOString(),
    })
    .eq('id', prospect.id)

  const adminWa = process.env.ADMIN_WHATSAPP
  const isJa = JA_REGEX.test(teksts.trim())

  if (isJa && !prospect.lapa_izveidota) {
    const demoUrl = await createMeistaraLapa(prospect.id)

    if (demoUrl) {
      const valoda = (prospect.valoda === 'ru' ? 'RU' : 'LV') as 'LV' | 'RU'
      const smsTeksts = SMS_TEKSTI[valoda].demo_gatavs(prospect.vards, demoUrl)

      const sendTo = kanals === 'whatsapp' && prospect.whatsapp
        ? `whatsapp:${prospect.whatsapp.replace(/\D/g, '')}`
        : prospect.telefons

      await twilioClient.messages.create({
        body: smsTeksts,
        from: kanals === 'whatsapp'
          ? `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER!}`
          : process.env.TWILIO_PHONE_NUMBER!,
        to: sendTo,
      }).catch(() => {})

      if (adminWa) {
        await twilioClient.messages.create({
          body: `🎉 JĀ! ${prospect.vards} ${prospect.uzvards} piekrita demo.\nLapa: ${demoUrl}\nTel: ${talrunis}`,
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER!}`,
          to: `whatsapp:${adminWa}`,
        }).catch(() => {})
      }
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
