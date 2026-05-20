'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Check, Loader2, X } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase'

type StdPak = { id: string; nosaukums: string; kartiba: number | null }
type Kategorija = {
  id: string
  nosaukums: string
  kartiba: number | null
  standartu_pakalpojumi: StdPak[]
}
type ExistingPak = {
  id: string
  standartu_pakalpojums_id: string
  cena_no: number | null
  cena_lidz: number | null
  apraksts: string | null
}

type Props = {
  meistarsId: string
  kategorijas: Kategorija[]
  existing: ExistingPak[]
}

type PakState = {
  checked: boolean
  cena_no: string
  cena_lidz: string
  apraksts: string
  saveState: 'idle' | 'saving' | 'saved' | 'error'
}

const inputClass = "rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"

export default function PakalpojumiEditor({ meistarsId, kategorijas, existing }: Props) {
  const [openKats, setOpenKats] = useState<Record<string, boolean>>({
    [kategorijas[0]?.id ?? '']: true,
  })

  const [state, setState] = useState<Record<string, PakState>>(() => {
    const s: Record<string, PakState> = {}
    existing.forEach((e) => {
      s[e.standartu_pakalpojums_id] = {
        checked: true,
        cena_no: e.cena_no?.toString() ?? '',
        cena_lidz: e.cena_lidz?.toString() ?? '',
        apraksts: e.apraksts ?? '',
        saveState: 'idle',
      }
    })
    return s
  })

  function toggleKat(id: string) {
    setOpenKats((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function togglePak(pakId: string) {
    setState((prev) => {
      const current = prev[pakId]
      if (current?.checked) {
        const next = { ...prev }
        delete next[pakId]
        handleDelete(pakId)
        return next
      }
      return {
        ...prev,
        [pakId]: { checked: true, cena_no: '', cena_lidz: '', apraksts: '', saveState: 'idle' },
      }
    })
  }

  async function handleDelete(pakId: string) {
    const supabase = getSupabaseClient()
    await supabase
      .from('meistara_pakalpojumi')
      .delete()
      .eq('meistars_id', meistarsId)
      .eq('standartu_pakalpojums_id', pakId)
  }

  async function handleSave(pakId: string) {
    setState((prev) => ({
      ...prev,
      [pakId]: { ...prev[pakId], saveState: 'saving' },
    }))

    const item = state[pakId]
    const supabase = getSupabaseClient()

    const { error } = await supabase
      .from('meistara_pakalpojumi')
      .upsert(
        {
          meistars_id: meistarsId,
          standartu_pakalpojums_id: pakId,
          cena_no: item.cena_no ? parseFloat(item.cena_no) : null,
          cena_lidz: item.cena_lidz ? parseFloat(item.cena_lidz) : null,
          apraksts: item.apraksts || null,
        },
        { onConflict: 'meistars_id,standartu_pakalpojums_id' }
      )

    setState((prev) => ({
      ...prev,
      [pakId]: { ...prev[pakId], saveState: error ? 'error' : 'saved' },
    }))

    if (!error) {
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          [pakId]: { ...prev[pakId], saveState: 'idle' },
        }))
      }, 2000)
    }
  }

  function update(pakId: string, field: keyof PakState, value: string) {
    setState((prev) => ({ ...prev, [pakId]: { ...prev[pakId], [field]: value, saveState: 'idle' } }))
  }

  return (
    <div className="space-y-3">
      {kategorijas.map((kat) => {
        const sorted = [...kat.standartu_pakalpojumi].sort((a, b) => (a.kartiba ?? 0) - (b.kartiba ?? 0))
        const checkedCount = sorted.filter((p) => state[p.id]?.checked).length
        const isOpen = !!openKats[kat.id]

        return (
          <div key={kat.id} className="rounded-2xl overflow-hidden border border-border bg-white">
            <button
              type="button"
              onClick={() => toggleKat(kat.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-foreground">{kat.nosaukums}</span>
                {checkedCount > 0 && (
                  <span className="text-xs font-semibold bg-brand text-brand-foreground px-2 py-0.5 rounded-full">
                    {checkedCount}
                  </span>
                )}
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {isOpen && (
              <div className="border-t border-border divide-y divide-border">
                {sorted.map((p) => {
                  const ps = state[p.id]
                  const checked = !!ps?.checked

                  return (
                    <div key={p.id} className={`px-5 py-3 ${checked ? 'bg-brand-soft/50' : ''}`}>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => togglePak(p.id)}
                          className={`flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition ${
                            checked ? 'bg-brand border-brand text-brand-foreground' : 'border-border bg-white'
                          }`}
                        >
                          {checked && <Check className="h-3 w-3" />}
                        </button>
                        <span className="text-sm text-foreground">{p.nosaukums}</span>
                      </div>

                      {checked && (
                        <div className="mt-3 ml-8 space-y-3">
                          <div className="flex flex-wrap gap-3 items-end">
                            <div>
                              <label className="block text-xs font-semibold text-muted-foreground mb-1">Cena no, €</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="—"
                                value={ps.cena_no}
                                onChange={(e) => update(p.id, 'cena_no', e.target.value)}
                                className={`${inputClass} w-24`}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-muted-foreground mb-1">Cena līdz, €</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="—"
                                value={ps.cena_lidz}
                                onChange={(e) => update(p.id, 'cena_lidz', e.target.value)}
                                className={`${inputClass} w-24`}
                              />
                            </div>
                            <div className="flex-1 min-w-[180px]">
                              <label className="block text-xs font-semibold text-muted-foreground mb-1">Apraksts</label>
                              <input
                                type="text"
                                placeholder="Papildu informācija..."
                                value={ps.apraksts}
                                onChange={(e) => update(p.id, 'apraksts', e.target.value)}
                                className={`${inputClass} w-full`}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSave(p.id)}
                              disabled={ps.saveState === 'saving'}
                              className="inline-flex items-center gap-1.5 rounded-full bg-brand text-brand-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
                            >
                              {ps.saveState === 'saving' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                              {ps.saveState === 'saved' && <Check className="h-3.5 w-3.5" />}
                              {ps.saveState === 'saved' ? 'Saglabāts' : 'Saglabāt'}
                            </button>
                          </div>
                          {ps.saveState === 'error' && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <X className="h-3 w-3" /> Kļūda. Mēģiniet vēlreiz.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
