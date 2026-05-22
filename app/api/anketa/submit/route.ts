import { NextRequest, NextResponse } from 'next/server'
import { twilioClient } from '@/lib/twilio'
import { getSupabaseServer } from '@/lib/supabase'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  if (!rateLimit(req)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any
  try {
    body = await req.json()
  } catch (err) {
    console.error('JSON parse error:', err)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const anketa_code: string = body.anketa_code
  const vards: string = body.vards
  const uzvards: string = body.uzvards
  const email: string = body.email
  const specialitates: unknown = body.specialitates
  const regioni: unknown = body.regioni
  const pakalpojumi: unknown = body.pakalpojumi
  const apraksts: unknown = body.apraksts
  const darba_laiki: unknown = body.darba_laiki

  if (!anketa_code || !vards || !uzvards || !email) {
    return NextResponse.json({ error: 'Obligātie lauki trūkst' }, { status: 400 })
  }

  const specsArr: string[] = Array.isArray(specialitates) ? specialitates as string[] : []

  function resolveNodarbosanas(): string {
    const customEntry = specsArr.find(s => s.startsWith('custom: '))
    if (customEntry) return customEntry.replace('custom: ', '').trim().toLowerCase()
    if (specsArr.includes('Elektriķis') && specsArr.includes('Santehniķis')) return 'santehnikis,elektrikis'
    if (specsArr.includes('Elektriķis')) return 'elektrikis'
    if (specsArr.includes('Remontdarbi')) return 'remontdarbi'
    return 'santehnikis'
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

  const regionsStr = Array.isArray(regioni) ? regioni.join(', ') : null
  const pakalpojumiArr = Array.isArray(pakalpojumi) ? pakalpojumi : null

  const { error } = await supabase
    .from('prospects')
    .update({
      vards: String(vards).trim(),
      uzvards: String(uzvards).trim(),
      email: String(email).trim(),
      nodarbosanas: resolveNodarbosanas(),
      regions: regionsStr,
      pakalpojumi: pakalpojumiArr,
      apraksts: apraksts ? String(apraksts).trim() : null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      darba_laiki: (darba_laiki ?? null) as any,
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
