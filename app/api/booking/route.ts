import { getSupabaseServer } from '@/lib/supabase'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { meistars_id, klients_vards, klients_telefons, pakalpojums, datums, laiks } = body

    if (!meistars_id || !klients_vards || !klients_telefons || !pakalpojums || !datums || !laiks) {
      return Response.json({ error: 'Trūkst obligātie lauki' }, { status: 400 })
    }

    const supabase = getSupabaseServer()

    const { data: booking, error } = await supabase
      .from('booking')
      .insert({ meistars_id, klients_vards, klients_telefons, pakalpojums, datums, laiks })
      .select()
      .single()

    if (error) {
      console.error('Booking error:', error)
      return Response.json({ error: 'Neizdevās saglabāt rezervāciju' }, { status: 500 })
    }

    // Iegūst meistara telefonu Make.com webhook
    const { data: meistars } = await supabase
      .from('meistari')
      .select('telefons')
      .eq('id', meistars_id)
      .single()

    const webhookUrl = process.env.MAKE_WEBHOOK_URL
    if (webhookUrl && meistars) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            klients_vards,
            klients_telefons,
            pakalpojums,
            datums,
            laiks,
            meistara_telefons: meistars.telefons,
          }),
        })
      } catch (webhookErr) {
        console.error('Webhook error:', webhookErr)
      }
    }

    return Response.json({ success: true, booking }, { status: 201 })
  } catch {
    return Response.json({ error: 'Iekšēja servera kļūda' }, { status: 500 })
  }
}
