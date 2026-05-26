'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

type LogEntry = {
  id: string
  event_type: string
  status: string
  from_number: string | null
  prospect_id: string | null
  details: Record<string, unknown> | null
  error_message: string | null
  created_at: string
}

const EVENT_LABELS: Record<string, string> = {
  incoming_sms: '📩 SMS',
  incoming_wa: '💬 WhatsApp',
  ja_response: '✅ Jā',
  anketa_sent: '📋 Anketa',
  admin_notified: '🔔 Admin',
  invalid_signature: '🔒 Inv. sig',
  unknown_sender: '❓ Nezināms',
  error: '❌ Kļūda',
}

const STATUS_CLASS: Record<string, string> = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  ignored: 'bg-gray-100 text-gray-600',
}

export default function WebhookLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [eventFilter, setEventFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deletedCount, setDeletedCount] = useState<number | null>(null)

  const fetchLogs = useCallback(async () => {
    const params = new URLSearchParams({ limit: '200' })
    if (eventFilter) params.set('event_type', eventFilter)
    if (statusFilter) params.set('status', statusFilter)

    const res = await fetch(`/api/crm/webhook-logs?${params}`)
    if (res.ok) {
      const data = await res.json()
      setLogs(data.logs ?? [])
    }
    setLoading(false)
  }, [eventFilter, statusFilter])

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [fetchLogs])

  async function handleDeleteOld() {
    if (!confirm('Dzēst webhook logus vecākus par 90 dienām?')) return
    setDeleting(true)
    const res = await fetch('/api/crm/webhook-logs', { method: 'DELETE' })
    if (res.ok) {
      const data = await res.json()
      setDeletedCount(data.deleted)
      await fetchLogs()
    }
    setDeleting(false)
  }

  const errorLogs = logs.filter(l => l.status === 'error')
  const invalidSigLogs = logs.filter(l => l.event_type === 'invalid_signature')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Webhook Žurnāls</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Twilio SMS/WhatsApp notikumi · Auto-atjaunojas ik 5s
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/crm" className="text-sm text-gray-500 hover:text-gray-800">
              ← CRM
            </Link>
            <button
              onClick={handleDeleteOld}
              disabled={deleting}
              className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-2 hover:bg-red-100 transition disabled:opacity-50"
            >
              {deleting ? 'Dzēš...' : '🗑 Dzēst >90 dienas'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500">Kopā</p>
            <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500">Kļūdas</p>
            <p className={`text-2xl font-bold ${errorLogs.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {errorLogs.length}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500">Inv. paraksti</p>
            <p className={`text-2xl font-bold ${invalidSigLogs.length > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
              {invalidSigLogs.length}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500">Anketas nosūtītas</p>
            <p className="text-2xl font-bold text-green-600">
              {logs.filter(l => l.event_type === 'anketa_sent').length}
            </p>
          </div>
        </div>

        {/* Security alert */}
        {invalidSigLogs.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="text-orange-500 text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-orange-800">
                {invalidSigLogs.length} neautorizēts webhook pieprasījums!
              </p>
              <p className="text-sm text-orange-700 mt-0.5">
                Iespējams, kāds mēģina viltot Twilio parakstu. Pārbaudi Twilio kontu.
              </p>
            </div>
          </div>
        )}

        {deletedCount !== null && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-sm text-green-800">
            ✅ Izdzēsti {deletedCount} veci ieraksti
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={eventFilter}
            onChange={e => setEventFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
          >
            <option value="">Visi notikumi</option>
            {Object.entries(EVENT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
          >
            <option value="">Visi statusi</option>
            <option value="success">✅ success</option>
            <option value="error">❌ error</option>
            <option value="ignored">⬜ ignored</option>
          </select>
          <button
            onClick={() => { setEventFilter(''); setStatusFilter('') }}
            className="text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5"
          >
            Notīrīt filtrus
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Ielādē...</div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Nav ierakstu</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Laiks</th>
                    <th className="px-4 py-3 text-left">Notikums</th>
                    <th className="px-4 py-3 text-left">Statuss</th>
                    <th className="px-4 py-3 text-left">No numura</th>
                    <th className="px-4 py-3 text-left">Detaļas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map(log => (
                    <tr
                      key={log.id}
                      className={`hover:bg-gray-50 transition ${log.status === 'error' ? 'bg-red-50' : ''}`}
                    >
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap font-mono text-xs">
                        {new Date(log.created_at).toLocaleString('lv-LV', {
                          day: '2-digit', month: '2-digit',
                          hour: '2-digit', minute: '2-digit', second: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {EVENT_LABELS[log.event_type] ?? log.event_type}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_CLASS[log.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        {log.from_number ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                        {log.error_message
                          ? <span className="text-red-600">{log.error_message}</span>
                          : log.details
                            ? JSON.stringify(log.details).slice(0, 80)
                            : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Pēdējā ielāde: {new Date().toLocaleTimeString('lv-LV')} · Auto-atjaunojas ik 5 sek
        </p>
      </div>
    </div>
  )
}
