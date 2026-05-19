'use client'

import { useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Booking = {
  id: string
  meistars_id: string
  klients_vards: string
  klients_telefons: string
  pakalpojums: string
  datums: string
  laiks: string
  statuss: string
  google_event_id: string | null
  izveidots_at: string
}

const STATUSI: Record<string, { label: string; klase: string }> = {
  jauns:        { label: 'Jauns',        klase: 'bg-blue-100 text-blue-700' },
  apstiprinats: { label: 'Apstiprināts', klase: 'bg-green-100 text-green-700' },
  atcelts:      { label: 'Atcelts',      klase: 'bg-red-100 text-red-600' },
  pabeigts:     { label: 'Pabeigts',     klase: 'bg-secondary text-muted-foreground' },
}

export default function BookingRinda({ booking }: { booking: Booking }) {
  const router = useRouter()
  const [statuss, setStatuss] = useState(booking.statuss)
  const [loading, setLoading] = useState(false)

  async function mainiStatus(jaunaisStatuss: string) {
    setLoading(true)
    const supabase = getSupabaseClient()

    if (jaunaisStatuss === 'apstiprinats') {
      // Izveido Google Calendar event, ja sync aktīvs
      try {
        const { data: sync } = await supabase
          .from('kalendars_sync')
          .select('*')
          .eq('meistars_id', booking.meistars_id)
          .maybeSingle()

        if (sync?.['sync_aktīvs'] && sync.google_refresh_token && sync.google_calendar_id) {
          const res = await fetch('/api/calendar/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ booking_id: booking.id }),
          })
          if (res.ok) {
            const { event_id } = await res.json()
            if (event_id) {
              await supabase
                .from('booking')
                .update({ google_event_id: event_id })
                .eq('id', booking.id)
            }
          }
        }
      } catch {
        // Turpina pat ja calendar event neizdevās
      }
    }

    await supabase.from('booking').update({ statuss: jaunaisStatuss }).eq('id', booking.id)
    setStatuss(jaunaisStatuss)
    setLoading(false)
    router.refresh()
  }

  const info = STATUSI[statuss] ?? STATUSI.jauns

  return (
    <div className="rounded-2xl bg-white border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-foreground text-sm">{booking.klients_vards}</span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${info.klase}`}>
            {info.label}
          </span>
          {booking.google_event_id && (
            <span className="text-xs text-muted-foreground">📅 Kalendārā</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{booking.pakalpojums}</p>
        <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
          <span>{booking.datums} — {booking.laiks.slice(0, 5)}</span>
          <a
            href={`tel:${booking.klients_telefons}`}
            className="text-brand font-semibold hover:underline"
          >
            {booking.klients_telefons}
          </a>
        </div>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        {statuss === 'jauns' && (
          <>
            <button
              onClick={() => mainiStatus('apstiprinats')}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full bg-brand text-brand-foreground hover:opacity-90 transition disabled:opacity-50"
            >
              Apstiprināt
            </button>
            <button
              onClick={() => mainiStatus('atcelts')}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:bg-secondary transition disabled:opacity-50"
            >
              Atcelt
            </button>
          </>
        )}
        {statuss === 'apstiprinats' && (
          <button
            onClick={() => mainiStatus('pabeigts')}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:bg-secondary transition disabled:opacity-50"
          >
            Pabeigts
          </button>
        )}
      </div>
    </div>
  )
}
