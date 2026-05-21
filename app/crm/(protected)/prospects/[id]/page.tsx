'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

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
}

type Zinojums = {
  id: string
  kanals: string
  virziens: string
  teksts: string | null
  statuss: string
  izveidots_at: string | null
}

const STATUSI = ['jauns', 'nosutits', 'atbildeja', 'demo_nosutits', 'maksatajs', 'atteicas']
const STATUSS_LABEL: Record<string, string> = {
  jauns: 'Jauns', nosutits: 'Nosūtīts', atbildeja: 'Atbildēja',
  demo_nosutits: 'Demo nosūtīts', maksatajs: 'Maksātājs', atteicas: 'Atteicās',
}

type SendState = 'idle' | 'loading' | 'ok' | 'err'

export default function ProspectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [prospect, setProspect] = useState<Prospect | null>(null)
  const [zinojumi, setZinojumi] = useState<Zinojums[]>([])
  const [loading, setLoading] = useState(true)

  const [smsState, setSmsState] = useState<SendState>('idle')
  const [waState, setWaState] = useState<SendState>('idle')

  const [manualTeksts, setManualTeksts] = useState('')
  const [manualSending, setManualSending] = useState(false)

  const [piezimes, setPiezimes] = useState('')
  const piezimesTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchData = useCallback(async () => {
    const [pRes, zRes] = await Promise.all([
      fetch(`/api/crm/prospects/${id}`),
      fetch(`/api/crm/prospects/${id}/zinojumi`),
    ])
    if (pRes.ok) {
      const p: Prospect = await pRes.json()
      setProspect(p)
      setPiezimes(p.piezimes ?? '')
    }
    if (zRes.ok) {
      const z: Zinojums[] = await zRes.json()
      setZinojumi(z)
    }
    setLoading(false)
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  async function sendMessage(kanals: 'sms' | 'whatsapp') {
    const setState = kanals === 'sms' ? setSmsState : setWaState
    setState('loading')
    const endpoint = kanals === 'sms' ? '/api/crm/send-sms' : '/api/crm/send-whatsapp'
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prospect_id: id }),
    })
    setState(res.ok ? 'ok' : 'err')
    if (res.ok) {
      await fetchData()
      setTimeout(() => setState('idle'), 3000)
    }
  }

  async function sendManual(kanals: 'sms' | 'whatsapp') {
    if (!manualTeksts.trim()) return
    setManualSending(true)
    const endpoint = kanals === 'sms' ? '/api/crm/send-sms' : '/api/crm/send-whatsapp'
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prospect_id: id, custom_teksts: manualTeksts }),
    })
    setManualTeksts('')
    setManualSending(false)
    await fetchData()
  }

  async function updateStatuss(statuss: string) {
    await fetch(`/api/crm/prospects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statuss }),
    })
    setProspect(p => p ? { ...p, statuss } : p)
  }

  function handlePiezimesChange(val: string) {
    setPiezimes(val)
    if (piezimesTimer.current) clearTimeout(piezimesTimer.current)
    piezimesTimer.current = setTimeout(async () => {
      await fetch(`/api/crm/prospects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ piezimes: val }),
      })
    }, 800)
  }

  function btnClass(state: SendState, base: string) {
    if (state === 'loading') return `${base} opacity-60 cursor-wait`
    if (state === 'ok') return `${base} !bg-green-600`
    if (state === 'err') return `${base} !bg-red-600`
    return base
  }

  function btnLabel(state: SendState, label: string) {
    if (state === 'loading') return '...'
    if (state === 'ok') return `${label} ✓`
    if (state === 'err') return 'Kļūda'
    return label
  }

  if (loading) return <div className="p-8 text-gray-400 text-sm">Ielādē...</div>
  if (!prospect) return <div className="p-8 text-red-500 text-sm">Nav atrasts</div>

  return (
    <div className="p-6 max-w-3xl">
      <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-700 mb-4">
        ← Atpakaļ
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {prospect.vards} {prospect.uzvards}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              <a href={`tel:${prospect.telefons}`} className="hover:underline">{prospect.telefons}</a>
              {prospect.regions && <span className="ml-3">{prospect.regions}</span>}
              <span className="ml-3 uppercase text-xs font-medium">{prospect.valoda}</span>
            </p>
            {prospect.demo_url && (
              <a href={prospect.demo_url} target="_blank" rel="noopener"
                className="text-xs text-purple-600 hover:underline mt-1 inline-block">
                {prospect.demo_url}
              </a>
            )}
          </div>
          <select
            value={prospect.statuss}
            onChange={e => updateStatuss(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUSI.map(s => (
              <option key={s} value={s}>{STATUSS_LABEL[s]}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => sendMessage('sms')}
            disabled={smsState === 'loading'}
            className={btnClass(smsState, 'bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition')}
          >
            📱 {btnLabel(smsState, 'Sūtīt SMS')}
          </button>
          <button
            onClick={() => sendMessage('whatsapp')}
            disabled={waState === 'loading'}
            className={btnClass(waState, 'bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-green-700 transition')}
          >
            💬 {btnLabel(waState, 'Sūtīt WA')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Piezīmes</h2>
        <textarea
          value={piezimes}
          onChange={e => handlePiezimesChange(e.target.value)}
          rows={3}
          placeholder="Piezīmes par prospect..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Ziņojumu vēsture ({zinojumi.length})
        </h2>
        {zinojumi.length === 0 ? (
          <p className="text-sm text-gray-400">Nav ziņojumu</p>
        ) : (
          <div className="flex flex-col gap-2">
            {zinojumi.map(z => (
              <div
                key={z.id}
                className={`flex gap-3 text-sm ${z.virziens === 'in' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`rounded-lg px-3 py-2 max-w-sm ${
                  z.virziens === 'in'
                    ? 'bg-blue-50 text-blue-900'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p>{z.teksts}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {z.virziens === 'in' ? '[IN]' : '[OUT]'} {z.kanals.toUpperCase()}
                    {z.izveidots_at && ` · ${new Date(z.izveidots_at).toLocaleString('lv')}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Manuāla ziņa</h2>
        <textarea
          value={manualTeksts}
          onChange={e => setManualTeksts(e.target.value)}
          rows={3}
          placeholder="Raksti ziņu..."
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
        />
        <div className="flex gap-2">
          <button
            onClick={() => sendManual('sms')}
            disabled={manualSending || !manualTeksts.trim()}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition"
          >
            📱 Sūtīt SMS
          </button>
          <button
            onClick={() => sendManual('whatsapp')}
            disabled={manualSending || !manualTeksts.trim()}
            className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-green-700 disabled:opacity-40 transition"
          >
            💬 Sūtīt WA
          </button>
        </div>
      </div>
    </div>
  )
}
