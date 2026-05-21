import { getSupabaseServer } from '@/lib/supabase'
import { createCalendarEvent } from '@/lib/google-calendar'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  if (!rateLimit(request)) {
    return NextResponse.json(
      { error: 'Pārāk daudz pieprasījumu' },
      { status: 429 }
    )
  }

  try {
    const { booking_id } = await request.json()
    if (!booking_id) {
      return Response.json({ error: 'Trūkst booking_id' }, { status: 400 })
    }

    const supabase = getSupabaseServer()

    const { data: booking } = await supabase
      .from('booking')
      .select('*, meistari(vards, uzvards)')
      .eq('id', booking_id)
      .single()

    if (!booking) {
      return Response.json({ error: 'Booking nav atrasts' }, { status: 404 })
    }

    const { data: sync } = await supabase
      .from('kalendars_sync')
      .select('*')
      .eq('meistars_id', booking.meistars_id)
      .single()

    if (!sync?.['sync_aktīvs'] || !sync.google_refresh_token || !sync.google_calendar_id) {
      return Response.json({ event_id: null })
    }

    // Parsē datumu un laiku
    const [hours, minutes] = booking.laiks.split(':').map(Number)
    const startDate = new Date(`${booking.datums}T${booking.laiks.slice(0, 5)}:00`)
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // +1 stunda

    const pad = (n: number) => String(n).padStart(2, '0')
    const formatLocal = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`

    const meistarsNosaukums = Array.isArray(booking.meistari)
      ? `${booking.meistari[0]?.vards ?? ''} ${booking.meistari[0]?.uzvards ?? ''}`
      : `${(booking.meistari as { vards: string; uzvards: string } | null)?.vards ?? ''} ${(booking.meistari as { vards: string; uzvards: string } | null)?.uzvards ?? ''}`

    const event_id = await createCalendarEvent(
      sync.google_refresh_token,
      sync.google_calendar_id,
      {
        summary: `${booking.pakalpojums} — ${booking.klients_vards}`,
        description: `Klients: ${booking.klients_vards}\nTālrunis: ${booking.klients_telefons}\nPakalpojums: ${booking.pakalpojums}`,
        startDateTime: formatLocal(startDate),
        endDateTime: formatLocal(endDate),
      }
    )

    return Response.json({ event_id })
  } catch {
    return Response.json({ error: 'Iekšēja kļūda' }, { status: 500 })
  }
}
