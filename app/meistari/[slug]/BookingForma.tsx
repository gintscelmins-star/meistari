'use client'

import { useState, useEffect, useMemo } from 'react'
import { CheckCircle2, Calendar, Clock, Loader2, Mail } from 'lucide-react'
import type { Pakalpojums } from '@/lib/supabase'

type DarbaLaiks = {
  dienas_nr: number
  no_laiks: string
  lidz_laiks: string
  strada: boolean
}

type Props = {
  meistarsId: string
  pakalpojumi: Pakalpojums[]
  darbaLaiki: DarbaLaiks[]
}

type FormState = 'idle' | 'loading' | 'success' | 'error'

function toHHMM(t: string) {
  return t.length > 5 ? t.slice(0, 5) : t
}

function getWeekday(dateStr: string): number {
  const d = new Date(dateStr)
  const js = d.getDay()
  return js === 0 ? 7 : js
}

function generateSlots(noLaiks: string, lidz_laiks: string): string[] {
  const [noH] = noLaiks.split(':').map(Number)
  const [lidzH] = lidz_laiks.split(':').map(Number)
  const slots: string[] = []
  for (let h = noH; h < lidzH; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`)
  }
  return slots
}

const inputClass = "mt-1 w-full rounded-lg border border-border bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"

export default function BookingForma({ meistarsId, pakalpojumi, darbaLaiki }: Props) {
  const [vards, setVards] = useState('')
  const [telefons, setTelefons] = useState('')
  const [pakalpojums, setPakalpojums] = useState(pakalpojumi[0]?.nosaukums ?? '')
  const [datums, setDatums] = useState('')
  const [laiks, setLaiks] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [busySlots, setBusySlots] = useState<string[]>([])
  const [loadingBusy, setLoadingBusy] = useState(false)

  const stradaDienas = useMemo(
    () => new Set(darbaLaiki.filter((d) => d.strada).map((d) => d.dienas_nr)),
    [darbaLaiki]
  )

  const selectedDaySchedule = useMemo(() => {
    if (!datums) return null
    const nr = getWeekday(datums)
    return darbaLaiki.find((d) => d.dienas_nr === nr && d.strada) ?? null
  }, [datums, darbaLaiki])

  const availableSlots = useMemo(() => {
    if (!selectedDaySchedule) return []
    return generateSlots(toHHMM(selectedDaySchedule.no_laiks), toHHMM(selectedDaySchedule.lidz_laiks))
  }, [selectedDaySchedule])

  const isNonWorkingDay = datums && stradaDienas.size > 0 && !selectedDaySchedule

  useEffect(() => {
    if (!datums || !selectedDaySchedule) {
      setBusySlots([])
      return
    }

    setLoadingBusy(true)
    setLaiks('')

    fetch(`/api/calendar/freebusy?meistars_id=${meistarsId}&datums=${datums}`)
      .then((r) => r.json())
      .then(({ busy }: { busy: Array<{ start: string; end: string }> }) => {
        const blocked = availableSlots.filter((slot) => {
          const slotStart = new Date(`${datums}T${slot}:00`)
          const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000)
          return busy.some(({ start, end }) => {
            const busyStart = new Date(start)
            const busyEnd = new Date(end)
            return slotStart < busyEnd && slotEnd > busyStart
          })
        })
        setBusySlots(blocked)
      })
      .catch(() => setBusySlots([]))
      .finally(() => setLoadingBusy(false))
  }, [datums, meistarsId, selectedDaySchedule])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meistars_id: meistarsId, klients_vards: vards, klients_telefons: telefons, pakalpojums, datums, laiks }),
      })
      setState(res.ok ? 'success' : 'error')
    } catch {
      setState('error')
    }
  }

  const stradaText = useMemo(() => {
    if (!darbaLaiki.length) return null
    const darbaNames = ['Pirmd', 'Otrd', 'Trešd', 'Ceturtd', 'Piektd', 'Sestd', 'Svētd']
    const working = darbaLaiki.filter((d) => d.strada).map((d) => darbaNames[d.dienas_nr - 1])
    return working.length ? working.join(', ') : null
  }, [darbaLaiki])

  if (state === 'success') {
    return (
      <div className="rounded-2xl bg-white border border-border p-8 text-center space-y-3">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-brand-soft text-brand">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <p className="text-lg font-bold">Rezervācija saņemta!</p>
        <p className="text-sm text-muted-foreground">Meistars sazināsies ar jums tuvākajā laikā.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-border p-6 sm:p-8 space-y-4">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Mail className="h-5 w-5 text-brand" />
        Pierakstīties
      </h3>

      {stradaText && (
        <p className="text-xs text-muted-foreground bg-brand-soft rounded-lg px-3 py-2">
          Strādā: {stradaText}
        </p>
      )}

      <div>
        <label className="text-sm font-semibold">Vārds, uzvārds</label>
        <input type="text" required value={vards} onChange={(e) => setVards(e.target.value)}
          placeholder="Jānis Bērziņš" className={inputClass} />
      </div>

      <div>
        <label className="text-sm font-semibold">Tālrunis</label>
        <input type="tel" required value={telefons} onChange={(e) => setTelefons(e.target.value)}
          placeholder="+371 20000000" className={inputClass} />
      </div>

      <div>
        <label className="text-sm font-semibold">Pakalpojums</label>
        {pakalpojumi.length > 0 ? (
          <select value={pakalpojums} onChange={(e) => setPakalpojums(e.target.value)} className={inputClass}>
            {pakalpojumi.map((p) => (
              <option key={p.id} value={p.nosaukums}>{p.nosaukums}</option>
            ))}
          </select>
        ) : (
          <input type="text" required value={pakalpojums} onChange={(e) => setPakalpojums(e.target.value)}
            placeholder="Aprakstiet darbu" className={inputClass} />
        )}
      </div>

      <div>
        <label className="text-sm font-semibold flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" /> Datums
        </label>
        <input type="date" required value={datums}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => { setDatums(e.target.value); setLaiks('') }}
          className={inputClass} />
        {isNonWorkingDay && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-1">
            Šajā dienā meistars nestrādā. Izvēlieties citu datumu.
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-semibold flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> Laiks
          {loadingBusy && <Loader2 className="h-3 w-3 animate-spin ml-1 text-muted-foreground" />}
        </label>
        <select required value={laiks} onChange={(e) => setLaiks(e.target.value)}
          disabled={loadingBusy || !!isNonWorkingDay || !datums} className={inputClass}>
          <option value="">Izvēlieties laiku</option>
          {availableSlots.map((l) => {
            const aiznemts = busySlots.includes(l)
            return (
              <option key={l} value={l} disabled={aiznemts}>
                {l}{aiznemts ? ' — aizņemts' : ''}
              </option>
            )
          })}
        </select>
      </div>

      {state === 'error' && (
        <p className="text-sm rounded-lg bg-red-50 text-red-700 px-3 py-2">
          Kļūda. Lūdzu mēģiniet vēlreiz.
        </p>
      )}

      <button type="submit" disabled={state === 'loading' || !!isNonWorkingDay}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-brand text-brand-foreground px-5 py-3 font-semibold hover:opacity-90 transition disabled:opacity-60">
        {state === 'loading' ? 'Sūta...' : 'Nosūtīt pieprasījumu'}
      </button>
    </form>
  )
}
