'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

type SendState = 'idle' | 'loading' | 'ok' | 'err'

type Prospect = {
  id: string
  vards: string
  uzvards: string
  telefons: string
  whatsapp: string | null
  valoda: string
  statuss: string
  regions: string | null
  demo_url: string | null
  piezimes: string | null
  created_at: string | null
  _zinojumi_count?: number
}

type Stats = {
  total: number
  jauns: number
  nosutits: number
  atbildeja: number
  demo_nosutits: number
  maksatajs: number
  atteicas: number
}

const STATUSI = ['jauns', 'nosutits', 'atbildeja', 'demo_nosutits', 'maksatajs', 'atteicas'] as const

const STATUSS_LABEL: Record<string, string> = {
  jauns: 'Jauns',
  nosutits: 'Nosūtīts',
  atbildeja: 'Atbildēja',
  demo_nosutits: 'Demo nosūtīts',
  maksatajs: 'Maksātājs',
  atteicas: 'Atteicās',
}

const STATUSS_COLOR: Record<string, string> = {
  jauns: 'bg-gray-100 text-gray-700',
  nosutits: 'bg-blue-100 text-blue-700',
  atbildeja: 'bg-yellow-100 text-yellow-700',
  demo_nosutits: 'bg-purple-100 text-purple-700',
  maksatajs: 'bg-green-100 text-green-700',
  atteicas: 'bg-red-100 text-red-700',
}

const PAGE_SIZE = 50

export default function CrmPage() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [activeTab, setActiveTab] = useState<string>('visi')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [sendStates, setSendStates] = useState<Record<string, { sms: SendState; wa: SendState }>>({})

  const fetchProspects = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
    })
    if (activeTab !== 'visi') params.set('statuss', activeTab)

    const res = await fetch(`/api/crm/prospects?${params}`)
    if (res.ok) {
      const data = await res.json()
      setProspects(data.prospects)
      setTotal(data.total)
      setStats(data.stats)
    }
    setLoading(false)
  }, [page, activeTab])

  useEffect(() => {
    fetchProspects()
  }, [fetchProspects])

  async function updateStatuss(id: string, statuss: string) {
    setUpdatingId(id)
    await fetch(`/api/crm/prospects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statuss }),
    })
    setProspects(prev => prev.map(p => p.id === id ? { ...p, statuss } : p))
    setUpdatingId(null)
  }

  async function sendMessage(prospectId: string, kanals: 'sms' | 'wa') {
    setSendStates(prev => ({
      ...prev,
      [prospectId]: { ...prev[prospectId] ?? { sms: 'idle', wa: 'idle' }, [kanals]: 'loading' },
    }))
    const endpoint = kanals === 'sms' ? '/api/crm/send-sms' : '/api/crm/send-whatsapp'
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prospect_id: prospectId }),
    })
    const next: SendState = res.ok ? 'ok' : 'err'
    setSendStates(prev => ({
      ...prev,
      [prospectId]: { ...prev[prospectId] ?? { sms: 'idle', wa: 'idle' }, [kanals]: next },
    }))
    if (res.ok) {
      setProspects(prev => prev.map(p => p.id === prospectId ? { ...p, statuss: 'nosutits' } : p))
      setTimeout(() => setSendStates(prev => ({
        ...prev,
        [prospectId]: { ...prev[prospectId] ?? { sms: 'idle', wa: 'idle' }, [kanals]: 'idle' },
      })), 3000)
    }
  }

  async function deleteProspect(id: string) {
    if (!confirm('GDPR: dzēst personu datus? Darbību nevar atsaukt.')) return
    await fetch(`/api/crm/prospects/${id}`, { method: 'DELETE' })
    setProspects(prev => prev.filter(p => p.id !== id))
    setTotal(prev => prev - 1)
  }

  const tabs = [
    { key: 'visi', label: 'Visi', count: stats?.total },
    { key: 'jauns', label: 'Jauni', count: stats?.jauns },
    { key: 'demo_nosutits', label: 'Demo nosūtīts', count: stats?.demo_nosutits },
    { key: 'maksatajs', label: 'Maksātāji', count: stats?.maksatajs },
    { key: 'atteicas', label: 'Atteicās', count: stats?.atteicas },
  ]

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Prospects</h1>
        <a
          href="/crm/prospects/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
        >
          + Jauns
        </a>
      </div>

      {stats && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
          {STATUSI.map(s => (
            <div key={s} className="bg-white rounded-lg border border-gray-200 p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats[s as keyof Stats] ?? 0}
              </div>
              <div className="text-xs text-gray-500 mt-1">{STATUSS_LABEL[s]}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setActiveTab(t.key); setPage(0) }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === t.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="ml-1.5 text-xs text-gray-400">({t.count})</span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Ielādē...</div>
        ) : prospects.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Nav prospects</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vārds</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Telefons</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reģions</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Valoda</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statuss</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Datums</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {prospects.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <Link href={`/crm/prospects/${p.id}`} className="hover:underline">
                      {p.vards} {p.uzvards}
                    </Link>
                    {p.piezimes && (
                      <span className="ml-2 text-xs text-gray-400" title={p.piezimes}>📝</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <a href={`tel:${p.telefons}`} className="hover:underline">{p.telefons}</a>
                    {p.whatsapp && (
                      <a
                        href={`https://wa.me/${p.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener"
                        className="ml-1 text-green-600"
                        title="WhatsApp"
                      >
                        WA
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.regions ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs uppercase font-medium text-gray-500">{p.valoda}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={p.statuss}
                      disabled={updatingId === p.id}
                      onChange={e => updateStatuss(p.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 ${STATUSS_COLOR[p.statuss] ?? ''}`}
                    >
                      {STATUSI.map(s => (
                        <option key={s} value={s}>{STATUSS_LABEL[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString('lv') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end flex-wrap">
                      {(() => {
                        const st = sendStates[p.id] ?? { sms: 'idle', wa: 'idle' }
                        return (
                          <>
                            <button
                              onClick={() => sendMessage(p.id, 'sms')}
                              disabled={st.sms === 'loading'}
                              className={`text-xs px-2 py-1 rounded font-medium transition ${
                                st.sms === 'ok' ? 'bg-green-100 text-green-700' :
                                st.sms === 'err' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }`}
                            >
                              {st.sms === 'loading' ? '...' : st.sms === 'ok' ? '📱✓' : st.sms === 'err' ? '📱!' : '📱 SMS'}
                            </button>
                            <button
                              onClick={() => sendMessage(p.id, 'wa')}
                              disabled={st.wa === 'loading'}
                              className={`text-xs px-2 py-1 rounded font-medium transition ${
                                st.wa === 'ok' ? 'bg-green-100 text-green-700' :
                                st.wa === 'err' ? 'bg-red-100 text-red-700' :
                                'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {st.wa === 'loading' ? '...' : st.wa === 'ok' ? '💬✓' : st.wa === 'err' ? '💬!' : '💬 WA'}
                            </button>
                          </>
                        )
                      })()}
                      {p.demo_url && (
                        <a href={p.demo_url} target="_blank" rel="noopener"
                          className="text-xs text-purple-600 hover:underline px-1">
                          Demo
                        </a>
                      )}
                      <button
                        onClick={() => deleteProspect(p.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition px-1"
                      >
                        Dzēst
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Rāda {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} no {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 0}
              className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              ← Iepr.
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Nākamā →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
