import Link from 'next/link'
import { Star, MapPin } from 'lucide-react'
import type { Meistars } from '@/lib/supabase'

type Props = {
  meistars: Meistars & {
    regioni: string[]
    cena_no: number | null
  }
}

export default function MeistarsCard({ meistars }: Props) {
  const pilnaisVards = `${meistars.vards} ${meistars.uzvards}`

  return (
    <Link href={`/meistari/${meistars.slug}`} className="block group">
      <div className="rounded-2xl bg-white border border-border p-6 hover:shadow-lg hover:-translate-y-1 transition h-full">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {meistars.foto_url ? (
              <img
                src={meistars.foto_url}
                alt={pilnaisVards}
                className="w-14 h-14 rounded-xl object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-brand-soft flex items-center justify-center text-xl font-bold text-brand">
                {meistars.vards[0]}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-foreground leading-tight group-hover:text-brand transition-colors">
                {pilnaisVards}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0 text-brand">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="text-sm font-semibold">
                  {(meistars.rating ?? 0).toFixed(1)}
                </span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">{meistars.specialitate}</p>
          </div>
        </div>

        {meistars.regioni.length > 0 && (
          <div className="mt-4 flex items-center gap-1.5 flex-wrap">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            {meistars.regioni.slice(0, 3).map((r) => (
              <span key={r} className="text-xs text-muted-foreground">{r}</span>
            ))}
            {meistars.regioni.length > 3 && (
              <span className="text-xs text-muted-foreground">+{meistars.regioni.length - 3}</span>
            )}
          </div>
        )}

        {meistars.cena_no !== null && (
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">No</span>
            <span className="text-lg font-bold text-foreground">{meistars.cena_no}€</span>
          </div>
        )}
      </div>
    </Link>
  )
}
