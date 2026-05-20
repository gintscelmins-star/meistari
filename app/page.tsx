import Link from 'next/link'
import { Wrench } from 'lucide-react'
import MeistariGrid from './MeistariGrid'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
            <span className="grid place-items-center h-8 w-8 rounded-md bg-blue-600 text-white">
              <Wrench className="h-4 w-4" />
            </span>
            ProMeistars
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition"
          >
            Kļūt par meistaru →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-blue-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
            🔧 Drīzumā — pilns meistaru katalogs
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold leading-tight text-gray-900">
            Atrodi uzticamu meistaru Latvijā
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-lg">
            Santehniķi, elektriķi, remontdarbu meistari un citi speciālisti — vienuviet.
          </p>
        </div>
      </section>

      {/* Meistaru grid ar filtriem */}
      <MeistariGrid />

      {/* Footer CTA — meistariem */}
      <section className="bg-blue-600 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Esi santehniķis, elektriķis vai cits meistars?
          </h2>
          <p className="mt-3 text-blue-100 text-lg">
            Izveido savu profila lapu par €19/mēn — pirmais mēnesis bezmaksas
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white text-blue-600 px-8 py-3 text-sm font-bold hover:bg-blue-50 transition"
          >
            Pieteikties bezmaksas →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="mx-auto max-w-6xl px-4 py-6 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400">
          <span>© 2025 ProMeistars. Visas tiesības aizsargātas.</span>
          <Link href="/admin/login" className="hover:text-gray-600 transition">
            Meistara ieeja
          </Link>
        </div>
      </footer>

    </div>
  )
}
