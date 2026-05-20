'use client'

import { useRef, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import { Camera, Loader2 } from 'lucide-react'

type Props = {
  meistarsId: string
  currentUrl: string | null
  vards: string
  onUploaded: (url: string) => void
}

export default function FotoUpload({ meistarsId, currentUrl, vards, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Fails ir pārāk liels (maks. 5 MB)')
      return
    }

    setError('')
    setUploading(true)

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `${meistarsId}/avatar.${ext}`

    const supabase = getSupabaseClient()

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      setError('Augšupielāde neizdevās')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path)

    // pievienojam cache-busting, jo upsert nemaina URL
    const urlWithTs = `${publicUrl}?t=${Date.now()}`

    const { error: dbError } = await supabase
      .from('meistari')
      .update({ foto_url: publicUrl })
      .eq('id', meistarsId)

    if (dbError) {
      setError('Neizdevās saglabāt URL')
    } else {
      setPreview(urlWithTs)
      onUploaded(publicUrl)
    }

    setUploading(false)
  }

  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex-shrink-0 group"
      >
        {preview ? (
          <img
            src={preview}
            alt={vards}
            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-border group-hover:ring-brand transition"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-brand-soft flex items-center justify-center text-2xl font-bold text-brand ring-2 ring-border group-hover:ring-brand transition">
            {vards[0] ?? '?'}
          </div>
        )}
        <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          {uploading
            ? <Loader2 className="h-5 w-5 text-white animate-spin" />
            : <Camera className="h-5 w-5 text-white" />
          }
        </div>
      </button>

      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-sm font-semibold text-brand hover:underline disabled:opacity-50"
        >
          {uploading ? 'Augšupielādē...' : 'Mainīt foto'}
        </button>
        <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP — maks. 5 MB</p>
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
