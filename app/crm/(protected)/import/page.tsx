'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'

type Rinda = {
  vards: string
  uzvards: string
  telefons: string
  valoda: string
  regions: string
  nodarbosanas: string
}

type ImportResult = {
  imported: number
  skipped: number
  skipped_telefoni: string[]
  errors: string[]
}

const KOLONNAS = ['Vārds', 'Telefons', 'Valoda', 'Reģions', 'Specialitāte']

function parseCsv(text: string): Rinda[] {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []

  // Atrod separatoru — tab vai komats
  const sep = lines[0].includes('\t') ? '\t' : ','
  const header = lines[0].split(sep).map(h => h.trim().toLowerCase())

  // Kolonnu indeksi (fleksibli)
  const idx = {
    vards: header.findIndex(h => h.includes('vārds') || h.includes('vards') || h.includes('nosaukums')),
    telefons: header.findIndex(h => h.includes('telefon')),
    valoda: header.findIndex(h => h.includes('valoda') || h.includes('язык')),
    regions: header.findIndex(h => h.includes('reģion') || h.includes('region')),
    nodarbosanas: header.findIndex(h => h.includes('specialit') || h.includes('nodarbošan')),
  }

  return lines.slice(1).map(line => {
    const cols = line.split(sep)
    const fullName = (idx.vards >= 0 ? cols[idx.vards] : '').trim()
    const spaceIdx = fullName.indexOf(' ')
    const vards = spaceIdx > 0 ? fullName.slice(0, spaceIdx) : fullName
    const uzvards = spaceIdx > 0 ? fullName.slice(spaceIdx + 1) : ''

    return {
      vards,
      uzvards,
      telefons: (idx.telefons >= 0 ? cols[idx.telefons] : '').trim(),
      valoda: (idx.valoda >= 0 ? cols[idx.valoda] : 'lv').trim() || 'lv',
      regions: (idx.regions >= 0 ? cols[idx.regions] : '').trim(),
      nodarbosanas: (idx.nodarbosanas >= 0 ? cols[idx.nodarbosanas] : '').trim(),
    }
  }).filter(r => r.telefons)
}

export default function ImportPage() {
  const [rindas, setRindas] = useState<Rinda[]>([])
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [parseError, setParseError] = useState('')

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setResult(null)
    setParseError('')

    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      const parsed = parseCsv(text)
      if (parsed.length === 0) {
        setParseError('Nevarēja parsēt CSV. Pārliecinies ka kolonnas ir: Vārds, Telefons, Valoda, Reģions, Specialitāte')
        setRindas([])
      } else {
        setRindas(parsed)
      }
    }
    reader.readAsText(file, 'UTF-8')
  }, [])

  async function handleImport() {
    if (rindas.length === 0) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/crm/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: rindas }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Kļūda')
      setResult(data)
      setRindas([])
    } catch (e) {
      setResult({ imported: 0, skipped: 0, skipped_telefoni: [], errors: [String(e)] })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/crm" className="text-sm text-gray-400 hover:text-gray-700">← Atpakaļ</Link>
        <h1 className="text-xl font-bold text-gray-900">CSV imports</h1>
      </div>

      {/* Formāta apraksts */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-800">
        <p className="font-semibold mb-1">CSV formāts (tab vai komats kā atdalītājs):</p>
        <code className="block text-xs bg-white rounded px-3 py-2 mt-2 font-mono border border-blue-100">
          {KOLONNAS.join('\t')}
          <br />
          Andris Kalniņš{'\t'}+37120000000{'\t'}lv{'\t'}Rīga{'\t'}Santehniķis
        </code>
        <p className="mt-2 text-xs text-blue-600">Ieraksti ar tādu pašu telefona numuru tiks izlaisti (bez dublikātiem).</p>
      </div>

      {/* File upload */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-3">Izvēlies CSV failu</label>
        <input
          type="file"
          accept=".csv,.tsv,.txt"
          onChange={handleFile}
          className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
        {fileName && <p className="mt-2 text-xs text-gray-400">{fileName}</p>}
        {parseError && <p className="mt-2 text-xs text-red-500">{parseError}</p>}
      </div>

      {/* Priekšskatījums */}
      {rindas.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              Priekšskatījums — {rindas.length} ieraksti
            </h2>
            <button
              onClick={handleImport}
              disabled={loading}
              className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Importē...' : `Importēt ${rindas.length} ierakstus`}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Vārds', 'Uzvārds', 'Telefons', 'Valoda', 'Reģions', 'Specialitāte'].map(h => (
                    <th key={h} className="text-left py-2 pr-4 text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rindas.slice(0, 20).map((r, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-1.5 pr-4 text-gray-800">{r.vards}</td>
                    <td className="py-1.5 pr-4 text-gray-800">{r.uzvards}</td>
                    <td className="py-1.5 pr-4 font-mono text-gray-600">{r.telefons}</td>
                    <td className="py-1.5 pr-4 text-gray-600">{r.valoda}</td>
                    <td className="py-1.5 pr-4 text-gray-600">{r.regions}</td>
                    <td className="py-1.5 pr-4 text-gray-600">{r.nodarbosanas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rindas.length > 20 && (
              <p className="text-xs text-gray-400 mt-2">+ vēl {rindas.length - 20} ieraksti...</p>
            )}
          </div>
        </div>
      )}

      {/* Rezultāts */}
      {result && (
        <div className={`rounded-xl border p-5 ${result.errors.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <h2 className="font-semibold text-gray-800 mb-3">Importa rezultāts</h2>
          <div className="flex gap-6 mb-3">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{result.imported}</p>
              <p className="text-xs text-gray-500 mt-0.5">Importēti</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-500">{result.skipped}</p>
              <p className="text-xs text-gray-500 mt-0.5">Izlaisti (dubleti)</p>
            </div>
          </div>
          {result.skipped_telefoni.length > 0 && (
            <div className="text-xs text-gray-500 mb-2">
              <span className="font-medium">Izlaistie: </span>
              {result.skipped_telefoni.join(', ')}
            </div>
          )}
          {result.errors.length > 0 && (
            <p className="text-sm text-red-600">{result.errors.join(', ')}</p>
          )}
          {result.imported > 0 && (
            <Link href="/crm" className="mt-3 inline-block text-sm text-blue-600 font-medium hover:underline">
              Skatīt prospects →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
