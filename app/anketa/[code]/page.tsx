'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'

const REGIONI = [
  'Rīga', 'Jūrmala', 'Mārupe', 'Ķekava', 'Salaspils',
  'Jelgava', 'Ogre', 'Sigulda', 'Liepāja', 'Daugavpils', 'Ventspils',
]

const PAKALPOJUMU_SARAKSTS = [
  'Santehniskie darbi', 'Kanalizācija', 'Apkure', 'Ūdensvads',
  'Boileri', 'Vannas istabas', 'Avārijas 24/7',
]

const SPECIALITATES = ['Santehniķis', 'Elektriķis', 'Cits']

const DIENAS = [
  'Pirmdiena', 'Otrdiena', 'Trešdiena', 'Ceturtdiena',
  'Piektdiena', 'Sestdiena', 'Svētdiena',
]

type DarbaLaiksRinda = { diena: string; no: string; lidz: string; strada: boolean }

type FotoLauks = {
  uploading: boolean
  previewUrl: string | null
  uploadedUrl: string | null
  error: string | null
}

const emptyFoto = (): FotoLauks => ({
  uploading: false, previewUrl: null, uploadedUrl: null, error: null,
})

type ProspectData = {
  id: string
  vards: string
  uzvards: string
  telefons: string
  nodarbosanas: string | null
  regions: string | null
}

const FOTO_LAUKI: { key: string; label: string; hint: string; required: boolean }[] = [
  { key: 'hero', label: 'Galvenais foto*', hint: 'Santehniķis darbā vai portrets', required: true },
  { key: 'darbs_1', label: 'Darba foto 1 — Vannas istaba', hint: 'Labiekārtota vannas istaba', required: false },
  { key: 'darbs_2', label: 'Darba foto 2 — Caurules / ūdensvads', hint: 'Caurules, ventīļi, savienojumi', required: false },
  { key: 'darbs_3', label: 'Darba foto 3 — Boilers / apkure', hint: 'Boilers, radiatori, apkures sistēma', required: false },
  { key: 'darbs_4', label: 'Darba foto 4 — WC / santehnika', hint: 'Tualete, izlietne, dušas kabīne', required: false },
  { key: 'profils', label: 'Profila foto — Par mani', hint: 'Portrets vai foto darbā', required: false },
]

export default function AnketaPage() {
  const { code } = useParams<{ code: string }>()

  const [prospect, setProspect] = useState<ProspectData | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [alreadyFilled, setAlreadyFilled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [vards, setVards] = useState('')
  const [uzvards, setUzvards] = useState('')
  const [email, setEmail] = useState('')
  const [specialitate, setSpecialitate] = useState('Santehniķis')
  const [regioni, setRegioni] = useState<string[]>([])
  const [pakalpojumi, setPakalpojumi] = useState<string[]>([])
  const [apraksts, setApraksts] = useState('')
  const [darbaLaiki, setDarbaLaiki] = useState<DarbaLaiksRinda[]>(
    DIENAS.map((diena, i) => ({ diena, no: '08:00', lidz: '20:00', strada: i < 5 }))
  )

  const [fotos, setFotos] = useState<Record<string, FotoLauks>>({
    hero: emptyFoto(), darbs_1: emptyFoto(), darbs_2: emptyFoto(),
    darbs_3: emptyFoto(), darbs_4: emptyFoto(), profils: emptyFoto(),
  })

  useEffect(() => {
    fetch(`/api/anketa/prospect?code=${code}`)
      .then(r => r.json())
      .then(d => {
        if (d.error === 'not_found') { setNotFound(true); return }
        if (d.error === 'already_filled') { setAlreadyFilled(true); return }
        setProspect(d)
        setVards(d.vards ?? '')
        setUzvards(d.uzvards ?? '')
        if (d.nodarbosanas === 'elektrikis') setSpecialitate('Elektriķis')
        if (d.regions) setRegioni(d.regions.split(',').map((r: string) => r.trim()).filter(Boolean))
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [code])

  function toggleRegion(r: string) {
    setRegioni(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])
  }

  function togglePakalpojums(p: string) {
    setPakalpojumi(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  function setDarbaLaiksField(i: number, field: keyof DarbaLaiksRinda, val: string | boolean) {
    setDarbaLaiki(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  }

  const uploadFoto = useCallback(async (fotoKey: string, file: File) => {
    const previewUrl = URL.createObjectURL(file)
    setFotos(prev => ({ ...prev, [fotoKey]: { uploading: true, previewUrl, uploadedUrl: null, error: null } }))

    const fd = new FormData()
    fd.append('file', file)
    fd.append('anketa_code', code)
    fd.append('foto_tips', fotoKey)

    try {
      const res = await fetch('/api/anketa/upload-foto', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload kļūda')
      setFotos(prev => ({ ...prev, [fotoKey]: { uploading: false, previewUrl, uploadedUrl: data.url, error: null } }))
    } catch (e) {
      setFotos(prev => ({ ...prev, [fotoKey]: { uploading: false, previewUrl: null, uploadedUrl: null, error: String(e) } }))
    }
  }, [code])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prospect) return
    if (!fotos.hero.uploadedUrl) { setSubmitError('Galvenais foto ir obligāts'); return }
    if (regioni.length === 0) { setSubmitError('Izvēlies vismaz vienu reģionu'); return }
    if (pakalpojumi.length === 0) { setSubmitError('Izvēlies vismaz vienu pakalpojumu'); return }

    setSubmitting(true)
    setSubmitError('')

    const res = await fetch('/api/anketa/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anketa_code: code,
        vards, uzvards, email, specialitate, regioni, pakalpojumi, apraksts,
        darba_laiki: darbaLaiki,
      }),
    })

    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setSubmitError(d.error ?? 'Kļūda')
      setSubmitting(false)
      return
    }

    setSubmitted(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">Ielādē...</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
        <div>
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-gray-700 font-medium">Anketa nav atrasta</p>
          <p className="text-gray-400 text-sm mt-1">Pārbaudi SMS saiti vai sazinies ar Gintu.</p>
        </div>
      </div>
    )
  }

  if (alreadyFilled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
        <div>
          <p className="text-2xl mb-2">✅</p>
          <p className="text-gray-700 font-medium">Anketa jau aizpildīta!</p>
          <p className="text-gray-400 text-sm mt-1">Drīz sazināsimies ar tevi.</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
        <div className="max-w-sm">
          <p className="text-4xl mb-4">🎉</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Paldies, {vards}!</h1>
          <p className="text-gray-600">Anketa saņemta. Mēs izveidosim tavu demo lapu un nosūtīsim linku.</p>
          <p className="text-gray-400 text-sm mt-4">Parasti tas aizņem 1–2 darba dienas.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tava profila anketa</h1>
          <p className="text-gray-500 text-sm mt-1">Aizpildi — mēs izveidosim tavu demo lapu. 3 minūtes.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {submitError && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{submitError}</div>
          )}

          {/* Personīgā info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Kontaktinfo</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Vārds *</label>
                <input value={vards} onChange={e => setVards(e.target.value)} required
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Uzvārds *</label>
                <input value={uzvards} onChange={e => setUzvards(e.target.value)} required
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Telefons</label>
              <input value={prospect?.telefons ?? ''} readOnly
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">E-pasts *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="janis@gmail.com"
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Specialitāte */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Specialitāte *</h2>
            <div className="flex gap-2 flex-wrap">
              {SPECIALITATES.map(s => (
                <button key={s} type="button" onClick={() => setSpecialitate(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                    specialitate === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Reģioni */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Reģioni, kur strādā *</h2>
            <div className="flex flex-wrap gap-2">
              {REGIONI.map(r => (
                <button key={r} type="button" onClick={() => toggleRegion(r)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    regioni.includes(r) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Pakalpojumi */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pakalpojumi *</h2>
            <div className="flex flex-col gap-2">
              {PAKALPOJUMU_SARAKSTS.map(p => (
                <label key={p} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={pakalpojumi.includes(p)} onChange={() => togglePakalpojums(p)}
                    className="rounded text-blue-600 w-4 h-4" />
                  <span className="text-sm text-gray-700">{p}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Darba laiki */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Darba laiki *</h2>
            <div className="flex flex-col gap-2">
              {darbaLaiki.map((row, i) => (
                <div key={row.diena} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={row.strada} onChange={e => setDarbaLaiksField(i, 'strada', e.target.checked)}
                    className="rounded text-blue-600 w-4 h-4 flex-shrink-0" />
                  <span className="w-24 text-gray-700 text-xs">{row.diena}</span>
                  <input type="time" value={row.no} disabled={!row.strada}
                    onChange={e => setDarbaLaiksField(i, 'no', e.target.value)}
                    className="border rounded px-2 py-1 text-xs w-20 disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <span className="text-gray-400 text-xs">—</span>
                  <input type="time" value={row.lidz} disabled={!row.strada}
                    onChange={e => setDarbaLaiksField(i, 'lidz', e.target.value)}
                    className="border rounded px-2 py-1 text-xs w-20 disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Foto uploads */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Foto</h2>
            <div className="flex flex-col gap-4">
              {FOTO_LAUKI.map(({ key, label, hint }) => {
                const f = fotos[key]
                return (
                  <div key={key}>
                    <label className="text-xs font-medium text-gray-600">{label}</label>
                    <p className="text-xs text-gray-400 mb-1">{hint}</p>
                    {f.previewUrl && (
                      <img src={f.previewUrl} alt="" className="w-full h-40 object-cover rounded-lg mb-2" />
                    )}
                    {f.uploading && (
                      <p className="text-xs text-blue-500 mb-1">Augšupielādē...</p>
                    )}
                    {f.error && (
                      <p className="text-xs text-red-500 mb-1">{f.error}</p>
                    )}
                    {f.uploadedUrl && !f.uploading && (
                      <p className="text-xs text-green-600 mb-1">✓ Augšupielādēts</p>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => { const file = e.target.files?.[0]; if (file) uploadFoto(key, file) }}
                      className="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Apraksts */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Par sevi</h2>
            <p className="text-xs text-gray-400">Pastāsti par pieredzi, priekšrocībām, garantijām. Var rakstīt krieviski — tiks tulkots abās valodās.</p>
            <textarea
              value={apraksts}
              onChange={e => setApraksts(e.target.value)}
              rows={4}
              maxLength={1500}
              placeholder="Strādāju par santehniķi 10 gadus. Specializējos uz..."
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-400 text-right">{apraksts.length}/1500</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white rounded-xl py-3 text-base font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {submitting ? 'Sūta...' : 'Saglabāt un nosūtīt'}
          </button>
        </form>
      </div>
    </div>
  )
}
