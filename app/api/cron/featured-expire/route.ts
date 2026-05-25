import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { twilioClient } from '@/lib/twilio'

export async function GET() {
  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from('prospects')
    .update({ featured: false })
    .lt('featured_lidz', new Date().toISOString())
    .eq('featured', true)
    .select('id, vards, telefons, valoda')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const results = await Promise.allSettled(
    (data ?? []).map(m =>
      twilioClient.messages.create({
        body: m.valoda === 'ru'
          ? `Твой Featured период завершился. Продлить за €10/нед — ProMeistars`
          : `Featured periods beidzies. Pagarināt par €10/ned — ProMeistars`,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: m.telefons,
      })
    )
  )

  const smsOk = results.filter(r => r.status === 'fulfilled').length

  return NextResponse.json({ deactivated: data?.length ?? 0, sms_sent: smsOk })
}
