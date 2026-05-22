import { NextRequest, NextResponse } from 'next/server'
import { twilioClient } from '@/lib/twilio'
import { getSupabaseServer } from '@/lib/supabase'

const TWIML_OK = '<?xml version="1.0"?><Response></Response>'

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
    .select('id, vards, uzvards')
    .eq('telefons', talrunis)
    .single()

  if (prospect) {
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
