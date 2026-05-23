'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewMeistarsPage() {
  const router = useRouter()
  const [form, setForm] = useState({ vards: '', uzvards: '', telefons: '', valoda: 'lv' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.vards || !form.telefons) return
    setSaving(true)
    setError('')

    // Create prospect via existing endpoint
    const res = await fetch('/api/crm/prospects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vards: form.vards.trim(),
        uzvards: form.uzvards.trim(),
        telefons: form.telefons.trim(),
        valoda: form.valoda,
        statuss: 'jauns',
      }),
    })

    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Kļūda')
      setSaving(false)
      return
    }

    const { id } = await res.json()
    router.push(`/crm/meistari/${id}/edit`)
  }

  return (
    <div className="p-6 max-w-md">
      <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-700 mb-4">
        ← Atpakaļ
      </button>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Jauns meistars</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
        {error && <p className="text-red-500 text-sm bg-red-50 rounded px-3 py-2">{error}</p>}

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Vārds *</label>
            <input value={form.vards} onChange={e => setForm(f => ({ ...f, vards: e.target.value }))}
              required className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Uzvārds *</label>
            <input value={form.uzvards} onChange={e => setForm(f => ({ ...f, uzvards: e.target.value }))}
              required className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Telefons *</label>
          <input value={form.telefons} onChange={e => setForm(f => ({ ...f, telefons: e.target.value }))}
            placeholder="+37126000000" required
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="flex gap-2">
          {(['lv', 'ru'] as const).map(v => (
            <button key={v} type="button" onClick={() => setForm(f => ({ ...f, valoda: v }))}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition ${form.valoda === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
              {v.toUpperCase()}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400">
          Pēc izveidošanas tiks atvērts pilnais profila redaktors ar visām 13 sadaļām.
        </p>

        <button type="submit" disabled={saving}
          className="bg-blue-600 text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
          {saving ? 'Izveido...' : 'Izveidot un turpināt →'}
        </button>
      </form>
    </div>
  )
}
