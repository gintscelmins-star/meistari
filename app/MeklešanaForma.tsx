'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'
import type { DarbaTips, Regions } from '@/lib/supabase'

type Props = {
  darbaTipi: DarbaTips[]
  regioni: Regions[]
  defaultTips: string
  defaultRegions: string
  defaultDatums: string
}

export default function MeklešanaForma({ darbaTipi, regioni, defaultTips, defaultRegions, defaultDatums }: Props) {
  const router = useRouter()
  const [tips, setTips] = useState(defaultTips)
  const [region, setRegion] = useState(defaultRegions)
  const [datums, setDatums] = useState(defaultDatums)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (tips) params.set('tips', tips)
    if (region) params.set('regions', region)
    if (datums) params.set('datums', datums)
    router.push(`/?${params.toString()}`)
  }

  const selectClass = "w-full rounded-lg border border-border bg-white px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-border shadow-sm p-4 flex flex-col sm:flex-row gap-3"
    >
      <select
        value={tips}
        onChange={(e) => setTips(e.target.value)}
        className={selectClass}
      >
        <option value="">Visi darba veidi</option>
        {darbaTipi.map((dt) => (
          <option key={dt.id} value={dt.slug}>
            {dt.ikona} {dt.nosaukums}
          </option>
        ))}
      </select>

      <select
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        className={selectClass}
      >
        <option value="">Visi reģioni</option>
        {regioni.map((r) => (
          <option key={r.id} value={r.slug}>
            {r.nosaukums}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={datums}
        onChange={(e) => setDatums(e.target.value)}
        className={selectClass}
      />

      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-brand text-brand-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition whitespace-nowrap"
      >
        <Search className="h-4 w-4" />
        Meklēt
      </button>
    </form>
  )
}
