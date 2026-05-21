'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { demo_meistari } from '@/lib/demo-meistari'
import { pakalpojumi } from '@/lib/pakalpojumi'
import type { Valoda } from './page'

type Props = { valoda: Valoda }

const REGIONI = [
  'Visi reģioni', 'Rīga', 'Jūrmala', 'Jelgava',
  'Ogre', 'Sigulda', 'Liepāja', 'Daugavpils', 'Ventspils',
]

const DARBA_LAIKU_OPCIJAS = [
  { id: 'jebkurš',      lv: 'Jebkurš laiks',              ru: 'Любое время' },
  { id: 'darba-dienas', lv: 'Darba dienās (Pirmd–Piektd)', ru: 'В рабочие дни (Пн–Пт)' },
  { id: 'sestdiena',    lv: 'Sestdienās',                  ru: 'По субботам' },
  { id: 'svetdiena',    lv: 'Svētdienās',                  ru: 'По воскресеньям' },
  { id: '24-7',         lv: '24/7 pieejams',               ru: '24/7 доступен' },
]

const WEEKDAYS = ['Pirmd', 'Otrd', 'Trešd', 'Ceturtd', 'Piektd']

const txt = {
  allKat:    { lv: 'Visas kategorijas', ru: 'Все категории' },
  allApak:   { lv: 'Visas apakškategorijas', ru: 'Все подкатегории' },
  allPak:    { lv: 'Visi pakalpojumi', ru: 'Все услуги' },
  search:    { lv: 'Meklēt meistaru...', ru: 'Поиск мастера...' },
  clear:     { lv: 'Notīrīt', ru: 'Сбросить' },
  empty1:    { lv: 'Nevienu meistaru neatrada', ru: 'Мастера не найдены' },
  empty2:    { lv: 'Mēģiniet mainīt filtrus vai', ru: 'Попробуйте изменить фильтры или' },
  emptyBtn:  { lv: 'Esi meistars? Piesakies →', ru: 'Ты мастер? Зарегистрируйся →' },
  profile:   { lv: 'Skatīt profilu →', ru: 'Смотреть профиль →' },
  reviews:   { lv: 'atsauksmes', ru: 'отзывов' },
  from:      { lv: 'no', ru: 'от' },
  per_h:     { lv: '/h', ru: '/ч' },
  emergency: { lv: '24/7', ru: '24/7' },
}

function formatDienas(dienas: string[]): string {
  const hasAllWeekdays = WEEKDAYS.every(d => dienas.includes(d))
  const hasSestd = dienas.includes('Sestd')
  const hasSvetd = dienas.includes('Svētd')

  const parts: string[] = []
  if (hasAllWeekdays) {
    parts.push('Pirmd–Piektd')
  } else {
    const wd = WEEKDAYS.filter(d => dienas.includes(d))
    if (wd.length > 0) parts.push(wd.join(', '))
  }
  if (hasSestd) parts.push('Sestd')
  if (hasSvetd) parts.push('Svētd')
  return parts.join(', ')
}

const selectCls = 'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-0'

export default function MeistariGrid({ valoda }: Props) {
  const [kat1, setKat1] = useState('')
  const [kat2, setKat2] = useState('')
  const [kat3, setKat3] = useState('')
  const [regions, setRegions] = useState('Visi reģioni')
  const [darbaLaiks, setDarbaLaiks] = useState('jebkurš')
  const [meklesana, setMeklesana] = useState('')

  const apakskategorijas = useMemo(
    () => pakalpojumi.find(k => k.kategorija_lv === kat1)?.apakskategorijas ?? [],
    [kat1]
  )
  const pakalpojumiList = useMemo(
    () => apakskategorijas.find(ak => ak.nosaukums_lv === kat2)?.pakalpojumi ?? [],
    [apakskategorijas, kat2]
  )

  function clearFilters() {
    setKat1(''); setKat2(''); setKat3('')
    setRegions('Visi reģioni')
    setDarbaLaiks('jebkurš')
    setMeklesana('')
  }

  const hasFilter = kat1 || kat2 || kat3 || regions !== 'Visi reģioni' || darbaLaiks !== 'jebkurš' || meklesana.trim()

  const filtrets = useMemo(() => {
    return demo_meistari.filter(m => {
      // Kategorija / pakalpojums filter
      if (kat1) {
        const katObj = pakalpojumi.find(k => k.kategorija_lv === kat1)
        if (!katObj) return false
        if (kat2) {
          const apakObj = katObj.apakskategorijas.find(ak => ak.nosaukums_lv === kat2)
          if (!apakObj) return false
          if (kat3) {
            if (m.kategorija !== kat3) return false
          } else {
            if (!apakObj.pakalpojumi.some(p => p.lv === m.kategorija)) return false
          }
        } else {
          const found = katObj.apakskategorijas.some(ak =>
            ak.pakalpojumi.some(p => p.lv === m.kategorija)
          )
          if (!found) return false
        }
      }

      // Reģions filter
      if (regions !== 'Visi reģioni' && !m.regioni.includes(regions)) return false

      // Darba laiks filter
      if (darbaLaiks === '24-7' && !m.darba_laiks.avarijas) return false
      if (darbaLaiks === 'sestdiena' && !m.darba_laiks.dienas.includes('Sestd')) return false
      if (darbaLaiks === 'svetdiena' && !m.darba_laiks.dienas.includes('Svētd')) return false
      if (darbaLaiks === 'darba-dienas' && !WEEKDAYS.some(d => m.darba_laiks.dienas.includes(d))) return false

      // Meklēšana
      if (meklesana.trim()) {
        const q = meklesana.toLowerCase()
        const spec = valoda === 'ru' ? m.specialitate_ru : m.specialitate_lv
        if (!m.vards.toLowerCase().includes(q) && !spec.toLowerCase().includes(q)) return false
      }

      return true
    })
  }, [kat1, kat2, kat3, regions, darbaLaiks, meklesana, valoda])

  return (
    <section id="meistari" className="bg-gray-50">

      {/* Filtru josla — sticky zem nav */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex flex-wrap gap-2 items-center">

            {/* Kategorija — 3 pakāpes */}
            <select
              value={kat1}
              onChange={e => { setKat1(e.target.value); setKat2(''); setKat3('') }}
              className={selectCls}
            >
              <option value="">{txt.allKat[valoda]}</option>
              {pakalpojumi.map(k => (
                <option key={k.kategorija_lv} value={k.kategorija_lv}>
                  {valoda === 'ru' ? k.kategorija_ru : k.kategorija_lv}
                </option>
              ))}
            </select>

            {kat1 && (
              <select
                value={kat2}
                onChange={e => { setKat2(e.target.value); setKat3('') }}
                className={selectCls}
              >
                <option value="">{txt.allApak[valoda]}</option>
                {apakskategorijas.map(ak => (
                  <option key={ak.nosaukums_lv} value={ak.nosaukums_lv}>
                    {valoda === 'ru' ? ak.nosaukums_ru : ak.nosaukums_lv}
                  </option>
                ))}
              </select>
            )}

            {kat2 && (
              <select
                value={kat3}
                onChange={e => setKat3(e.target.value)}
                className={selectCls}
              >
                <option value="">{txt.allPak[valoda]}</option>
                {pakalpojumiList.map(p => (
                  <option key={p.lv} value={p.lv}>
                    {valoda === 'ru' ? p.ru : p.lv}
                  </option>
                ))}
              </select>
            )}

            {/* Reģions */}
            <select
              value={regions}
              onChange={e => setRegions(e.target.value)}
              className={selectCls}
            >
              {REGIONI.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* Darba laiks */}
            <select
              value={darbaLaiks}
              onChange={e => setDarbaLaiks(e.target.value)}
              className={selectCls}
            >
              {DARBA_LAIKU_OPCIJAS.map(o => (
                <option key={o.id} value={o.id}>
                  {valoda === 'ru' ? o.ru : o.lv}
                </option>
              ))}
            </select>

            {/* Meklēšana */}
            <input
              type="text"
              value={meklesana}
              onChange={e => setMeklesana(e.target.value)}
              placeholder={txt.search[valoda]}
              className="flex-1 min-w-[180px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Notīrīt */}
            {hasFilter && (
              <button
                onClick={clearFilters}
                className="text-xs text-blue-600 font-semibold hover:underline whitespace-nowrap px-1"
              >
                {txt.clear[valoda]}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kartītes */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        {filtrets.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-xl font-semibold text-gray-800">{txt.empty1[valoda]}</p>
            <p className="text-gray-400 mt-2">{txt.empty2[valoda]}</p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center rounded-full bg-blue-600 text-white px-6 py-3 text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              {txt.emptyBtn[valoda]}
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtrets.map(m => {
              const spec = valoda === 'ru' ? m.specialitate_ru : m.specialitate_lv
              const dienasStr = formatDienas(m.darba_laiks.dienas)

              return (
                <div
                  key={m.vards}
                  className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
                >
                  {/* Galvene */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {m.iniciāļi}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{m.vards}</p>
                      <span className="inline-block mt-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-0.5">
                        {spec}
                      </span>
                    </div>
                  </div>

                  {/* Reģioni */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.regioni.map(r => (
                      <span key={r} className="rounded-full bg-gray-100 text-gray-500 text-xs px-2.5 py-0.5">
                        {r}
                      </span>
                    ))}
                  </div>

                  {/* Darba laiks */}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500">
                      {dienasStr} {m.darba_laiks.no}–{m.darba_laiks.lidz}
                    </span>
                    {m.darba_laiks.avarijas && (
                      <span className="rounded-full bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5">
                        {txt.emergency[valoda]}
                      </span>
                    )}
                  </div>

                  {/* Reitings + cena */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-amber-400 text-sm leading-none">★</span>
                    <span className="text-sm font-semibold text-gray-800">{m.rating.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">({m.atsauksmes_skaits} {txt.reviews[valoda]})</span>
                    <span className="ml-auto text-sm font-semibold text-gray-900">
                      {txt.from[valoda]} €{m.cena_no}{txt.per_h[valoda]}
                    </span>
                  </div>

                  {/* CTA */}
                  <Link
                    href={m.subdomens}
                    className="mt-4 block w-full text-center rounded-full border border-blue-600 text-blue-600 text-sm font-semibold py-2 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    {txt.profile[valoda]}
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
