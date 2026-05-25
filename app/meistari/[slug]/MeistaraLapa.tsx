import Link from 'next/link'
import { Phone } from 'lucide-react'

type DarbaLaiksRinda = {
  diena: string
  no: string
  lidz: string
  strada: boolean
}

type ProspectMeistars = {
  id: string
  vards: string
  uzvards: string
  nodarbosanas: string | null
  regions: string | null
  apraksts: string | null
  telefons: string
  foto_hero: string | null
  foto_darbs_1: string | null
  foto_darbs_2: string | null
  foto_darbs_3: string | null
  foto_darbs_4: string | null
  foto_profils: string | null
  darba_laiki: DarbaLaiksRinda[] | null
  pakalpojumi: string[] | null
}

const SPECIALITATE_LABEL: Record<string, string> = {
  santehnikis: 'Santehniķis',
  elektrikis: 'Elektriķis',
}

const PLACEHOLDER_HERO = 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&q=80'
const PLACEHOLDER_DARBS = [
  'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80',
  'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&q=80',
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80',
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80',
]

export default function MeistaraLapa({ meistars }: { meistars: ProspectMeistars }) {
  const specialitate = SPECIALITATE_LABEL[meistars.nodarbosanas ?? ''] ?? 'Meistars'
  const pilseta = meistars.regions?.split(',')[0]?.trim() ?? 'Latvijā'
  const tels = meistars.telefons.replace(/\D/g, '')

  const darbiFotos = [
    meistars.foto_darbs_1 ?? PLACEHOLDER_DARBS[0],
    meistars.foto_darbs_2 ?? PLACEHOLDER_DARBS[1],
    meistars.foto_darbs_3 ?? PLACEHOLDER_DARBS[2],
    meistars.foto_darbs_4 ?? PLACEHOLDER_DARBS[3],
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img
          src={meistars.foto_hero ?? PLACEHOLDER_HERO}
          alt={`${meistars.vards} ${meistars.uzvards}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <p className="text-sm font-medium text-blue-300 uppercase tracking-wide">{specialitate}</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">
            {meistars.vards} {meistars.uzvards}
          </h1>
          <p className="text-sm text-gray-300 mt-1">{pilseta}</p>
        </div>
      </div>

      {/* CTA */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">{meistars.vards} {meistars.uzvards}</p>
          <p className="text-xs text-gray-500">{specialitate} · {pilseta}</p>
        </div>
        <a
          href={`tel:${meistars.telefons}`}
          className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition"
        >
          <Phone className="w-4 h-4" />
          Zvanīt
        </a>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-10">
        {/* Pakalpojumi */}
        {meistars.pakalpojumi && meistars.pakalpojumi.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Pakalpojumi</h2>
            <div className="grid grid-cols-2 gap-2">
              {meistars.pakalpojumi.map(p => (
                <div key={p} className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                  <span className="text-blue-500 text-sm">✓</span>
                  <span className="text-sm text-gray-700">{p}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Darba foto */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Darbu paraugi</h2>
          <div className="grid grid-cols-2 gap-2">
            {darbiFotos.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Darbs ${i + 1}`}
                className="w-full h-36 object-cover rounded-xl"
              />
            ))}
          </div>
        </section>

        {/* Par meistaru */}
        {(meistars.apraksts || meistars.foto_profils) && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Par meistaru</h2>
            <div className="flex gap-4">
              {meistars.foto_profils && (
                <img
                  src={meistars.foto_profils}
                  alt={meistars.vards}
                  className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div>
                <p className="font-semibold text-gray-900">{meistars.vards} {meistars.uzvards}</p>
                <p className="text-sm text-gray-500 mb-2">{specialitate}</p>
                {meistars.apraksts && (
                  <p className="text-sm text-gray-700 leading-relaxed">{meistars.apraksts}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Darba laiki */}
        {meistars.darba_laiki && meistars.darba_laiki.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Darba laiki</h2>
            <div className="flex flex-col gap-1">
              {meistars.darba_laiki.map(row => (
                <div key={row.diena} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700 w-28">{row.diena}</span>
                  {row.strada ? (
                    <span className="text-sm text-gray-600">{row.no} – {row.lidz}</span>
                  ) : (
                    <span className="text-sm text-gray-400">Slēgts</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Kontakti */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Kontakti</h2>
          <a
            href={`tel:${meistars.telefons}`}
            className="flex items-center gap-3 bg-blue-600 text-white rounded-xl px-5 py-4 font-semibold hover:bg-blue-700 transition w-full justify-center text-base"
          >
            <Phone className="w-5 h-5" />
            {meistars.telefons}
          </a>
        </section>

        <div className="text-center border-t pt-4 mt-2">
          <p className="text-xs text-gray-500 mb-1">
            Lapa izveidota ar{' '}
            <a href="https://promeistars.lv" className="text-blue-600 hover:underline font-medium">
              ProMeistars
            </a>
          </p>
          <p className="text-xs text-gray-300">
            <a href="/privacy" className="hover:text-gray-500">Privātums</a>
            {' · '}
            <a href="/terms" className="hover:text-gray-500">Noteikumi</a>
          </p>
        </div>
      </div>
    </div>
  )
}
