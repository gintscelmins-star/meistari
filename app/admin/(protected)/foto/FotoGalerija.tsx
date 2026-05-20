'use client'

import { useRef, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { Loader2, Trash2, Upload } from 'lucide-react'

type Foto = {
  id: string
  url: string
  apraksts: string | null
  kartiba: number | null
}

type Props = {
  meistarsId: string
  initialFoto: Foto[]
}

const MAX_FOTO = 10

export default function FotoGalerija({ meistarsId, initialFoto }: Props) {
  const [foto, setFoto] = useState(initialFoto)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    if (foto.length + files.length > MAX_FOTO) {
      setError(`Var augšupielādēt maks. ${MAX_FOTO} fotogrāfijas.`)
      return
    }

    setError('')
    setUploading(true)
    const supabase = getSupabaseClient()

    for (const file of files) {
      if (file.size > 8 * 1024 * 1024) {
        setError('Fails pārāk liels (maks. 8 MB)')
        continue
      }

      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `${meistarsId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('meistaru-foto')
        .upload(path, file, { contentType: file.type })

      if (upErr) { setError('Augšupielāde neizdevās'); continue }

      const { data: { publicUrl } } = supabase.storage.from('meistaru-foto').getPublicUrl(path)

      const { data: row, error: dbErr } = await supabase
        .from('meistara_foto')
        .insert({ meistars_id: meistarsId, url: publicUrl, kartiba: foto.length })
        .select()
        .single()

      if (!dbErr && row) setFoto((prev) => [...prev, row])
    }

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleDelete(id: string, url: string) {
    const supabase = getSupabaseClient()
    const path = url.split('/meistaru-foto/')[1]
    if (path) await supabase.storage.from('meistaru-foto').remove([path])
    await supabase.from('meistara_foto').delete().eq('id', id)
    setFoto((prev) => prev.filter((f) => f.id !== id))
  }

  async function handleApraksts(id: string, apraksts: string) {
    const supabase = getSupabaseClient()
    await supabase.from('meistara_foto').update({ apraksts: apraksts || null }).eq('id', id)
    setFoto((prev) => prev.map((f) => (f.id === id ? { ...f, apraksts } : f)))
  }

  return (
    <div className="space-y-6">
      {foto.length < MAX_FOTO && (
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-full bg-brand text-brand-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Augšupielādē...' : 'Pievienot fotogrāfijas'}
          </button>
          <p className="text-xs text-muted-foreground mt-1.5">
            JPG, PNG, WebP — maks. 8 MB. {foto.length}/{MAX_FOTO} pievienoti.
          </p>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
        </div>
      )}

      {foto.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center text-muted-foreground text-sm">
          <Upload className="h-8 w-8 mx-auto mb-3 opacity-30" />
          Nav pievienotu fotogrāfiju
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {foto.map((f) => (
            <div key={f.id} className="rounded-2xl overflow-hidden border border-border bg-white group">
              <div className="relative aspect-square">
                <img src={f.url} alt={f.apraksts ?? ''} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleDelete(f.id, f.url)}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Apraksts..."
                  defaultValue={f.apraksts ?? ''}
                  onBlur={(e) => handleApraksts(f.id, e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
