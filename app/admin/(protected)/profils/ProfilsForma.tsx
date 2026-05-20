'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import type { Meistars, Pakalpojums } from '@/lib/supabase'
import FotoUpload from './FotoUpload'

type Props = {
  meistars: Meistars
  pakalpojumi: Pakalpojums[]
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const inputClass = "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
const labelClass = "block text-sm font-semibold text-foreground mb-1.5"

export default function ProfilsForma({ meistars, pakalpojumi: initPakalpojumi }: Props) {
  const router = useRouter()
  const [vards, setVards] = useState(meistars.vards)
  const [uzvards, setUzvards] = useState(meistars.uzvards)
  const [specialitate, setSpecialitate] = useState(meistars.specialitate)
  const [telefons, setTelefons] = useState(meistars.telefons)
  const [pilseta, setPilseta] = useState(meistars.pilseta ?? '')
  const [apraksts, setApraksts] = useState(meistars.apraksts ?? '')
  const [pieredzeGadi, setPieredzeGadi] = useState(meistars.pieredze_gadi ?? 0)
  const [saveState, setSaveState] = useState<SaveState>('idle')

  const [pakalpojumi, setPakalpojumi] = useState(initPakalpojumi)
  const [jaunsPak, setJaunsPak] = useState({ nosaukums: '', cena_no: '', ilgums_h: '' })
  const [pakSave, setPakSave] = useState<SaveState>('idle')

  async function handleProfilsSave(e: React.FormEvent) {
    e.preventDefault()
    setSaveState('saving')
    const supabase = getSupabaseClient()

    const { error } = await supabase
      .from('meistari')
      .update({
        vards, uzvards, specialitate, telefons,
        pilseta: pilseta || null,
        apraksts: apraksts || null,
        pieredze_gadi: pieredzeGadi,
      })
      .eq('id', meistars.id)

    if (error) {
      setSaveState('error')
    } else {
      setSaveState('saved')
      router.refresh()
      setTimeout(() => setSaveState('idle'), 2000)
    }
  }

  async function handlePakAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!jaunsPak.nosaukums || !jaunsPak.cena_no) return
    setPakSave('saving')
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('pakalpojumi')
      .insert({
        meistars_id: meistars.id,
        nosaukums: jaunsPak.nosaukums,
        cena_no: parseFloat(jaunsPak.cena_no),
        ilgums_h: jaunsPak.ilgums_h ? parseFloat(jaunsPak.ilgums_h) : null,
      })
      .select()
      .single()

    if (!error && data) {
      setPakalpojumi((prev) => [...prev, data])
      setJaunsPak({ nosaukums: '', cena_no: '', ilgums_h: '' })
    }
    setPakSave(error ? 'error' : 'idle')
  }

  async function handlePakDelete(id: string) {
    const supabase = getSupabaseClient()
    await supabase.from('pakalpojumi').delete().eq('id', id)
    setPakalpojumi((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Foto */}
      <div className="rounded-2xl bg-white border border-border p-6">
        <h2 className="font-semibold text-foreground mb-4">Profila foto</h2>
        <FotoUpload
          meistarsId={meistars.id}
          currentUrl={meistars.foto_url}
          vards={vards}
          onUploaded={() => router.refresh()}
        />
      </div>

      {/* Pamatdati */}
      <form onSubmit={handleProfilsSave} className="rounded-2xl bg-white border border-border p-6 space-y-5">
        <h2 className="font-semibold text-foreground">Pamatinformācija</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Vārds</label>
            <input type="text" required value={vards}
              onChange={(e) => setVards(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Uzvārds</label>
            <input type="text" required value={uzvards}
              onChange={(e) => setUzvards(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Specialitāte</label>
          <input type="text" required value={specialitate}
            onChange={(e) => setSpecialitate(e.target.value)} className={inputClass} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tālrunis</label>
            <input type="tel" required value={telefons}
              onChange={(e) => setTelefons(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Pilsēta</label>
            <input type="text" value={pilseta}
              onChange={(e) => setPilseta(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Pieredze (gadi)</label>
          <input type="number" min={0} max={60} value={pieredzeGadi}
            onChange={(e) => setPieredzeGadi(parseInt(e.target.value) || 0)}
            className="w-28 rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand" />
        </div>

        <div>
          <label className={labelClass}>Apraksts</label>
          <textarea rows={3} value={apraksts}
            onChange={(e) => setApraksts(e.target.value)}
            placeholder="Pastāstiet par savu pieredzi un piedāvātajiem pakalpojumiem..."
            className={`${inputClass} resize-none`} />
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={saveState === 'saving'}
            className="inline-flex items-center justify-center rounded-full bg-brand text-brand-foreground px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-60">
            {saveState === 'saving' ? 'Saglabā...' : 'Saglabāt izmaiņas'}
          </button>
          {saveState === 'saved' && <span className="text-sm text-green-600">Saglabāts!</span>}
          {saveState === 'error' && <span className="text-sm text-destructive">Kļūda. Mēģiniet vēlreiz.</span>}
        </div>
      </form>

      {/* Pakalpojumi */}
      <div className="rounded-2xl bg-white border border-border p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Pakalpojumi</h2>

        {pakalpojumi.length > 0 && (
          <div className="space-y-2">
            {pakalpojumi.map((p) => (
              <div key={p.id} className="flex items-center justify-between border border-border rounded-xl px-4 py-3">
                <div>
                  <span className="text-sm font-medium text-foreground">{p.nosaukums}</span>
                  <span className="text-sm text-muted-foreground ml-3">no {p.cena_no}€</span>
                  {p.ilgums_h && <span className="text-xs text-muted-foreground ml-2">{p.ilgums_h}h</span>}
                </div>
                <button onClick={() => handlePakDelete(p.id)}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                  Dzēst
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handlePakAdd} className="border border-dashed border-border rounded-xl p-4 space-y-3">
          <p className="text-sm text-muted-foreground font-medium">Pievienot pakalpojumu</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <input type="text" placeholder="Nosaukums" value={jaunsPak.nosaukums}
              onChange={(e) => setJaunsPak((p) => ({ ...p, nosaukums: e.target.value }))}
              className={inputClass} />
            <input type="number" placeholder="Cena no (€)" min={0} step={0.01} value={jaunsPak.cena_no}
              onChange={(e) => setJaunsPak((p) => ({ ...p, cena_no: e.target.value }))}
              className={inputClass} />
            <input type="number" placeholder="Ilgums (h, neob.)" min={0} step={0.5} value={jaunsPak.ilgums_h}
              onChange={(e) => setJaunsPak((p) => ({ ...p, ilgums_h: e.target.value }))}
              className={inputClass} />
          </div>
          <button type="submit" disabled={pakSave === 'saving'}
            className="text-sm bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-60">
            {pakSave === 'saving' ? 'Pievieno...' : '+ Pievienot'}
          </button>
        </form>
      </div>
    </div>
  )
}
