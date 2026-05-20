'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { Check, Loader2 } from 'lucide-react'

type DarbaLaiksRow = {
  dienas_nr: number
  no_laiks: string
  lidz_laiks: string
  strada: boolean
}

type Props = {
  meistarsId: string
  initialLaiki: DarbaLaiksRow[]
}

const DIENAS = [
  { nr: 1, nosaukums: 'Pirmdiena' },
  { nr: 2, nosaukums: 'Otrdiena' },
  { nr: 3, nosaukums: 'Trešdiena' },
  { nr: 4, nosaukums: 'Ceturtdiena' },
  { nr: 5, nosaukums: 'Piektdiena' },
  { nr: 6, nosaukums: 'Sestdiena' },
  { nr: 7, nosaukums: 'Svētdiena' },
]

function toTime(t: string) {
  return t.length > 5 ? t.slice(0, 5) : t
}

function initRows(laiki: DarbaLaiksRow[]) {
  return DIENAS.map((d) => {
    const db = laiki.find((l) => l.dienas_nr === d.nr)
    return {
      strada: db ? db.strada : d.nr <= 5,
      no_laiks: db ? toTime(db.no_laiks) : '08:00',
      lidz_laiks: db ? toTime(db.lidz_laiks) : '18:00',
    }
  })
}

export default function DarbaLaikuTabula({ meistarsId, initialLaiki }: Props) {
  const router = useRouter()
  const [rows, setRows] = useState(() => initRows(initialLaiki))
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  function update(idx: number, field: 'strada' | 'no_laiks' | 'lidz_laiks', value: boolean | string) {
    setRows((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
    setSaveState('idle')
  }

  async function handleSave() {
    setSaveState('saving')
    const supabase = getSupabaseClient()

    const { error } = await supabase
      .from('darba_laiki')
      .upsert(
        DIENAS.map((d, i) => ({
          meistars_id: meistarsId,
          dienas_nr: d.nr,
          strada: rows[i].strada,
          no_laiks: rows[i].no_laiks,
          lidz_laiks: rows[i].lidz_laiks,
        })),
        { onConflict: 'meistars_id,dienas_nr' }
      )

    if (error) {
      setSaveState('error')
    } else {
      setSaveState('saved')
      router.refresh()
      setTimeout(() => setSaveState('idle'), 3000)
    }
  }

  const timeInputClass = (disabled: boolean) =>
    `rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand ${
      disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'
    }`

  return (
    <div className="rounded-2xl bg-white border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-secondary border-b border-border">
            <th className="text-left px-5 py-3 font-semibold text-foreground">Diena</th>
            <th className="px-4 py-3 font-semibold text-foreground">Strādā</th>
            <th className="px-4 py-3 font-semibold text-foreground text-center">No</th>
            <th className="px-4 py-3 font-semibold text-foreground text-center">Līdz</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {DIENAS.map((d, i) => {
            const row = rows[i]
            return (
              <tr key={d.nr} className={row.strada ? '' : 'bg-gray-50'}>
                <td className="px-5 py-3 font-medium text-foreground">{d.nosaukums}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => update(i, 'strada', !row.strada)}
                    className={`h-5 w-5 rounded border-2 flex items-center justify-center mx-auto transition ${
                      row.strada ? 'bg-brand border-brand text-brand-foreground' : 'border-border bg-white'
                    }`}
                  >
                    {row.strada && <Check className="h-3 w-3" />}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="time"
                    value={row.no_laiks}
                    disabled={!row.strada}
                    onChange={(e) => update(i, 'no_laiks', e.target.value)}
                    className={timeInputClass(!row.strada)}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="time"
                    value={row.lidz_laiks}
                    disabled={!row.strada}
                    onChange={(e) => update(i, 'lidz_laiks', e.target.value)}
                    className={timeInputClass(!row.strada)}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="px-5 py-4 border-t border-border flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === 'saving'}
          className="inline-flex items-center gap-2 rounded-full bg-brand text-brand-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
        >
          {saveState === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
          {saveState === 'saved' && <Check className="h-4 w-4" />}
          {saveState === 'saved' ? 'Saglabāts!' : 'Saglabāt'}
        </button>
        {saveState === 'error' && (
          <span className="text-sm text-red-600">Kļūda. Mēģiniet vēlreiz.</span>
        )}
        {saveState === 'saved' && (
          <span className="text-sm text-green-600">Darba laiki saglabāti. Profila redzamība atjaunināta.</span>
        )}
      </div>
    </div>
  )
}
