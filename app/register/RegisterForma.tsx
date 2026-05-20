'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DarbaTips, Regions } from '@/lib/supabase'
import { pakalpojumi as pakKoks } from '@/lib/pakalpojumi'

type Props = {
  darbaTipi: DarbaTips[]
  regioni: Regions[]
}

type State = 'idle' | 'loading' | 'error'

type SelectedPakalpojums = {
  lv: string
  ru: string
  kategorija_lv: string
  apakskategorija_lv: string
}

const DIENAS = ['Pirmd', 'Otrd', 'Trešd', 'Ceturtd', 'Piektd', 'Sestd', 'Svētd']

const inputClass = 'w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand'
const labelClass = 'block text-sm font-semibold text-foreground mb-1.5'
const cardClass = 'rounded-2xl bg-white border border-border p-6 space-y-4'

export default function RegisterForma({ darbaTipi, regioni }: Props) {
  const router = useRouter()

  // Personas dati
  const [vards, setVards] = useState('')
  const [uzvards, setUzvards] = useState('')
  const [epasts, setEpasts] = useState('')
  const [parole, setParole] = useState('')
  const [specialitate, setSpecialitate] = useState('')
  const [telefons, setTelefons] = useState('')
  const [pilseta, setPilseta] = useState('')
  const [pieredzeGadi, setPieredzeGadi] = useState('')

  // DB saites
  const [selectedDarbaTipi, setSelectedDarbaTipi] = useState<string[]>([])
  const [selectedRegioni, setSelectedRegioni] = useState<string[]>([])

  // Pakalpojumu koks
  const [selectedPakalpojumi, setSelectedPakalpojumi] = useState<SelectedPakalpojums[]>([])
  const [expandedKat, setExpandedKat] = useState<string | null>(null)
  const [expandedApak, setExpandedApak] = useState<string | null>(null)

  // Darba laiks
  const [darbaLaikaDienas, setDarbaLaikaDienas] = useState<string[]>(['Pirmd', 'Otrd', 'Trešd', 'Ceturtd', 'Piektd'])
  const [darbaLaikaNo, setDarbaLaikaNo] = useState('09:00')
  const [darbaLaikaLidz, setDarbaLaikaLidz] = useState('18:00')
  const [avarijas, setAvarijas] = useState(false)

  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function toggleItem(id: string, list: string[], setList: (v: string[]) => void) {
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id])
  }

  function togglePakalpojums(lv: string, ru: string, kat_lv: string, apak_lv: string) {
    setSelectedPakalpojumi(prev =>
      prev.some(p => p.lv === lv)
        ? prev.filter(p => p.lv !== lv)
        : [...prev, { lv, ru, kategorija_lv: kat_lv, apakskategorija_lv: apak_lv }]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (parole.length < 8) { setErrorMsg('Parolei jābūt vismaz 8 simboliem'); return }
    setState('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vards, uzvards, epasts, parole, specialitate,
          telefons, pilseta,
          pieredze_gadi: pieredzeGadi || '0',
          darba_tipi_ids: selectedDarbaTipi,
          regioni_ids: selectedRegioni,
          pakalpojumi: selectedPakalpojumi,
          darba_laika_dienas: darbaLaikaDienas,
          darba_laika_no: darbaLaikaNo,
          darba_laika_lidz: darbaLaikaLidz,
          avarijas,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        router.push('/register/paldies')
      } else {
        setErrorMsg((data as { error?: string }).error ?? 'Kļūda. Mēģiniet vēlreiz.')
        setState('error')
      }
    } catch {
      setErrorMsg('Savienojuma kļūda. Mēģiniet vēlreiz.')
      setState('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Personas dati */}
      <div className={cardClass}>
        <h2 className="font-semibold text-foreground">Personas dati</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Vārds *</label>
            <input type="text" required value={vards} onChange={e => setVards(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Uzvārds *</label>
            <input type="text" required value={uzvards} onChange={e => setUzvards(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>E-pasts *</label>
          <input type="email" required value={epasts} onChange={e => setEpasts(e.target.value)} placeholder="janis@example.com" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Parole * (min. 8 simboli)</label>
          <input type="password" required value={parole} onChange={e => setParole(e.target.value)} placeholder="••••••••" className={inputClass} />
        </div>
      </div>

      {/* Profesionālie dati */}
      <div className={cardClass}>
        <h2 className="font-semibold text-foreground">Profesionālā informācija</h2>
        <div>
          <label className={labelClass}>Specialitāte *</label>
          <input type="text" required value={specialitate} onChange={e => setSpecialitate(e.target.value)} placeholder="Piemēram: Santehniķis, Elektriķis" className={inputClass} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tālrunis *</label>
            <input type="tel" required value={telefons} onChange={e => setTelefons(e.target.value)} placeholder="+371 20000000" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Pilsēta</label>
            <input type="text" value={pilseta} onChange={e => setPilseta(e.target.value)} placeholder="Rīga" className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Pieredze (gadi)</label>
          <input type="number" min={0} max={60} value={pieredzeGadi} onChange={e => setPieredzeGadi(e.target.value)} placeholder="0"
            className="w-28 rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
        </div>
      </div>

      {/* Pakalpojumu koks */}
      <div className={cardClass}>
        <div>
          <h2 className="font-semibold text-foreground">Pakalpojumi</h2>
          <p className="text-sm text-muted-foreground mt-1">Atzīmējiet visus pakalpojumus, ko piedāvājat</p>
        </div>

        {selectedPakalpojumi.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedPakalpojumi.map(p => (
              <span
                key={p.lv}
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2.5 py-1"
              >
                {p.lv}
                <button type="button" onClick={() => togglePakalpojums(p.lv, p.ru, p.kategorija_lv, p.apakskategorija_lv)}
                  className="hover:text-blue-900 font-bold leading-none">×</button>
              </span>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {pakKoks.map(kat => (
            <div key={kat.kategorija_lv} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Kategorija virsraksts */}
              <button
                type="button"
                onClick={() => setExpandedKat(expandedKat === kat.kategorija_lv ? null : kat.kategorija_lv)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-800"
              >
                <span>{kat.kategorija_lv}</span>
                <span className="text-gray-400 text-xs">{expandedKat === kat.kategorija_lv ? '▲' : '▼'}</span>
              </button>

              {expandedKat === kat.kategorija_lv && (
                <div className="divide-y divide-gray-100">
                  {kat.apakskategorijas.map(ak => (
                    <div key={ak.nosaukums_lv}>
                      {/* Apakškategorija */}
                      <button
                        type="button"
                        onClick={() => setExpandedApak(expandedApak === ak.nosaukums_lv ? null : ak.nosaukums_lv)}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                      >
                        <span>{ak.nosaukums_lv}</span>
                        <span className="text-gray-400 text-xs">{expandedApak === ak.nosaukums_lv ? '▲' : '▼'}</span>
                      </button>

                      {expandedApak === ak.nosaukums_lv && (
                        <div className="px-4 pb-3 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-white">
                          {ak.pakalpojumi.map(p => {
                            const checked = selectedPakalpojumi.some(sp => sp.lv === p.lv)
                            return (
                              <label key={p.lv} className="flex items-center gap-2 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => togglePakalpojums(p.lv, p.ru, kat.kategorija_lv, ak.nosaukums_lv)}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900">{p.lv}</span>
                              </label>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Darba laiks */}
      <div className={cardClass}>
        <div>
          <h2 className="font-semibold text-foreground">Darba laiks</h2>
          <p className="text-sm text-muted-foreground mt-1">Norādiet, kurās dienās un cikos strādājat</p>
        </div>

        <div>
          <label className={labelClass}>Darba dienas</label>
          <div className="flex flex-wrap gap-2">
            {DIENAS.map(d => (
              <label key={d} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={darbaLaikaDienas.includes(d)}
                  onChange={() => toggleItem(d, darbaLaikaDienas, setDarbaLaikaDienas)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{d}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>No</label>
            <input
              type="time"
              value={darbaLaikaNo}
              onChange={e => setDarbaLaikaNo(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className={labelClass}>Līdz</label>
            <input
              type="time"
              value={darbaLaikaLidz}
              onChange={e => setDarbaLaikaLidz(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={avarijas}
            onChange={e => setAvarijas(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-400"
          />
          <span className="text-sm font-medium text-gray-700">
            Pieejams avārijas izsaukumiem 24/7
          </span>
        </label>
      </div>

      {/* Darba veidi (DB) */}
      {darbaTipi.length > 0 && (
        <div className={cardClass}>
          <h2 className="font-semibold text-foreground">Darba veidi</h2>
          <p className="text-sm text-muted-foreground">Izvēlieties visus atbilstošos darba veidus</p>
          <div className="flex flex-wrap gap-2">
            {darbaTipi.map(dt => {
              const selected = selectedDarbaTipi.includes(dt.id)
              return (
                <button
                  key={dt.id}
                  type="button"
                  onClick={() => toggleItem(dt.id, selectedDarbaTipi, setSelectedDarbaTipi)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    selected ? 'border-brand bg-brand text-brand-foreground' : 'border-border bg-white text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {dt.ikona} {dt.nosaukums}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Reģioni (DB) */}
      {regioni.length > 0 && (
        <div className={cardClass}>
          <h2 className="font-semibold text-foreground">Darba reģioni</h2>
          <p className="text-sm text-muted-foreground">Izvēlieties reģionus, kuros strādājat</p>
          <div className="flex flex-wrap gap-2">
            {regioni.map(r => {
              const selected = selectedRegioni.includes(r.id)
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleItem(r.id, selectedRegioni, setSelectedRegioni)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    selected ? 'border-brand bg-brand text-brand-foreground' : 'border-border bg-white text-muted-foreground hover:text-foreground'
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
