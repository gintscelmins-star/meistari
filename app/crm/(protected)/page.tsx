'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { SMS_TEKSTI } from '@/lib/sms-teksti'

type SendState = 'idle' | 'loading' | 'ok' | 'err'

type SmsModal = { prospect: Prospect; teksts: string } | null
type BulkSmsModal = { teksts: string; kanals: 'sms' | 'wa' } | null

type Prospect = {
  id: string
  vards: string
  uzvards: string
  telefons: string
  whatsapp: string | null
  valoda: string
  statuss: string
  regions: string | null
  ss_url: string | null
  demo_url: string | null
  trial_beigas: string | null
  lapa_izveidota: boolean
  piezimes: string | null
  created_at: string | null
  _zinojumi_count?: number
}

function TrialCountdown({ trialBeigas }: { trialBeigas: string | null }) {
  if (!trialBeigas) return <span className="text-gray-300 text-xs">—</span>
  const days = Math.ceil((new Date(trialBeigas).getTime() - Date.now()) / 86400000)
  if (days < 0) return <span className="text-xs font-medium text-red-500">Beidzies</span>
  if (days <= 3) return <span className="text-xs font-medium text-orange-500">{days}d</span>
  if (days <= 7) return <span className="text-xs font-medium text-yellow-600">{days}d</span>
  return <span className="text-xs font-medium text-green-600">{days}d</span>
}

type Stats = {
  total: number
  jauns: number
  nosutits: number
  atbildeja: number
  anketa_nosutita: number
  gaida_apstiprinasanu: number
  demo_nosutits: number
  maksatajs: number
  atteicas: number
}

const STATUSI = ['jauns', 'nosutits', 'atbildeja', 'anketa_nosutita', 'gaida_apstiprinasanu', 'demo_nosutits', 'maksatajs', 'atteicas'] as const

const STATUSS_LABEL: Record<string, string> = {
  jauns: 'Jauns',
  nosutits: 'Nosūtīts',
  atbildeja: 'Atbildēja',
  anketa_nosutita: 'Anketa nosūtīta',
  gaida_apstiprinasanu: 'Gaida apstiprin.',
  demo_nosutits: 'Demo nosūtīts',
  maksatajs: 'Maksātājs',
  atteicas: 'Atteicās',
}

const STATUSS_COLOR: Record<string, string> = {
  jauns: 'bg-gray-100 text-gray-700',
  nosutits: 'bg-blue-100 text-blue-700',
  atbildeja: 'bg-yellow-100 text-yellow-700',
  anketa_nosutita: 'bg-indigo-100 text-indigo-700',
  gaida_apstiprinasanu: 'bg-amber-100 text-amber-700',
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
  const [smsModal, setSmsModal] = useState<SmsModal>(null)
  const [modalSending, setModalSending] = useState(false)

  // Bulk selection
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkResult, setBulkResult] = useState<string | null>(null)
  const [bulkSmsModal, setBulkSmsModal] = useState<BulkSmsModal>(null)

  const fetchProspects = useCallback(async () => {
    setLoading(true)
    setSelected(new Set())
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
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

  useEffect(() => { fetchProspects() }, [fetchProspects])

  // --- Checkbox helpers ---
  const allSelected = prospects.length > 0 && prospects.every(p => selected.has(p.id))
  const someSelected = selected.size > 0

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(prospects.map(p => p.id)))
    }
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // --- Individual actions ---
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

  function openSmsModal(p: Prospect) {
    const valoda = (p.valoda === 'ru' ? 'RU' : 'LV') as 'LV' | 'RU'
    const defaultTeksts = SMS_TEKSTI[valoda].pirmais(p.vards, p.demo_url ?? 'promeistars.lv')
    setSmsModal({ prospect: p, teksts: defaultTeksts })
  }

  async function submitSmsModal() {
    if (!smsModal) return
    setModalSending(true)
    const { prospect, teksts } = smsModal
    setSendStates(prev => ({
      ...prev,
      [prospect.id]: { ...prev[prospect.id] ?? { sms: 'idle', wa: 'idle' }, sms: 'loading' },
    }))
    const res = await fetch('/api/crm/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prospect_id: prospect.id, custom_teksts: teksts }),
    })
    const next: SendState = res.ok ? 'ok' : 'err'
    setSendStates(prev => ({
      ...prev,
      [prospect.id]: { ...prev[prospect.id] ?? { sms: 'idle', wa: 'idle' }, sms: next },
    }))
    if (res.ok) setProspects(prev => prev.map(p => p.id === prospect.id ? { ...p, statuss: 'nosutits' } : p))
    setModalSending(false)
    setSmsModal(null)
  }

  async function deleteProspect(id: string) {
    if (!confirm('GDPR: dzēst personu datus? Darbību nevar atsaukt.')) return
    await fetch(`/api/crm/prospects/${id}`, { method: 'DELETE' })
    setProspects(prev => prev.filter(p => p.id !== id))
    setTotal(prev => prev - 1)
  }

  // --- Bulk actions ---
  async function bulkAction(action: string, extra?: Record<string, string>) {
    if (selected.size === 0) return
    setBulkLoading(true)
    setBulkResult(null)
    const ids = [...selected]
    const res = await fetch('/api/crm/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ids, ...extra }),
    })
    const data = await res.json()
    if (res.ok) {
      if (action === 'delete') {
        setProspects(prev => prev.filter(p => !selected.has(p.id)))
        setTotal(prev => prev - ids.length)
        setBulkResult(`Dzēsti ${ids.length} ieraksti`)
      } else if (action === 'statuss') {
        const newStatuss = extra?.statuss ?? ''
        setProspects(prev => prev.map(p => selected.has(p.id) ? { ...p, statuss: newStatuss } : p))
        setBulkResult(`Statuss mainīts ${ids.length} ierakstiem`)
      } else if (action === 'sms' || action === 'wa') {
        setProspects(prev => prev.map(p => selected.has(p.id) ? { ...p, statuss: 'nosutits' } : p))
        setBulkResult(`Nosūtīts: ${data.sent}, kļūdas: ${data.failed}`)
      }
      setSelected(new Set())
    } else {
      setBulkResult(`Kļūda: ${data.error}`)
    }
    setBulkLoading(false)
    setTimeout(() => setBulkResult(null), 5000)
  }

  function openBulkSms(kanals: 'sms' | 'wa') {
    setBulkSmsModal({ teksts: 'Sveiks! promeistars.lv — pieteikties kā meistars.', kanals })
  }

  async function submitBulkSms() {
    if (!bulkSmsModal) return
    await bulkAction(bulkSmsModal.kanals, { teksts: bulkSmsModal.teksts })
    setBulkSmsModal(null)
  }

  const tabs = [
    { key: 'visi', label: 'Visi', count: stats?.total },
    { key: 'jauns', label: 'Jauni', count: stats?.jauns },
    { key: 'gaida_apstiprinasanu', label: 'Gaida apstiprin.', count: stats?.gaida_apstiprinasanu },
    { key: 'maksatajs', label: 'Maksātāji', count: stats?.maksatajs },
    { key: 'atteicas', label: 'Atteicās', count: stats?.atteicas },
  ]

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Prospects</h1>
        <a href="/crm/prospects/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
          + Jauns
        </a>
      </div>

      {stats && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
          {STATUSI.map(s => (
            <div key={s} className="bg-white rounded-lg border border-gray-200 p-3 text-center cursor-pointer hover:border-blue-300 transition"
              onClick={() => { setActiveTab(s); setPage(0) }}>
              <div className="text-2xl font-bold text-gray-900">{stats[s as keyof Stats] ?? 0}</div>
              <div className="text-xs text-gray-500 mt-1">{STATUSS_LABEL[s]}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {tabs.map(t => (
          <button key={t.key}
            onClick={() => { setActiveTab(t.key); setPage(0) }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
            {t.count !== undefined && <span className="ml-1.5 text-xs text-gray-400">({t.count})</span>}
          </button>
        ))}
      </div>

      {/* Bulk action josla */}
      {someSelected && (
        <div className="mb-3 flex flex-wrap items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
          <span className="text-sm font-semibold text-blue-700 mr-1">
            {selected.size} atlasīti
          </span>
          <button onClick={() => openBulkSms('sms')} disabled={bulkLoading}
            className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            📱 Sūtīt SMS
          </button>
          <button onClick={() => openBulkSms('wa')} disabled={bulkLoading}
            className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 transition">
            💬 Sūtīt WA
          </button>
          <select
            disabled={bulkLoading}
            defaultValue=""
            onChange={e => { if (e.target.value) bulkAction('statuss', { statuss: e.target.value }) }}
            className="text-xs rounded-lg border border-gray-300 px-2 py-1.5 bg-white text-gray-700 disabled:opacity-50">
            <option value="" disabled>Mainīt statusu...</option>
            {STATUSI.map(s => <option key={s} value={s}>{STATUSS_LABEL[s]}</option>)}
          </select>
          <button
            disabled={bulkLoading}
            onClick={() => {
              if (!confirm(`Dzēst ${selected.size} ierakstus? Darbību nevar atsaukt.`)) return
              bulkAction('delete')
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 font-medium hover:bg-red-200 disabled:opacity-50 transition">
            Dzēst
          </button>
          <button onClick={() => setSelected(new Set())}
            className="text-xs text-gray-400 hover:text-gray-600 ml-auto">
            × Atcelt
          </button>
          {bulkLoading && <span className="text-xs text-blue-600 animate-pulse">Apstrādā...</span>}
          {bulkResult && <span className="text-xs font-medium text-green-700">{bulkResult}</span>}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Ielādē...</div>
        ) : prospects.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Nav prospects</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 w-8">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="rounded text-blue-600 cursor-pointer" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vārds</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Telefons</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reģions</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Valoda</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statuss</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Datums</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trial</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {prospects.map(p => {
                const isSelected = selected.has(p.id)
                return (
                  <tr key={p.id} className={`transition ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-3 py-3">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(p.id)}
                        className="rounded text-blue-600 cursor-pointer" />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link href={`/crm/prospects/${p.id}`} className="hover:underline">
                        {p.vards} {p.uzvards}
                      </Link>
                      {p.piezimes && <span className="ml-2 text-xs text-gray-400" title={p.piezimes}>📝</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <a href={`tel:${p.telefons}`} className="hover:underline">{p.telefons}</a>
                      {p.whatsapp && (
                        <a href={`https://wa.me/${p.whatsapp.replace(/\D/g, '')}`}
                          target="_blank" rel="noopener"
                          className="ml-1 text-green-600" title="WhatsApp">WA</a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {p.regions ?? '—'}
                      {p.ss_url && (
                        <a href={p.ss_url} target="_blank" rel="noopener noreferrer"
                          className="ml-1.5 text-blue-500 hover:text-blue-700 font-medium" title="Atvērt ss.lv sludinājumu">ss↗</a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs uppercase font-medium text-gray-500">{p.valoda}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={p.statuss}
                        disabled={updatingId === p.id}
                        onChange={e => updateStatuss(p.id, e.target.value)}
                        className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 ${STATUSS_COLOR[p.statuss] ?? ''}`}>
                        {STATUSI.map(s => <option key={s} value={s}>{STATUSS_LABEL[s]}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('lv') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <TrialCountdown trialBeigas={p.trial_beigas} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end flex-wrap">
                        {(() => {
                          const st = sendStates[p.id] ?? { sms: 'idle', wa: 'idle' }
                          return (
                            <>
                              <button onClick={() => openSmsModal(p)}
                                className={`text-xs px-2 py-1 rounded font-medium transition ${
                                  st.sms === 'ok' ? 'bg-green-100 text-green-700' :
                                  st.sms === 'err' ? 'bg-red-100 text-red-700' :
                                  p.statuss === 'atbildeja' ? 'bg-green-100 text-green-700' :
                                  'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}>
                                {st.sms === 'ok' ? '📱✓' : st.sms === 'err' ? '📱!' : p.statuss === 'atbildeja' ? '📱 Atb.✓' : '📱'}
                              </button>
                              <button onClick={() => sendMessage(p.id, 'wa')}
                                disabled={st.wa === 'loading'}
                                className={`text-xs px-2 py-1 rounded font-medium transition ${
                                  st.wa === 'ok' ? 'bg-green-100 text-green-700' :
                                  st.wa === 'err' ? 'bg-red-100 text-red-700' :
                                  'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}>
                                {st.wa === 'loading' ? '...' : st.wa === 'ok' ? '💬✓' : st.wa === 'err' ? '💬!' : '💬'}
                              </button>
                            </>
                          )
                        })()}
                        {p.demo_url && (
                          <a href={p.demo_url} target="_blank" rel="noopener"
                            className="text-xs text-purple-600 hover:underline px-1">Demo</a>
                        )}
                        <Link href={`/crm/prospects/${p.id}/edit`}
                          className="text-xs text-gray-500 hover:text-gray-800 transition px-1" title="Rediģēt">✏️</Link>
                        <button onClick={() => deleteProspect(p.id)}
                          className="text-xs text-red-400 hover:text-red-600 transition px-1">✕</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
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
            <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
              className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">← Iepr.</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">Nākamā →</button>
          </div>
        </div>
      )}

      {/* Individuālais SMS modāls */}
      {smsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={e => { if (e.target === e.currentTarget) setSmsModal(null) }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                📱 SMS → {smsModal.prospect.vards} {smsModal.prospect.uzvards}
              </h2>
              <button onClick={() => setSmsModal(null)} className="text-gray-400 hover:text-gray-700 text-xl">×</button>
            </div>
            <div className="text-xs text-gray-400">{smsModal.prospect.telefons}</div>
            <textarea value={smsModal.teksts}
              onChange={e => setSmsModal(m => m ? { ...m, teksts: e.target.value } : m)}
              rows={5} autoFocus
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{smsModal.teksts.length} rakstzīmes</span>
              <div className="flex gap-2">
                <button onClick={() => setSmsModal(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800">Atcelt</button>
                <button onClick={submitSmsModal} disabled={modalSending || !smsModal.teksts.trim()}
                  className="bg-blue-600 text-white rounded-lg px-5 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
                  {modalSending ? 'Sūta...' : 'Nosūtīt SMS'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk SMS/WA modāls */}
      {bulkSmsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={e => { if (e.target === e.currentTarget) setBulkSmsModal(null) }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                {bulkSmsModal.kanals === 'sms' ? '📱 Masveida SMS' : '💬 Masveida WhatsApp'}
                <span className="ml-2 text-sm font-normal text-gray-500">→ {selected.size} cilvēki</span>
              </h2>
              <button onClick={() => setBulkSmsModal(null)} className="text-gray-400 hover:text-gray-700 text-xl">×</button>
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              Ziņa tiks nosūtīta visiem {selected.size} atlasītajiem. Pārliecinies par tekstu!
            </p>
            <textarea value={bulkSmsModal.teksts}
              onChange={e => setBulkSmsModal(m => m ? { ...m, teksts: e.target.value } : m)}
              rows={5} autoFocus
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{bulkSmsModal.teksts.length} rakstzīmes</span>
              <div className="flex gap-2">
                <button onClick={() => setBulkSmsModal(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800">Atcelt</button>
                <button onClick={submitBulkSms} disabled={bulkLoading || !bulkSmsModal.teksts.trim()}
                  className="bg-blue-600 text-white rounded-lg px-5 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
                  {bulkLoading ? 'Sūta...' : `Nosūtīt visiem ${selected.size}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
