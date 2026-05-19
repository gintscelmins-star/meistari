'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DarbaTips, Regions } from '@/lib/supabase'

type Props = {
  darbaTipi: DarbaTips[]
  regioni: Regions[]
}

type State = 'idle' | 'loading' | 'error'

const inputClass = "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
const labelClass = "block text-sm font-semibold text-foreground mb-1.5"

export default function RegisterForma({ darbaTipi, regioni }: Props) {
  const router = useRouter()
  const [vards, setVards] = useState('')
  const [uzvards, setUzvards] = useState('')
  const [epasts, setEpasts] = useState('')
  const [parole, setParole] = useState('')
  const [specialitate, setSpecialitate] = useState('')
  const [telefons, setTelefons] = useState('')
  const [pilseta, setPilseta] = useState('')
  const [pieredzeGadi, setPieredzeGadi] = useState('')
  const [selectedDarbaTipi, setSelectedDarbaTipi] = useState<string[]>([])
  const [selectedRegioni, setSelectedRegioni] = useState<string[]>([])
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function toggleItem(id: string, list: string[], setList: (v: string[]) => void) {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (parole.length < 8) {
      setErrorMsg('Parolei jābūt vismaz 8 simboliem')
      return
    }
    setState('loading')
    setErrorMsg('')

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vards, uzvards, epasts, parole, specialitate,
        telefons, pilseta,
        pieredze_gadi: pieredzeGadi || '0',
        darba_tipi_ids: selectedDarbaTipi,
        regioni_ids: selectedRegioni,
      }),
    })

    const data = await res.json()

    if (res.ok) {
      router.push('/register/paldies')
    } else {
      setErrorMsg(data.error ?? 'Kļūda. Mēģiniet vēlreiz.')
      setState('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personas dati */}
      <div className="rounded-2xl bg-white border border-border p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Personas dati</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Vārds *</label>
            <input type="text" required value={vards}
              onChange={(e) => setVards(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Uzvārds *</label>
            <input type="text" required value={uzvards}
              onChange={(e) => setUzvards(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>E-pasts *</label>
          <input type="email" required value={epasts}
            onChange={(e) => setEpasts(e.target.value)}
            placeholder="janis@example.com" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Parole * (min. 8 simboli)</label>
          <input type="password" required value={parole}
            onChange={(e) => setParole(e.target.value)}
            placeholder="••••••••" className={inputClass} />
        </div>
      </div>

      {/* Profesionālie dati */}
      <div className="rounded-2xl bg-white border border-border p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Profesionālā informācija</h2>

        <div>
          <label className={labelClass}>Specialitāte *</label>
          <input type="text" required value={specialitate}
            onChange={(e) => setSpecialitate(e.target.value)}
            placeholder="Piemēram: Santehniķis, Elektriķis" className={inputClass} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tālrunis *</label>
            <input type="tel" required value={telefons}
              onChange={(e) => setTelefons(e.target.value)}
              placeholder="+371 20000000" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Pilsēta</label>
            <input type="text" value={pilseta}
              onChange={(e) => setPilseta(e.target.value)}
              placeholder="Rīga" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Pieredze (gadi)</label>
          <input type="number" min={0} max={60} value={pieredzeGadi}
            onChange={(e) => setPieredzeGadi(e.target.value)}
            placeholder="0" className="w-28 rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand" />
        </div>
      </div>

      {/* Darba veidi */}
      {darbaTipi.length > 0 && (
        <div className="rounded-2xl bg-white border border-border p-6 space-y-3">
          <h2 className="font-semibold text-foreground">Darba veidi</h2>
          <p className="text-sm text-muted-foreground">Izvēlieties visus atbilstošos darba veidus</p>
          <div className="flex flex-wrap gap-2">
            {darbaTipi.map((dt) => {
              const selected = selectedDarbaTipi.includes(dt.id)
              return (
                <button
                  key={dt.id}
                  type="button"
                  onClick={() => toggleItem(dt.id, selectedDarbaTipi, setSelectedDarbaTipi)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition ${
                    selected
                      ? 'border-brand bg-brand text-brand-foreground'
                      : 'border-border bg-white text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {dt.ikona} {dt.nosaukums}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Reģioni */}
      {regioni.length > 0 && (
        <div className="rounded-2xl bg-white border border-border p-6 space-y-3">
          <h2 className="font-semibold text-foreground">Darba reģioni</h2>
          <p className="text-sm text-muted-foreground">Izvēlieties reģionus, kuros strādājat</p>
          <div className="flex flex-wrap gap-2">
            {regioni.map((r) => {
              const selected = selectedRegioni.includes(r.id)
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleItem(r.id, selectedRegioni, setSelectedRegioni)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                    selected
                      ? 'border-brand bg-brand text-brand-foreground'
                      : 'border-border bg-white text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {r.nosaukums}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={state === 'loading'}
        className="w-full inline-flex items-center justify-center rounded-full bg-brand text-brand-foreground py-3.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
      >
        {state === 'loading' ? 'Reģistrē...' : 'Iesniegt pieteikumu'}
      </button>
    </form>
  )
}
