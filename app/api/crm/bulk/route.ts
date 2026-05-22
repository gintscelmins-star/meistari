import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase'
import { getSupabaseSSR } from '@/lib/supabase-server'
import { twilioClient } from '@/lib/twilio'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  if (!rateLimit(req)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabaseSSR = await getSupabaseSSR()
  const { data: { user } } = await supabaseSSR.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { action: string; ids: string[]; statuss?: string; teksts?: string; kanals?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { action, ids, statuss, teksts, kanals } = body
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'Nav izvēlētu ierakstu' }, { status: 400 })
  }

  const supabase = getSupabaseServer()

  // --- DELETE ---
  if (action === 'delete') {
    const { error } = await supabase
      .from('prospects')
      .update({ dzesanas_pieprasits: true, dzesanas_datums: new Date().toISOString() })
      .in('id', ids)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, affected: ids.length })
  }

  // --- STATUSS ---
  if (action === 'statuss') {
    if (!statuss) return NextResponse.json({ error: 'Nav statuss' }, { status: 400 })
    const { error } = await supabase
      .from('prospects')
      .update({ statuss, updated_at: new Date().toISOString() })
      .in('id', ids)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, affected: ids.length })
  }

  // --- SMS / WA ---
  if (action === 'sms' || action === 'wa') {
    const { data: prospects } = await supabase
      .from('prospects')
      .select('id, vards, uzvards, telefons, whatsapp, valoda, demo_url')
      .in('id', ids)
      .eq('dzesanas_pieprasits', false)

    if (!prospects?.length) return NextResponse.json({ ok: true, sent: 0 })

    const results = await Promise.allSettled(
      prospects.map(async p => {
        const msgTeksts = teksts ?? `Sveiks, ${p.vards}! promeistars.lv`

        if (action === 'sms') {
          await twilioClient.messages.create({
            body: msgTeksts,
            from: process.env.TWILIO_PHONE_NUMBER!,
            to: p.telefons,
          })
        } else {
          const waTo = p.whatsapp ?? p.telefons
          await twilioClient.messages.create({
            body: msgTeksts,
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER!}`,
            to: `whatsapp:${waTo.replace(/\D/g, '').replace(/^0/, '+371')}`,
          })
        }

        // Saglabā ziņojumu vēsturē
        await supabase.from('zinojumi').insert({
          prospect_id: p.id,
          teksts: msgTeksts,
          kanals: action === 'sms' ? 'sms' : 'whatsapp',
          virziens: 'out',
          statuss: 'nosutits',
        })

        return p.id
      })
    )

    const sent = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    // Atjaunina statusu uz 'nosutits' veiksmīgi nosūtītajiem
    const sentIds = results
      .map((r, i) => r.status === 'fulfilled' ? prospects[i].id : null)
      .filter(Boolean) as string[]

    if (sentIds.length > 0) {
      await supabase
        .from('prospects')
        .update({ statuss: 'nosutits', updated_at: new Date().toISOString() })
        .in('id', sentIds)
    }

    return NextResponse.json({ ok: true, sent, failed })
  }

  return NextResponse.json({ error: 'Nezināma darbība' }, { status: 400 })
}
