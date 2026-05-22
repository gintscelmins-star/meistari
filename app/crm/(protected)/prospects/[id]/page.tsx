'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

type DarbaLaiksRinda = { diena: string; no: string; lidz: string; strada: boolean }

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
  anketa_aizpildita: boolean
  anketa_apstiprinata: boolean
  anketa_unique_code: string | null
  email: string | null
  apraksts: string | null
  foto_hero: string | null
  foto_darbs_1: string | null
  foto_darbs_2: string | null
  foto_darbs_3: string | null
  foto_darbs_4: string | null
  foto_profils: string | null
  darba_laiki: DarbaLaiksRinda[] | null
  pakalpojumi: string[] | null
}

type Zinojums = {
  id: string
  kanals: string
  virziens: string
  teksts: string | null
  statuss: string
  izveidots_at: string | null
}

const STATUSI = ['jauns', 'nosutits', 'atbildeja', 'anketa_nosutita', 'gaida_apstiprinasanu', 'demo_nosutits', 'maksatajs', 'atteicas']
const STATUSS_LABEL: Record<string, string> = {
  jauns: 'Jauns', nosutits: 'Nosūtīts', atbildeja: 'Atbildēja',
  anketa_nosutita: 'Anketa nosūtīta', gaida_apstiprinasanu: 'Gaida apstiprin.',
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

  const [anketaApraksts, setAnketaApraksts] = useState('')
  const [approving, setApproving] = useState(false)
  const [approveOk, setApproveOk] = useState(false)
  const [approveErr, setApproveErr] = useState('')

  const fetchData = useCallback(async () => {
    const [pRes, zRes] = await Promise.all([
      fetch(`/api/crm/prospects/${id}`),
      fetch(`/api/crm/prospects/${id}/zinojumi`),
    ])
    if (pRes.ok) {
      const p: Prospect = await pRes.json()
      setProspect(p)
      setPiezimes(p.piezimes ?? '')
      setAnketaApraksts(p.apraksts ?? '')
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

  async function handleApprove() {
    setApproving(true)
    setApproveErr('')
    const res = await fetch(`/api/crm/approve-meistars/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apraksts: anketaApraksts }),
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setApproveErr(d.error ?? 'Kļūda')
      setApproving(false)
      return
    }
    setApproveOk(true)
    await fetchData()
    setApproving(false)
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

  const showAnketa = prospect.anketa_aizpildita && !prospect.anketa_apstiprinata
  const fotos = [
    { key: 'hero', label: 'Hero', url: prospect.foto_hero },
    { key: 'darbs_1', label: 'Vannas istaba', url: prospect.foto_darbs_1 },
    { key: 'darbs_2', label: 'Caurules', url: prospect.foto_darbs_2 },
    { key: 'darbs_3', label: 'Boilers', url: prospect.foto_darbs_3 },
    { key: 'darbs_4', label: 'WC', url: prospect.foto_darbs_4 },
    { key: 'profils', label: 'Profils', url: prospect.foto_profils },
  ]

  return (
    <div className="p-6 max-w-3xl">
      <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-700 mb-4">
        ← Atpakaļ
      </button>

      {/* Anketa apstiprinasana */}
      {showAnketa && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📋</span>
            <h2 className="text-base font-bold text-amber-900">Anketa aizpildīta — gaida apstiprināšanu</h2>
          </div>

          {prospect.email && (
            <p className="text-sm text-gray-600 mb-3">E-pasts: <strong>{prospect.email}</strong></p>
          )}

          {prospect.pakalpojumi && prospect.pakalpojumi.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Pakalpojumi:</p>
              <div className="flex flex-wrap gap-1">
                {prospect.pakalpojumi.map(p => (
                  <span key={p} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{p}</span>
                ))}
              </div>
            </div>
          )}

          {/* Foto galerija */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {fotos.filter(f => f.url).map(f => (
              <div key={f.key}>
                <img src={f.url!} alt={f.label} className="w-full h-24 object-cover rounded-lg" />
                <p className="text-xs text-gray-500 text-center mt-0.5">{f.label}</p>
              </div>
            ))}
          </div>

          {prospect.darba_laiki && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Darba laiki:</p>
              <div className="text-xs text-gray-600 space-y-0.5">
                {prospect.darba_laiki.filter(r => r.strada).map(r => (
                  <div key={r.diena}>{r.diena}: {r.no}–{r.lidz}</div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 mb-4">
            <label className="text-xs font-medium text-gray-500">Apraksts (var rediģēt):</label>
            <textarea
              value={anketaApraksts}
              onChange={e => setAnketaApraksts(e.target.value)}
              rows={4}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {approveErr && <p className="text-red-500 text-sm mb-3">{approveErr}</p>}
          {approveOk && <p className="text-green-600 text-sm mb-3">✓ Lapa publicēta! SMS nosūtīts meistarim.</p>}

          <button
            onClick={handleApprove}
            disabled={approving || approveOk}
            className="bg-green-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition"
          >
            {approving ? 'Publicē...' : approveOk ? '✓ Publicēts' : '✓ Apstiprināt un publicēt'}
          </button>
        </div>
      )}

      {prospect.anketa_apstiprinata && prospect.demo_url && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-green-800">✓ Lapa ir live</p>
            <a href={prospect.demo_url} target="_blank" rel="noopener"
              className="text-xs text-green-600 hover:underline">{prospect.demo_url}</a>
          </div>
          <a href={prospect.demo_url} target="_blank" rel="noopener"
            className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition">
            Skatīt →
          </a>
        </div>
      )}

      {prospect.anketa_unique_code && !prospect.anketa_aizpildita && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <p className="text-sm font-medium text-blue-800">📋 Anketa nosūtīta — vēl nav aizpildīta</p>
          <p className="text-xs text-blue-600 mt-1 break-all">
            https://promeistars.lv/anketa/{prospect.anketa_unique_code}
          </p>
        </div>
      )}

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
