'use client'

import { useState } from 'react'
import Link from 'next/link'
import MeistariGrid from './MeistariGrid'
import { Logo } from '@/components/Logo'
import { Footer } from '@/components/Footer'

export type Valoda = 'lv' | 'ru'

const txt = {
  badge:      { lv: '🔧 300+ meistari reģistrējas',         ru: '🔧 Регистрируются 300+ мастеров' },
  h1:         { lv: 'Atrod uzticamu meistaru Latvijā',       ru: 'Найди надёжного мастера в Латвии' },
  sub:        { lv: 'Santehniķi, elektriķi, celtnieki un citi speciālisti — vienuviet. Ātra meklēšana, reālas atsauksmes.', ru: 'Сантехники, электрики, строители и другие специалисты — в одном месте. Быстрый поиск, реальные отзывы.' },
  cta1:       { lv: 'Atrast meistaru →',                    ru: 'Найти мастера →' },
  cta2:       { lv: 'Esmu meistars →',                      ru: 'Я мастер →' },
  footerH2:   { lv: 'Esi meistars? Izveido savu profila lapu', ru: 'Ты мастер? Создай свою страницу профиля' },
  footerSub:  { lv: '€19/mēn — pirmais mēnesis bezmaksas', ru: '€19/мес — первый месяц бесплатно' },
  footerBtn:  { lv: 'Reģistrēties →',                       ru: 'Зарегистрироваться →' },
  login:      { lv: 'Meistara ieeja',                       ru: 'Вход для мастера' },
  copy:       { lv: '© 2025 ProMeistars. Visas tiesības aizsargātas.', ru: '© 2025 ProMeistars. Все права защищены.' },
}

export default function HomePage() {
  const [valoda, setValoda] = useState<Valoda>('lv')

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <Logo />

          <div className="flex items-center gap-3">
            {/* Valodas toggle */}
            <div className="flex rounded-full border border-gray-200 overflow-hidden text-xs font-bold">
              <button
                onClick={() => setValoda('lv')}
                className={`px-3 py-1.5 transition-colors ${valoda === 'lv' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-800 bg-white'}`}
              >
                LV
              </button>
              <button
                onClick={() => setValoda('ru')}
                className={`px-3 py-1.5 transition-colors ${valoda === 'ru' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-800 bg-white'}`}
              >
                RU
              </button>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              {txt.cta2[valoda]}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — kompakts, max 60vh */}
      <section
        className="relative overflow-hidden bg-white"
        style={{
          maxHeight: '60vh',
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
            {txt.badge[valoda]}
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold leading-tight text-gray-900">
            {txt.h1[valoda]}
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-xl">
            {txt.sub[valoda]}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#meistari"
              className="inline-flex items-center rounded-full bg-blue-600 text-white px-6 py-3 text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              {txt.cta1[valoda]}
            </a>
            <Link
              href="/register"
              className="inline-flex items-center rounded-full border border-gray-300 text-gray-700 px-6 py-3 text-sm font-semibold hover:border-blue-600 hover:text-blue-600 transition-colors"
            >
              {txt.cta2[valoda]}
            </Link>
          </div>
        </div>
      </section>

      {/* Meistaru grid ar filtriem */}
      <MeistariGrid valoda={valoda} />

      {/* Footer CTA */}
      <section className="bg-blue-600 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">{txt.footerH2[valoda]}</h2>
          <p className="mt-3 text-blue-100 text-lg">{txt.footerSub[valoda]}</p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center rounded-full bg-white text-blue-600 px-8 py-3 text-sm font-bold hover:bg-blue-50 transition-colors"
          >
            {txt.footerBtn[valoda]}
          </Link>
        </div>
      </section>

      <Footer />

    </div>
  )
}
