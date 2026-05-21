'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

type Foto = { id: string; url: string; apraksts: string | null }

export default function FotoGalerija({ fotos, meistaraNosaukums }: { fotos: Foto[]; meistaraNosaukums: string }) {
  const [active, setActive] = useState<number | null>(null)

  const close = useCallback(() => setActive(null), [])
  const prev = useCallback(() => setActive(i => i != null ? (i - 1 + fotos.length) % fotos.length : null), [fotos.length])
  const next = useCallback(() => setActive(i => i != null ? (i + 1) % fotos.length : null), [fotos.length])

  useEffect(() => {
    if (active === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [active, close, prev, next])

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {fotos.map((f, i) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActive(i)}
            className="reveal rounded-2xl overflow-hidden aspect-square bg-secondary focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <img
              src={f.url}
              alt={f.apraksts ?? meistaraNosaukums}
              className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={close}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 grid place-items-center rounded-full bg-white/20 text-white hover:bg-white/40 transition"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="max-w-3xl w-full px-16" onClick={e => e.stopPropagation()}>
            <img
              src={fotos[active].url}
              alt={fotos[active].apraksts ?? meistaraNosaukums}
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
            {fotos[active].apraksts && (
              <p className="mt-3 text-center text-sm text-white/80">{fotos[active].apraksts}</p>
            )}
            <p className="mt-1 text-center text-xs text-white/50">{active + 1} / {fotos.length}</p>
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 grid place-items-center rounded-full bg-white/20 text-white hover:bg-white/40 transition"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 h-10 w-10 grid place-items-center rounded-full bg-white/20 text-white hover:bg-white/40 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  )
}
