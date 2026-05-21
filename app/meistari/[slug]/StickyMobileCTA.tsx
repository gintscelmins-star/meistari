'use client'

import { Phone, MessageCircle } from 'lucide-react'

type Props = {
  telUrl: string | null
  waUrl: string | null
  vards: string
}

export default function StickyMobileCTA({ telUrl, waUrl, vards }: Props) {
  if (!telUrl && !waUrl) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white border-t border-border px-4 py-3 flex gap-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      {telUrl && (
        <a
          href={telUrl}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-brand text-brand-foreground px-4 py-3 font-semibold text-sm hover:opacity-90 transition"
        >
          <Phone className="h-4 w-4" /> Zvanīt {vards}
        </a>
      )}
      {waUrl && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] text-white px-4 py-3 font-semibold text-sm hover:opacity-90 transition"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      )}
    </div>
  )
}
