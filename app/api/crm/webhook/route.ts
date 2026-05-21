import { NextRequest, NextResponse } from 'next/server'
import { twilioClient } from '@/lib/twilio'
import { getSupabaseServer } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.formData()
  const no = body.get('From') as string
  const teksts = body.get('Body') as string

  if (!no || !teksts) {
    return new NextResponse(
      '<?xml version="1.0"?><Response></Response>',
      { headers: { 'Content-Type': 'text/xml' } }
    )
  }

  const kanals = no.startsWith('whatsapp:') ? 'whatsapp' : 'sms'
  const talrunis = no.replace('whatsapp:', '')

  const supabase = getSupabaseServer()

  const { data: prospect } = await supabase
    .from('prospects')
    .select('*')
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

    const atbilde = teksts.toLowerCase()
    const pozitivaAtbilde =
      atbilde.includes('jā') ||
      atbilde.includes('ja') ||
      atbilde.includes('да') ||
      atbilde.includes('interesē') ||
      atbilde.includes('интересно')

    if (pozitivaAtbilde) {
      await supabase
        .from('prospects')
        .update({ statuss: 'atbildeja', pedeja_kontakts: new Date().toISOString() })
        .eq('id', prospect.id)
    } else {
      await supabase
        .from('prospects')
        .update({ pedeja_kontakts: new Date().toISOString() })
        .eq('id', prospect.id)
    }

    const adminWa = process.env.ADMIN_WHATSAPP
    if (adminWa) {
      await twilioClient.messages.create({
        body: `🔔 JAUNA ATBILDE!\n${prospect.vards} ${prospect.uzvards}: "${teksts}"\nTel: ${talrunis}`,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER!}`,
        to: `whatsapp:${adminWa}`,
      }).catch(() => {})
    }
  }

  return new NextResponse(
    '<?xml version="1.0"?><Response></Response>',
    { headers: { 'Content-Type': 'text/xml' } }
  )
}
