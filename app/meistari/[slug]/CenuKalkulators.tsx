'use client'

import { useState, useMemo } from 'react'
import { Phone } from 'lucide-react'
import type { Pakalpojums } from '@/lib/supabase'

type Props = {
  pakalpojumi: Pakalpojums[]
  telUrl: string | null
}

const URGENCY = [
  { label: 'Standarta', mult: 1 },
  { label: 'Steidzami (+30%)', mult: 1.3 },
  { label: 'Avārijas 24/7 (+60%)', mult: 1.6 },
]

export default function CenuKalkulators({ pakalpojumi, telUrl }: Props) {
  const [svcIdx, setSvcIdx] = useState(0)
  const [urg, setUrg] = useState(0)

  const svc = pakalpojumi[svcIdx]
  const result = useMemo(
    () => svc ? Math.round(svc.cena_no * URGENCY[urg].mult) : 0,
    [svc, urg]
  )

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-semibold">Izvēlieties pakalpojumu</label>
          <select
            value={svcIdx}
            onChange={(e) => setSvcIdx(Number(e.target.value))}
            className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {pakalpojumi.map((p, i) => (
              <option key={p.id} value={i}>{p.nosaukums}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold">Steidzamība</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {URGENCY.map((u, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setUrg(i)}
                className={`rounded-lg border px-2 py-3 text-xs font-semibold transition ${
                  urg === i
                    ? 'border-brand bg-brand text-brand-foreground'
                    : 'border-border bg-white text-muted-foreground hover:text-foreground'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-brand text-brand-foreground p-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide opacity-80">Aptuvena cena</div>
          <div className="text-3xl sm:text-4xl font-bold mt-1">no €{result}</div>
        </div>
        {telUrl && (
          <a
            href={telUrl}
            className="inline-flex items-center gap-2 rounded-full bg-white text-brand px-5 py-3 font-semibold hover:bg-secondary transition"
          >
            <Phone className="h-4 w-4" /> Zvanīt
          </a>
        )}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Precīzu cenu noskaidrojiet pa tālruni. Cenas ir orientējošas.
      </p>
    </div>
  )
}
