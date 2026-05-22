'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

const REGIONI_SARAKSTS = [
  'Rīga', 'Jūrmala', 'Mārupe', 'Ķekava', 'Salaspils',
  'Jelgava', 'Ogre', 'Sigulda', 'Liepāja', 'Daugavpils', 'Ventspils',
]

type ProspectForm = {
  vards: string
  uzvards: string
  telefons: string
  whatsapp: boolean
  valoda: 'lv' | 'ru'
  nodarbosanas: 'santehnikis' | 'elektrikis'
  regions: string[]
  ss_url: string
  piezimes: string
  demo_slug: string
}

export default function EditProspectPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [form, setForm] = useState<ProspectForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/crm/prospects/${id}`)
      .then(r => r.json())
      .then(p => {
        setForm({
          vards: p.vards ?? '',
          uzvards: p.uzvards ?? '',
          telefons: p.telefons ?? '',
          whatsapp: !!p.whatsapp,
          valoda: p.valoda === 'ru' ? 'ru' : 'lv',
          nodarbosanas: p.nodarbosanas === 'elektrikis' ? 'elektrikis' : 'santehnikis',
          regions: p.regions ? p.regions.split(',').map((r: string) => r.trim()).filter(Boolean) : [],
          ss_url: p.ss_url ?? '',
          piezimes: p.piezimes ?? '',
          demo_slug: p.demo_slug ?? '',
        })
        setLoading(false)
      })
  }, [id])

  function set<K extends keyof ProspectForm>(key: K, val: ProspectForm[K]) {
    setForm(f => f ? { ...f, [key]: val } : f)
  }

  function toggleRegion(r: string) {
    if (!form) return
    set('regions', form.regions.includes(r)
      ? form.regions.filter(x => x !== r)
      : [...form.regions, r]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    setError('')

    const wa = form.whatsapp ? form.telefons.replace(/\D/g, '') : null

    const res = await fetch(`/api/crm/prospects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vards: form.vards,
        uzvards: form.uzvards,
        telefons: form.telefons,
        whatsapp: wa,
        valoda: form.valoda,
        nodarbosanas: form.nodarbosanas,
        regions: form.regions.join(', ') || null,
        ss_url: form.ss_url || null,
        piezimes: form.piezimes || null,
        demo_slug: form.demo_slug || null,
      }),
    })

    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Saglabāšanas kļūda')
      setSaving(false)
      return
    }

    router.push(`/crm/prospects/${id}`)
  }

  if (loading) return <div className="p-8 text-sm text-gray-400">Ielādē...</div>
  if (!form) return <div className="p-8 text-sm text-red-500">Nav atrasts</div>

  return (
    <div className="p-6 max-w-xl">
      <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-700 mb-4">
        ← Atpakaļ
      </button>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Rediģēt prospect</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
        {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded">{error}</p>}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Vārds *</label>
            <input
              value={form.vards}
              onChange={e => set('vards', e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Uzvārds</label>
            <input
              value={form.uzvards}
              onChange={e => set('uzvards', e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Telefons *</label>
          <input
            value={form.telefons}
            onChange={e => set('telefons', e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.whatsapp}
            onChange={e => set('whatsapp', e.target.checked)}
            className="rounded"
          />
          WhatsApp (tas pats numurs)
        </label>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Nodarbošanās</label>
          <div className="flex gap-2">
            {([
              { id: 'santehnikis', label: '🔧 Santehniķis' },
              { id: 'elektrikis', label: '⚡ Elektriķis' },
            ] as const).map(n => (
              <button key={n.id} type="button" onClick={() => set('nodarbosanas', n.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                  form.nodarbosanas === n.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}>
                {n.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Valoda</label>
          <div className="flex gap-2">
            {(['lv', 'ru'] as const).map(v => (
              <button key={v} type="button" onClick={() => set('valoda', v)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                  form.valoda === v
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}>
                {v.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Reģioni</label>
          <div className="flex flex-wrap gap-2">
            {REGIONI_SARAKSTS.map(r => (
              <button key={r} type="button" onClick={() => toggleRegion(r)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                  form.regions.includes(r)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Ss.lv URL</label>
          <input
            value={form.ss_url}
            onChange={e => set('ss_url', e.target.value)}
            placeholder="https://www.ss.lv/..."
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Demo slug</label>
          <input
            value={form.demo_slug}
            onChange={e => set('demo_slug', e.target.value)}
            placeholder="janis-berzins-santehnikis"
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Piezīmes</label>
          <textarea
            value={form.piezimes}
            onChange={e => set('piezimes', e.target.value)}
            rows={3}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white rounded-lg px-6 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {saving ? 'Saglabā...' : 'Saglabāt'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            Atcelt
          </button>
        </div>
      </form>
    </div>
  )
}
