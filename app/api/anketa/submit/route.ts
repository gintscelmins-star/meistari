import { NextRequest, NextResponse } from 'next/server'
import { twilioClient } from '@/lib/twilio'
import { getSupabaseServer } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  if (!rateLimit(req)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })

  const { anketa_code, vards, uzvards, email, specialitate, regioni, pakalpojumi, apraksts, darba_laiki } = body

  if (!anketa_code || !vards || !uzvards || !email) {
    return NextResponse.json({ error: 'Obligātie lauki trūkst' }, { status: 400 })
  }

  const supabase = getSupabaseServer()

  const { data: prospect } = await supabase
    .from('prospects')
    .select('id, vards, uzvards, anketa_aizpildita, dzesanas_pieprasits')
    .eq('anketa_unique_code', anketa_code)
    .single()

  if (!prospect || prospect.dzesanas_pieprasits) {
    return NextResponse.json({ error: 'Nav atrasts' }, { status: 404 })
  }

  if (prospect.anketa_aizpildita) {
    return NextResponse.json({ error: 'Jau aizpildīta' }, { status: 409 })
  }

  const { error } = await supabase
    .from('prospects')
    .update({
      vards: String(vards).trim(),
      uzvards: String(uzvards).trim(),
      email: String(email).trim(),
      nodarbosanas: specialitate === 'Elektriķis' ? 'elektrikis' : 'santehnikis',
      regions: Array.isArray(regioni) ? regioni.join(', ') : null,
      pakalpojumi: Array.isArray(pakalpojumi) ? pakalpojumi : null,
      apraksts: apraksts ? String(apraksts).trim() : null,
      darba_laiki: darba_laiki ?? null,
      anketa_aizpildita: true,
      statuss: 'gaida_apstiprinasanu',
      updated_at: new Date().toISOString(),
    })
    .eq('id', prospect.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const adminWa = process.env.ADMIN_WHATSAPP
  if (adminWa) {
    await twilioClient.messages.create({
      body: `🔔 ANKETA AIZPILDĪTA!\n${vards} ${uzvards}\nCRM: https://promeistars.lv/crm/prospects/${prospect.id}`,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER!}`,
      to: `whatsapp:${adminWa}`,
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
