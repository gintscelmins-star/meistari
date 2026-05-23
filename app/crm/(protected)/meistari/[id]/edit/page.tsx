'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { pilsetas } from '@/lib/latvijas-pilsetas'
import { slugify } from '@/lib/slugify'
import { generateAprakstsPrompt, generateTulkojumsPrompt } from '@/lib/ai-prompt-generator'

// ─── Types ───────────────────────────────────────────────────────────────────

type DarbaLaiksRinda = { diena: string; no: string; lidz: string; strada: boolean }

type PakalpojumsItem = {
  _key: string
  nosaukums: string
  ikona: string
  apraksts: string
  cena_no: string
  cena_lidz: string
  items: string
}

type AtsauksmeItem = {
  _key: string
  autors: string
  teksts: string
  vertejums: number
  datums: string
}

type FotoUrls = {
  hero: string | null
  darbs_1: string | null
  darbs_2: string | null
  darbs_3: string | null
  darbs_4: string | null
  profils: string | null
}

type MeistarsForm = {
  // S1
  vards: string; uzvards: string; telefons: string; email: string
  whatsapp: boolean; valoda: 'lv' | 'ru'
  // S2
  kategorijas: string[]; nodarbosanas: string
  // S3
  regions: string[]
  // S4
  darba_laiki: DarbaLaiksRinda[]; avarijas_24_7: boolean
  // S5
  pieredze_gadi: string; sertificets: boolean; sia_nosaukums: string; sia_reg: string
  // S6
  cena_no: string; cena_lidz: string
  // S7
  hero_virsraksts: string; hero_apaksteksts: string
  // S9
  apraksts: string
  // S12
  meta_title: string; meta_description: string
  // S13
  demo_slug: string; featured: boolean; featured_lidz: string; publiskets: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const KATEGORIJAS = ['Santehniķis', 'Elektriķis', 'Remontdarbi', 'Mēbeļu meistars', 'Frizieris', 'Uzkopšana']

const DEFAULT_DARBA_LAIKI: DarbaLaiksRinda[] = [
  { diena: 'Pirmdiena', no: '08:00', lidz: '18:00', strada: true },
  { diena: 'Otrdiena', no: '08:00', lidz: '18:00', strada: true },
  { diena: 'Trešdiena', no: '08:00', lidz: '18:00', strada: true },
  { diena: 'Ceturtdiena', no: '08:00', lidz: '18:00', strada: true },
  { diena: 'Piektdiena', no: '08:00', lidz: '18:00', strada: true },
  { diena: 'Sestdiena', no: '09:00', lidz: '15:00', strada: false },
  { diena: 'Svētdiena', no: '09:00', lidz: '15:00', strada: false },
]

const FOTO_SLOTS = [
  { slot: 'hero', label: 'Hero foto (galvenais)', required: true },
  { slot: 'darbs_1', label: 'Darba foto 1' },
  { slot: 'darbs_2', label: 'Darba foto 2' },
  { slot: 'darbs_3', label: 'Darba foto 3' },
  { slot: 'darbs_4', label: 'Darba foto 4' },
  { slot: 'profils', label: 'Profila foto (par mani)' },
] as const

const EMOJI_OPTIONS = ['🔧', '⚡', '🚿', '🪠', '🔌', '🏠', '🪟', '🚪', '🪣', '🛁', '💡', '🔨', '🪚', '⚙️', '✂️', '🧹']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function newKey() {
  return Math.random().toString(36).slice(2)
}

function SectionHeader({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        {n}
      </div>
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}

function InputField({
  label, value, onChange, type = 'text', placeholder, required, readonly, hint,
}: {
  label: string; value: string; onChange?: (v: string) => void
  type?: string; placeholder?: string; required?: boolean; readonly?: boolean; hint?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readonly}
        className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${readonly ? 'bg-gray-50 text-gray-500' : ''}`}
      />
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MeistarsEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [form, setForm] = useState<MeistarsForm | null>(null)
  const [fotos, setFotos] = useState<FotoUrls>({ hero: null, darbs_1: null, darbs_2: null, darbs_3: null, darbs_4: null, profils: null })
  const [pakalpojumi, setPakalpojumi] = useState<PakalpojumsItem[]>([])
  const [atsauksmes, setAtsauksmes] = useState<AtsauksmeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [error, setError] = useState('')
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null)
  const [rigaRajoniOpen, setRigaRajoniOpen] = useState(false)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // AI modal state
  const [aiModal, setAiModal] = useState(false)
  const [aiMode, setAiMode] = useState<'manual' | 'auto'>('manual')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResult, setAiResult] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiError, setAiError] = useState('')
  const [copied, setCopied] = useState(false)

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/crm/meistari/${id}`)
    if (!res.ok) { setLoading(false); return }
    const p = await res.json()

    const dl: DarbaLaiksRinda[] = Array.isArray(p.darba_laiki) && p.darba_laiki.length === 7
      ? p.darba_laiki
      : DEFAULT_DARBA_LAIKI

    setForm({
      vards: p.vards ?? '', uzvards: p.uzvards ?? '',
      telefons: p.telefons ?? '', email: p.email ?? '',
      whatsapp: !!p.whatsapp, valoda: p.valoda === 'ru' ? 'ru' : 'lv',
      kategorijas: p.kategorijas ?? [],
      nodarbosanas: p.nodarbosanas ?? '',
      regions: p.regions ? p.regions.split(',').map((r: string) => r.trim()).filter(Boolean) : [],
      darba_laiki: dl,
      avarijas_24_7: !!p.avarijas_24_7,
      pieredze_gadi: p.pieredze_gadi ? String(p.pieredze_gadi) : '',
      sertificets: !!p.sertificets,
      sia_nosaukums: p.sia_nosaukums ?? '', sia_reg: p.sia_reg ?? '',
      cena_no: p.cena_no ? String(p.cena_no) : '',
      cena_lidz: p.cena_lidz ? String(p.cena_lidz) : '',
      hero_virsraksts: p.hero_virsraksts ?? '',
      hero_apaksteksts: p.hero_apaksteksts ?? '',
      apraksts: p.apraksts ?? '',
      meta_title: p.meta_title ?? '',
      meta_description: p.meta_description ?? '',
      demo_slug: p.demo_slug ?? '',
      featured: !!p.featured,
      featured_lidz: p.featured_lidz ? p.featured_lidz.slice(0, 10) : '',
      publiskets: !!p.publiskets,
    })

    setFotos({
      hero: p.foto_hero ?? null, darbs_1: p.foto_darbs_1 ?? null,
      darbs_2: p.foto_darbs_2 ?? null, darbs_3: p.foto_darbs_3 ?? null,
      darbs_4: p.foto_darbs_4 ?? null, profils: p.foto_profils ?? null,
    })

    if (Array.isArray(p.pakalpojumi_detail) && p.pakalpojumi_detail.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setPakalpojumi(p.pakalpojumi_detail.map((x: any) => ({
        _key: newKey(),
        nosaukums: x.nosaukums ?? '',
        ikona: x.ikona ?? '🔧',
        apraksts: x.apraksts ?? '',
        cena_no: x.cena_no ? String(x.cena_no) : '',
        cena_lidz: x.cena_lidz ? String(x.cena_lidz) : '',
        items: Array.isArray(x.items) ? x.items.join('\n') : (x.items ?? ''),
      })))
    }

    if (Array.isArray(p.atsauksmes)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAtsauksmes(p.atsauksmes.map((a: any) => ({
        _key: newKey(),
        autors: a.autors ?? '', teksts: a.teksts ?? '',
        vertejums: a.vertejums ?? 5, datums: a.datums ?? '',
      })))
    }

    setLoading(false)
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  // Auto-generate slug from vards+uzvards
  useEffect(() => {
    if (!form) return
    if (form.demo_slug) return // don't overwrite existing
    const slug = slugify(`${form.vards} ${form.uzvards}`)
    if (slug) setForm(f => f ? { ...f, demo_slug: slug } : f)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.vards, form?.uzvards])

  // Auto-generate meta_title
  useEffect(() => {
    if (!form) return
    const pilseta = form.regions[0] ?? ''
    const spec = form.nodarbosanas || form.kategorijas[0] || ''
    const title = `${form.vards} ${form.uzvards} | ${spec}${pilseta ? ' ' + pilseta : ''}`
    setForm(f => f ? { ...f, meta_title: title.trim() } : f)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.vards, form?.uzvards, form?.nodarbosanas, form?.kategorijas, form?.regions])

  // Auto-generate meta_description from apraksts
  useEffect(() => {
    if (!form) return
    const desc = form.apraksts.slice(0, 155)
    setForm(f => f ? { ...f, meta_description: desc } : f)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.apraksts])

  function set<K extends keyof MeistarsForm>(key: K, val: MeistarsForm[K]) {
    setForm(f => f ? { ...f, [key]: val } : f)
  }

  // ─── Region helpers ──────────────────────────────────────────────────────────

  function toggleRegion(r: string) {
    if (!form) return
    const next = form.regions.includes(r)
      ? form.regions.filter(x => x !== r)
      : [...form.regions, r]
    set('regions', next)
  }

  const rigaRajoni = pilsetas.find(p => p.pilseta === 'Rīga')?.rajoni ?? []

  // ─── Darba laiki ─────────────────────────────────────────────────────────────

  function updateDarbaLaiks(i: number, field: keyof DarbaLaiksRinda, val: string | boolean) {
    setForm(f => {
      if (!f) return f
      const dl = [...f.darba_laiki]
      dl[i] = { ...dl[i], [field]: val }
      return { ...f, darba_laiki: dl }
    })
  }

  // ─── Pakalpojumi ─────────────────────────────────────────────────────────────

  function addPakalpojums() {
    setPakalpojumi(p => [...p, { _key: newKey(), nosaukums: '', ikona: '🔧', apraksts: '', cena_no: '', cena_lidz: '', items: '' }])
  }

  function updatePakalpojums(key: string, field: keyof PakalpojumsItem, val: string) {
    setPakalpojumi(p => p.map(x => x._key === key ? { ...x, [field]: val } : x))
  }

  function removePakalpojums(key: string) {
    setPakalpojumi(p => p.filter(x => x._key !== key))
  }

  // ─── Atsauksmes ──────────────────────────────────────────────────────────────

  function addAtsauksme() {
    setAtsauksmes(a => [...a, { _key: newKey(), autors: '', teksts: '', vertejums: 5, datums: '' }])
  }

  function updateAtsauksme(key: string, field: keyof AtsauksmeItem, val: string | number) {
    setAtsauksmes(a => a.map(x => x._key === key ? { ...x, [field]: val } : x))
  }

  function removeAtsauksme(key: string) {
    setAtsauksmes(a => a.filter(x => x._key !== key))
  }

  // ─── Foto upload ─────────────────────────────────────────────────────────────

  async function handleFotoUpload(slot: string, file: File) {
    setUploadingSlot(slot)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('slot', slot)
    const res = await fetch(`/api/crm/meistari/${id}/foto`, { method: 'POST', body: fd })
    if (res.ok) {
      const { url } = await res.json()
      setFotos(f => ({ ...f, [slot]: url }))
    }
    setUploadingSlot(null)
  }

  async function handleFotoDelete(slot: string) {
    if (!confirm('Dzēst šo foto?')) return
    await fetch(`/api/crm/meistari/${id}/foto`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot }),
    })
    setFotos(f => ({ ...f, [slot]: null }))
  }

  // ─── AI modal ────────────────────────────────────────────────────────────────

  function openAiModal() {
    if (!form) return
    const prompt = generateAprakstsPrompt({
      vards: form.vards,
      uzvards: form.uzvards,
      kategorijas: form.kategorijas,
      nodarbosanas: form.nodarbosanas || null,
      pieredze_gadi: form.pieredze_gadi ? Number(form.pieredze_gadi) : null,
      regions: form.regions,
      darba_laiki: form.darba_laiki,
      avarijas_24_7: form.avarijas_24_7,
      pakalpojumi_detail: pakalpojumi.map(p => ({ nosaukums: p.nosaukums })),
      sertificets: form.sertificets,
    })
    setAiPrompt(prompt)
    setAiResult('')
    setAiError('')
    setAiModal(true)
  }

  async function autoGenerate() {
    setAiGenerating(true)
    setAiError('')
    try {
      const res = await fetch('/api/ai/generate-apraksts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Kļūda')
      setAiResult(data.apraksts)
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Kļūda')
    } finally {
      setAiGenerating(false)
    }
  }

  async function translateToLv() {
    if (!aiResult.trim()) return
    setAiGenerating(true)
    setAiError('')
    try {
      const res = await fetch('/api/ai/generate-apraksts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: generateTulkojumsPrompt(aiResult) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Kļūda')
      setAiResult(data.apraksts)
    } catch (e) {
      setAiError(e instanceof Error ? e.message : 'Kļūda')
    } finally {
      setAiGenerating(false)
    }
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(aiPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function applyAiResult() {
    if (!aiResult.trim()) return
    set('apraksts', aiResult.trim())
    setAiModal(false)
  }

  // ─── Save ────────────────────────────────────────────────────────────────────

  async function save(andPreview = false) {
    if (!form) return
    setSaving(true)
    setSaveMsg('')
    setError('')

    const pakBody = pakalpojumi.map(p => ({
      nosaukums: p.nosaukums,
      ikona: p.ikona,
      apraksts: p.apraksts,
      cena_no: p.cena_no ? Number(p.cena_no) : null,
      cena_lidz: p.cena_lidz ? Number(p.cena_lidz) : null,
      items: p.items.split('\n').map(s => s.trim()).filter(Boolean),
    }))

    const atsBody = atsauksmes.map(a => ({
      autors: a.autors, teksts: a.teksts,
      vertejums: a.vertejums, datums: a.datums,
    }))

    const res = await fetch(`/api/crm/meistari/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        regions: form.regions.join(', ') || null,
        pieredze_gadi: form.pieredze_gadi || null,
        cena_no: form.cena_no || null,
        cena_lidz: form.cena_lidz || null,
        featured_lidz: form.featured_lidz || null,
        pakalpojumi_detail: pakBody,
        atsauksmes: atsBody,
      }),
    })

    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setError(d.error ?? 'Kļūda')
      setSaving(false)
      return
    }

    setSaving(false)
    setSaveMsg('Saglabāts!')
    setTimeout(() => setSaveMsg(''), 3000)

    if (andPreview) {
      router.push(`/crm/meistari/${id}/preview`)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (loading) return <div className="p-8 text-sm text-gray-400">Ielādē...</div>
  if (!form) return <div className="p-8 text-sm text-red-500">Nav atrasts</div>

  return (
    <div className="p-6 max-w-3xl pb-24">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-700">
          ← Atpakaļ
        </button>
        <h1 className="text-lg font-bold text-gray-900">Meistara kartīte</h1>
        <div className="w-20" />
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">{error}</div>
      )}

      <div className="flex flex-col gap-8">

        {/* ── SADAĻA 1: Pamata info ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionHeader n={1} title="Pamata info" />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputField label="Vārds" required value={form.vards} onChange={v => set('vards', v)} />
            <InputField label="Uzvārds" required value={form.uzvards} onChange={v => set('uzvards', v)} />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputField label="Telefons" required value={form.telefons} onChange={v => set('telefons', v)} placeholder="+37126000000" />
            <InputField label="E-pasts" value={form.email} onChange={v => set('email', v)} placeholder="janis@email.lv" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
              <input type="checkbox" checked={form.whatsapp} onChange={e => set('whatsapp', e.target.checked)}
                className="rounded text-blue-600" />
              WhatsApp (tas pats numurs)
            </label>
            <div className="flex gap-2">
              {(['lv', 'ru'] as const).map(v => (
                <button key={v} type="button" onClick={() => set('valoda', v)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition ${form.valoda === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── SADAĻA 2: Kategorijas ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionHeader n={2} title="Kategorijas un specialitāte" />
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">Kategorijas *</p>
            <div className="flex flex-wrap gap-2">
              {KATEGORIJAS.map(k => (
                <button key={k} type="button" onClick={() => {
                  const next = form.kategorijas.includes(k)
                    ? form.kategorijas.filter(x => x !== k)
                    : [...form.kategorijas, k]
                  set('kategorijas', next)
                }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    form.kategorijas.includes(k) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}>
                  {k}
                </button>
              ))}
            </div>
          </div>
          <InputField label="Specialitāte galvenā" required value={form.nodarbosanas}
            onChange={v => set('nodarbosanas', v)} placeholder="Santehniķis un elektriķis" />
        </section>

        {/* ── SADAĻA 3: Atrašanās vieta ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionHeader n={3} title="Atrašanās vieta" />
          <p className="text-xs font-medium text-gray-600 mb-2">Pilsētas</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {pilsetas.map(p => (
              <button key={p.pilseta} type="button"
                onClick={() => {
                  if (p.pilseta === 'Rīga') {
                    toggleRegion('Rīga')
                    if (!form.regions.includes('Rīga')) setRigaRajoniOpen(true)
                  } else {
                    toggleRegion(p.pilseta)
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  form.regions.includes(p.pilseta) || rigaRajoni.some(r => form.regions.includes(`Rīga - ${r}`))
                    ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}>
                {p.pilseta}
              </button>
            ))}
          </div>

          {/* Rīgas rajoni */}
          {(form.regions.includes('Rīga') || rigaRajoniOpen) && (
            <div className="ml-4 mt-2">
              <p className="text-xs font-medium text-gray-500 mb-2">Rīgas rajoni</p>
              <div className="flex flex-wrap gap-2">
                {rigaRajoni.map(r => (
                  <button key={r} type="button" onClick={() => toggleRegion(`Rīga - ${r}`)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition ${
                      form.regions.includes(`Rīga - ${r}`) ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {form.regions.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">Atlasīti: {form.regions.join(', ')}</p>
          )}
        </section>

        {/* ── SADAĻA 4: Darba laiks ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionHeader n={4} title="Darba laiks" />
          <div className="flex flex-col gap-2 mb-4">
            {form.darba_laiki.map((row, i) => (
              <div key={row.diena} className="flex items-center gap-3">
                <label className="flex items-center gap-2 w-32 cursor-pointer">
                  <input type="checkbox" checked={row.strada} onChange={e => updateDarbaLaiks(i, 'strada', e.target.checked)}
                    className="rounded text-blue-600" />
                  <span className="text-sm text-gray-700">{row.diena}</span>
                </label>
                <input type="time" value={row.no} onChange={e => updateDarbaLaiks(i, 'no', e.target.value)}
                  disabled={!row.strada}
                  className="border rounded-lg px-2 py-1 text-sm w-24 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <span className="text-gray-400 text-sm">–</span>
                <input type="time" value={row.lidz} onChange={e => updateDarbaLaiks(i, 'lidz', e.target.value)}
                  disabled={!row.strada}
                  className="border rounded-lg px-2 py-1 text-sm w-24 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {!row.strada && <span className="text-xs text-gray-400">Slēgts</span>}
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
            <input type="checkbox" checked={form.avarijas_24_7} onChange={e => set('avarijas_24_7', e.target.checked)}
              className="rounded text-blue-600" />
            Avārijas dienests 24/7
          </label>
        </section>

        {/* ── SADAĻA 5: Pieredze ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionHeader n={5} title="Pieredze un uzņēmums" />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <InputField label="Pieredze (gadi)" required value={form.pieredze_gadi}
              onChange={v => set('pieredze_gadi', v)} type="number" placeholder="15" />
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 mb-2">
                <input type="checkbox" checked={form.sertificets} onChange={e => set('sertificets', e.target.checked)}
                  className="rounded text-blue-600" />
                Sertificēts speciālists
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="SIA nosaukums" value={form.sia_nosaukums} onChange={v => set('sia_nosaukums', v)}
              placeholder="SIA Meistars" />
            <InputField label="Reģ. nr." value={form.sia_reg} onChange={v => set('sia_reg', v)}
              placeholder="40103xxxxxx" />
          </div>
        </section>

        {/* ── SADAĻA 6: Cenas ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionHeader n={6} title="Cenas" />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Cena no (€/h)" required value={form.cena_no}
              onChange={v => set('cena_no', v)} type="number" placeholder="20" />
            <InputField label="Cena līdz (€/h)" value={form.cena_lidz}
              onChange={v => set('cena_lidz', v)} type="number" placeholder="50" />
          </div>
        </section>

        {/* ── SADAĻA 7: Hero ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionHeader n={7} title="Hero sekcija" />
          <div className="flex flex-col gap-4">
            <InputField label="Hero virsraksts" required value={form.hero_virsraksts}
              onChange={v => set('hero_virsraksts', v)}
              placeholder="Santehnikas darbi Rīgā — ātri un uzticami" />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Hero apakšteksts</label>
              <textarea value={form.hero_apaksteksts} onChange={e => set('hero_apaksteksts', e.target.value)}
                rows={2} placeholder="15+ gadu pieredze. Zvanu 7 dienas nedēļā."
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
        </section>

        {/* ── SADAĻA 8: Foto ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionHeader n={8} title="Foto" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {FOTO_SLOTS.map(({ slot, label }) => {
              const url = fotos[slot as keyof FotoUrls]
              const isUploading = uploadingSlot === slot
              return (
                <div key={slot} className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-gray-600">{label}</p>
                  {url ? (
                    <div className="relative group">
                      <img src={url} alt={label} className="w-full h-28 object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition flex items-center justify-center gap-2">
                        <button type="button"
                          onClick={() => fileRefs.current[slot]?.click()}
                          className="text-xs bg-white text-gray-800 px-2 py-1 rounded font-medium">
                          Mainīt
                        </button>
                        <button type="button" onClick={() => handleFotoDelete(slot)}
                          className="text-xs bg-red-600 text-white px-2 py-1 rounded font-medium">
                          Dzēst
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileRefs.current[slot]?.click()}
                      className={`w-full h-28 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 transition ${
                        isUploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}>
                      {isUploading ? (
                        <span className="text-xs text-blue-600 animate-pulse">Augšupielādē...</span>
                      ) : (
                        <>
                          <span className="text-2xl text-gray-300">📷</span>
                          <span className="text-xs text-gray-400">Upload</span>
                        </>
                      )}
                    </button>
                  )}
                  <input type="file" accept="image/*" className="hidden"
                    ref={el => { fileRefs.current[slot] = el }}
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) handleFotoUpload(slot, f)
                      e.target.value = ''
                    }} />
                </div>
              )
            })}
          </div>
        </section>

        {/* ── SADAĻA 9: Apraksts ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionHeader n={9} title="Apraksts par sevi" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">
                Apraksts <span className="text-red-500">*</span>
                <span className="ml-2 font-normal text-gray-400">(var rakstīt krieviski)</span>
              </label>
              <button type="button" onClick={openAiModal}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition">
                ✨ Ģenerēt ar AI
              </button>
            </div>
            <textarea value={form.apraksts} onChange={e => set('apraksts', e.target.value)}
              rows={5} maxLength={3000}
              placeholder="Esmu profesionāls santehniķis ar 15+ gadu pieredzi..."
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            <p className="text-xs text-gray-400 text-right">{form.apraksts.length} / 3000</p>
          </div>
        </section>

        {/* ── SADAĻA 10: Pakalpojumi ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionHeader n={10} title="Pakalpojumi" />
          <div className="flex flex-col gap-4">
            {pakalpojumi.map(p => (
              <div key={p._key} className="border border-gray-200 rounded-xl p-4 relative">
                <button type="button" onClick={() => removePakalpojums(p._key)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-lg leading-none">×</button>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">Nosaukums *</label>
                    <input value={p.nosaukums} onChange={e => updatePakalpojums(p._key, 'nosaukums', e.target.value)}
                      placeholder="Santehniskie darbi"
                      className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">Ikona</label>
                    <div className="flex gap-1 flex-wrap">
                      {EMOJI_OPTIONS.map(e => (
                        <button key={e} type="button" onClick={() => updatePakalpojums(p._key, 'ikona', e)}
                          className={`text-lg w-8 h-8 rounded border transition ${p.ikona === e ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-400'}`}>
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 mb-3">
                  <label className="text-xs font-medium text-gray-600">Apraksts</label>
                  <textarea value={p.apraksts} onChange={e => updatePakalpojums(p._key, 'apraksts', e.target.value)}
                    rows={2} placeholder="Cauruļu remonts, ūdens sistēmas uzstādīšana..."
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">Cena no (€)</label>
                    <input type="number" value={p.cena_no} onChange={e => updatePakalpojums(p._key, 'cena_no', e.target.value)}
                      placeholder="25"
                      className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">Cena līdz (€)</label>
                    <input type="number" value={p.cena_lidz} onChange={e => updatePakalpojums(p._key, 'cena_lidz', e.target.value)}
                      placeholder="80"
                      className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Pakalpojumu saraksts (katrs jaunā rindā)</label>
                  <textarea value={p.items} onChange={e => updatePakalpojums(p._key, 'items', e.target.value)}
                    rows={3} placeholder={"Krānu nomaiņa\nWC remonts\nBoileru uzstādīšana"}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono" />
                </div>
              </div>
            ))}
            <button type="button" onClick={addPakalpojums}
              className="border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition font-medium">
              + Pievienot pakalpojumu
            </button>
          </div>
        </section>

        {/* ── SADAĻA 11: Atsauksmes ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionHeader n={11} title="Atsauksmes" />
          <div className="flex flex-col gap-4">
            {atsauksmes.map(a => (
              <div key={a._key} className="border border-gray-200 rounded-xl p-4 relative">
                <button type="button" onClick={() => removeAtsauksme(a._key)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-lg leading-none">×</button>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">Autors *</label>
                    <input value={a.autors} onChange={e => updateAtsauksme(a._key, 'autors', e.target.value)}
                      placeholder="Ilze Bērziņa"
                      className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">Datums</label>
                    <input value={a.datums} onChange={e => updateAtsauksme(a._key, 'datums', e.target.value)}
                      placeholder="Maijs 2026"
                      className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="flex flex-col gap-1 mb-3">
                  <label className="text-xs font-medium text-gray-600">Teksts *</label>
                  <textarea value={a.teksts} onChange={e => updateAtsauksme(a._key, 'teksts', e.target.value)}
                    rows={3} placeholder="Lielisks speciālists, izdarīja ātri un kvalitatīvi!"
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <div className="flex items-center gap-1">
                  <label className="text-xs font-medium text-gray-600 mr-2">Vērtējums:</label>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => updateAtsauksme(a._key, 'vertejums', n)}
                      className={`text-xl transition ${n <= a.vertejums ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ★
                    </button>
                  ))}
                  <span className="text-xs text-gray-400 ml-1">{a.vertejums}/5</span>
                </div>
              </div>
            ))}
            <button type="button" onClick={addAtsauksme}
              className="border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition font-medium">
              + Pievienot atsauksmi
            </button>
          </div>
        </section>

        {/* ── SADAĻA 12: SEO ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionHeader n={12} title="SEO" />
          <div className="flex flex-col gap-4">
            <InputField label="Meta title (auto-ģenerēts)" value={form.meta_title}
              onChange={v => set('meta_title', v)} hint="Ieteicamais garums: 50–60 rakstzīmes" />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Meta description (auto-ģenerēts)</label>
              <textarea value={form.meta_description} onChange={e => set('meta_description', e.target.value)}
                rows={2} maxLength={160}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <p className="text-xs text-gray-400 text-right">{form.meta_description.length} / 155</p>
            </div>
          </div>
        </section>

        {/* ── SADAĻA 13: Publicēšana ── */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionHeader n={13} title="Publicēšana" />
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Demo slug</label>
                <input value={form.demo_slug} onChange={e => set('demo_slug', e.target.value)}
                  placeholder="janis-berzins"
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Demo URL</label>
                <input readOnly value={form.demo_slug ? `promeistars.lv/meistari/${form.demo_slug}` : '—'}
                  className="border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500" />
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)}
                  className="rounded text-blue-600" />
                Rādīt TOP sarakstā (featured)
              </label>
              {form.featured && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Featured līdz</label>
                  <input type="date" value={form.featured_lidz} onChange={e => set('featured_lidz', e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
              <div className={`w-2.5 h-2.5 rounded-full ${form.publiskets ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-700">
                {form.publiskets ? 'Publicēts' : 'Nav publicēts (melnraksts)'}
              </span>
            </div>
          </div>
        </section>

      </div>

      {/* ── AI Apraksta modālis ── */}
      {aiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col gap-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">✨ AI apraksta ģenerators</h3>
              <button type="button" onClick={() => setAiModal(false)}
                className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
            </div>

            {/* Mode toggle */}
            <div className="flex border-b border-gray-100">
              {(['manual', 'auto'] as const).map(m => (
                <button key={m} type="button" onClick={() => setAiMode(m)}
                  className={`flex-1 py-2.5 text-xs font-semibold transition ${
                    aiMode === m
                      ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}>
                  {m === 'manual' ? '📋 Manuālais režīms (Claude.ai)' : '⚡ Auto režīms (API)'}
                </button>
              ))}
            </div>

            <div className="px-6 py-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
              {aiMode === 'manual' ? (
                <>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-600">1. Nokopē šo prompt:</p>
                      <button type="button" onClick={copyPrompt}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition ${copied ? 'bg-green-50 text-green-700 border-green-300' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                        {copied ? '✓ Nokopēts!' : '📋 Kopēt'}
                      </button>
                    </div>
                    <textarea readOnly value={aiPrompt} rows={6}
                      className="border rounded-lg px-3 py-2 text-xs text-gray-600 bg-gray-50 resize-none font-mono" />
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-700">
                    <p className="font-semibold mb-1">2. Atvērt Claude.ai un ielīmēt prompt:</p>
                    <a href="https://claude.ai" target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 underline font-medium">
                      🔗 Atvērt Claude.ai
                    </a>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium text-gray-600">3. Ielīmē Claude atbildi šeit:</p>
                    <textarea value={aiResult} onChange={e => setAiResult(e.target.value)}
                      rows={4} placeholder="Ielīmē ģenerēto aprakstu šeit..."
                      className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-600">Ģenerētais apraksts:</p>
                      <button type="button" onClick={autoGenerate} disabled={aiGenerating}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition">
                        {aiGenerating ? 'Ģenerē...' : '⚡ Ģenerēt'}
                      </button>
                    </div>
                    {!aiResult && !aiGenerating && (
                      <p className="text-xs text-gray-400 italic">Nospied &quot;Ģenerēt&quot; lai izveidotu aprakstu</p>
                    )}
                    {aiGenerating && (
                      <p className="text-xs text-purple-600 animate-pulse">Saziņa ar AI...</p>
                    )}
                    {aiResult && (
                      <textarea value={aiResult} onChange={e => setAiResult(e.target.value)}
                        rows={5}
                        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                    )}
                  </div>
                </>
              )}

              {/* RU→LV translate */}
              {aiResult && (
                <button type="button" onClick={translateToLv} disabled={aiGenerating}
                  className="self-start px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 disabled:opacity-50 transition">
                  {aiGenerating ? 'Tulko...' : '🇱🇻 Iztulkot uz latviešu valodu'}
                </button>
              )}

              {aiError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{aiError}</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button type="button" onClick={() => setAiModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition">
                Atcelt
              </button>
              <button type="button" onClick={applyAiResult} disabled={!aiResult.trim()}
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 transition">
                Saglabāt aprakstu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fixed bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between z-30">
        <div>
          {saveMsg && <span className="text-sm text-green-600 font-medium">{saveMsg}</span>}
          {error && <span className="text-sm text-red-500">{error}</span>}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => save(false)} disabled={saving}
            className="px-5 py-2 text-sm font-semibold rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition">
            {saving ? 'Saglabā...' : 'Saglabāt melnrakstu'}
          </button>
          <button type="button" onClick={() => save(true)} disabled={saving}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition">
            Saglabāt un priekšskatīt →
          </button>
        </div>
      </div>
    </div>
  )
}
