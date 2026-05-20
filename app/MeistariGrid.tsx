'use client'

import { useState } from 'react'
import Link from 'next/link'
import { demo_meistari } from '@/lib/demo-meistari'

const KATEGORIJAS = [
  'Visi',
  'Santehniskie darbi',
  'Elektriskie darbi',
  'Remontdarbi',
  'Frizieri',
]

const REGIONI = ['Visi', 'Rīga', 'Jūrmala', 'Jelgava', 'Ogre', 'Sigulda']

const selectClass =
  'rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer'

export default function MeistariGrid() {
  const [kategorija, setKategorija] = useState('Visi')
  const [regions, setRegions] = useState('Visi')

  const filtrets = demo_meistari.filter((m) => {
    if (kategorija !== 'Visi' && m.kategorija !== kategorija) return false
    if (regions !== 'Visi' && !m.regioni.includes(regions)) return false
    return true
  })

  return (
    <section id="meistari" className="py-16 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4">

        {/* Filtru josla */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <select
            value={kategorija}
            onChange={(e) => setKategorija(e.target.value)}
            className={`${selectClass} sm:w-64`}
          >
            {KATEGORIJAS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <select
            value={regions}
            onChange={(e) => setRegions(e.target.value)}
            className={`${selectClass} sm:w-48`}
          >
            {REGIONI.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Empty state */}
        {filtrets.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-xl font-semibold text-gray-800">
              Šajā kategorijā meistari drīz parādīsies
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-6 py-3 text-sm font-semibold hover:bg-blue-700 transition"
            >
              Esi meistars? Piesakies →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {filtrets.map((m) => (
              <div
                key={m.vards}
                className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                {/* Galvene */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {m.iniciāļi}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{m.vards}</p>
                    <span className="inline-block mt-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-0.5">
                      {m.specialitate}
                    </span>
                  </div>
                </div>

                {/* Reģioni */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {m.regioni.map((r) => (
                    <span
                      key={r}
                      className="rounded-full bg-gray-100 text-gray-500 text-xs px-2.5 py-0.5"
                    >
                      {r}
                    </span>
                  ))}
                </div>

                {/* Reitings + cena */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-amber-400 text-sm">★</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {m.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({m.atsauksmes_skaits} atsauksmes)
                  </span>
                  <span className="ml-auto text-sm font-semibold text-gray-800">
                    no €{m.cena_no}/h
                  </span>
                </div>

                {/* CTA */}
                <a
                  href={m.subdomens}
                  className="mt-4 block w-full text-center rounded-full border border-blue-600 text-blue-600 text-sm font-semibold py-2 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Skatīt profilu →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
