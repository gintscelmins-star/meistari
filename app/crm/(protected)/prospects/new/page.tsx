'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type CsvRow = { vards: string; uzvards: string; telefons: string; regions?: string }

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split('\n').filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = cols[i] ?? '' })
    return {
      vards: row['vards'] ?? row['name'] ?? '',
      uzvards: row['uzvards'] ?? row['surname'] ?? '',
      telefons: row['telefons'] ?? row['phone'] ?? '',
      regions: row['regions'] ?? row['region'] ?? undefined,
    }
  }).filter(r => r.vards && r.telefons)
}

export default function NewProspectPage() {
  const router = useRouter()

  const [vards, setVards] = useState('')
  const [uzvards, setUzvards] = useState('')
  const [telefons, setTelefons] = useState('+371 ')
  const [whatsapp, setWhatsapp] = useState(false)
  const [valoda, setValoda] = useState<'lv' | 'ru'>('lv')
  const [nodarbosanas, setNodarbosanas] = useState<'santehnikis' | 'elektrikis'>('santehnikis')
  const [regions, setRegions] = useState('')
  const [piezimes, setPiezimes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [csvText, setCsvText] = useState('')
  const [csvPreview, setCsvPreview] = useState<CsvRow[]>([])
  const [csvLoading, setCsvLoading] = useState(false)
  const [csvDone, setCsvDone] = useState(false)

  const demoSlug = vards || uzvards
    ? slugify(`${vards}-${uzvards}`.trim()) || 'meistars'
    : ''

  function handleCsvChange(text: string) {
    setCsvText(text)
    setCsvDone(false)
    const rows = parseCsv(text)
    setCsvPreview(rows.slice(0, 5))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const wa = whatsapp ? telefons.replace(/\D/g, '') : null

    const res = await fetch('/api/crm/prospects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vards, uzvards, telefons, whatsapp: wa,
        valoda, nodarbosanas, regions: regions || null,
        piezimes: piezimes || null,
        demo_slug: demoSlug || null,
        gdpr_piekrits: false,
      }),
    })

    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Kļūda')
      setLoading(false)
      return
    }

    router.push('/crm')
  }

  async function handleCsvImport() {
    const rows = parseCsv(csvText)
    if (rows.length === 0) return
    setCsvLoading(true)
    setError('')

    const res = await fetch('/api/crm/prospects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows.map(r => ({
        vards: r.vards,
        uzvards: r.uzvards,
        telefons: r.telefons.startsWith('+') ? r.telefons : `+371${r.telefons}`,
        regions: r.regions ?? null,
        valoda: 'lv',
        gdpr_piekrits: false,
      }))),
    })

    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'CSV kļūda')
    } else {
      setCsvDone(true)
      setCsvText('')
      setCsvPreview([])
    }
    setCsvLoading(false)
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Jauns prospect</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4 mb-8">
        {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded">{error}</p>}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Vārds *</label>
            <input
              value={vards}
              onChange={e => setVards(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Uzvārds *</label>
            <input
              value={uzvards}
              onChange={e => setUzvards(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Telefons *</label>
          <input
            value={telefons}
            onChange={e => setTelefons(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+371 2000 0000"
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={whatsapp}
              onChange={e => setWhatsapp(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700">WhatsApp (tas pats numurs)</span>
          </label>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Nodarbošanās</label>
          <div className="flex gap-2">
            {([
              { id: 'santehnikis', label: '🔧 Santehniķis' },
              { id: 'elektrikis', label: '⚡ Elektriķis' },
            ] as const).map(n => (
              <button
                key={n.id}
                type="button"
                onClick={() => setNodarbosanas(n.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                  nodarbosanas === n.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Valoda</label>
          <div className="flex gap-2">
            {(['lv', 'ru'] as const).map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setValoda(v)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                  valoda === v
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {v.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Reģions</label>
          <input
            value={regions}
            onChange={e => setRegions(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Rīga"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Piezīmes</label>
          <textarea
            value={piezimes}
            onChange={e => setPiezimes(e.target.value)}
            rows={2}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {demoSlug && (
          <p className="text-xs text-gray-400">
            Demo slug: <code className="bg-gray-100 px-1 rounded">{demoSlug}</code>
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white rounded-lg px-6 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Saglabā...' : 'Saglabāt'}
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

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">CSV imports</h2>
        <p className="text-xs text-gray-500 mb-3">
          Formāts: <code className="bg-gray-100 px-1 rounded">vards,uzvards,telefons,regions</code>
        </p>
        <textarea
          value={csvText}
          onChange={e => handleCsvChange(e.target.value)}
          rows={6}
          className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y mb-3"
          placeholder={'vards,uzvards,telefons,regions\nJānis,Bērziņš,+37120000001,Rīga'}
        />

        {csvPreview.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 mb-2">
              Priekšskatījums (pirmās {csvPreview.length} rindas):
            </p>
            <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-500">Vārds</th>
                  <th className="px-3 py-2 text-left text-gray-500">Uzvārds</th>
                  <th className="px-3 py-2 text-left text-gray-500">Telefons</th>
                  <th className="px-3 py-2 text-left text-gray-500">Reģions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {csvPreview.map((r, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2">{r.vards}</td>
                    <td className="px-3 py-2">{r.uzvards}</td>
                    <td className="px-3 py-2">{r.telefons}</td>
                    <td className="px-3 py-2">{r.regions ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {csvDone && (
          <p className="text-green-600 text-sm mb-3">Imports veiksmīgs!</p>
        )}

        <button
          onClick={handleCsvImport}
          disabled={csvLoading || csvPreview.length === 0}
          className="bg-gray-800 text-white rounded-lg px-5 py-2 text-sm font-semibold hover:bg-gray-900 disabled:opacity-40 transition"
        >
          {csvLoading ? 'Importē...' : `Importēt (${parseCsv(csvText).length} ieraksti)`}
        </button>
      </div>
    </div>
  )
}
