import { getSupabaseServer } from '@/lib/supabase'
import type { DarbaTips, Regions } from '@/lib/supabase'
import Link from 'next/link'
import { Wrench } from 'lucide-react'
import MeklešanaForma from './MeklešanaForma'
import MeistarsCard from '@/components/MeistarsCard'

async function getMeistari(darbaTipsSlug?: string, regionSlug?: string) {
  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from('meistari')
    .select(`
      *,
      meistars_darba_tipi(darba_tips_id, darba_tipi(slug)),
      meistars_regioni(regions_id, regioni(nosaukums, slug)),
      pakalpojumi(cena_no)
    `)
    .eq('aktīvs', true)
    .order('rating', { ascending: false })

  if (error || !data) return []

  return data
    .filter((m) => {
      if (darbaTipsSlug) {
        const tips = m.meistars_darba_tipi as Array<{ darba_tipi: { slug: string } }>
        if (!tips.some((t) => t.darba_tipi?.slug === darbaTipsSlug)) return false
      }
      if (regionSlug) {
        const reg = m.meistars_regioni as Array<{ regioni: { slug: string } }>
        if (!reg.some((r) => r.regioni?.slug === regionSlug)) return false
      }
      return true
    })
    .map((m) => {
      const regioni = (m.meistars_regioni as Array<{ regioni: { nosaukums: string } }>)
        .map((r) => r.regioni?.nosaukums)
        .filter(Boolean) as string[]
      const cenas = (m.pakalpojumi as Array<{ cena_no: number }>).map((p) => p.cena_no)
      const cena_no = cenas.length > 0 ? Math.min(...cenas) : null
      return { ...m, regioni, cena_no }
    })
}

export default async function HomePage(props: {
  searchParams: Promise<{ tips?: string; regions?: string; datums?: string }>
}) {
  const searchParams = await props.searchParams
  const supabase = getSupabaseServer()

  const [{ data: darbaTipi }, { data: regioni }, meistari] = await Promise.all([
    supabase.from('darba_tipi').select('*').order('nosaukums'),
    supabase.from('regioni').select('*').order('nosaukums'),
    getMeistari(searchParams.tips, searchParams.regions),
  ])

  const hasFilter = !!(searchParams.tips || searchParams.regions || searchParams.datums)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="grid place-items-center h-8 w-8 rounded-md bg-brand text-brand-foreground">
              <Wrench className="h-4 w-4" />
            </span>
            <span className="text-sm sm:text-base">
              Meistari<span className="text-muted-foreground font-medium">.lv</span>
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#meistari" className="hover:text-foreground transition-colors">Meistari</a>
            <a href="#par-mums" className="hover:text-foreground transition-colors">Par platformu</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/register"
              className="text-sm text-muted-foreground hover:text-foreground transition hidden sm:block"
            >
              Reģistrēties
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 rounded-full bg-brand text-brand-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition"
            >
              Meistara pieeja
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-brand-soft">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand border border-brand/20">
              Latvija · Verified meistari
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-bold leading-tight">
              Atrodi uzticamu meistaru Latvijā
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">
              Santehniķi, elektriķi un remontnieki ar pierādītu pieredzi un klientu atsauksmēm.
            </p>
          </div>

          <div className="mt-10">
            <MeklešanaForma
              darbaTipi={(darbaTipi as DarbaTips[]) ?? []}
              regioni={(regioni as Regions[]) ?? []}
              defaultTips={searchParams.tips ?? ''}
              defaultRegions={searchParams.regions ?? ''}
              defaultDatums={searchParams.datums ?? ''}
            />
          </div>
        </div>
      </section>

      {/* Rezultāti */}
      <section id="meistari" className="py-16 bg-background">
        <div className="mx-auto max-w-6xl px-4">
          {hasFilter && (
            <p className="text-muted-foreground text-sm mb-6">
              Atrasti <span className="font-semibold text-foreground">{meistari.length}</span> meistari
            </p>
          )}

          {!hasFilter && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold">Visi meistari</h2>
              <p className="text-muted-foreground mt-2">Izmantojiet filtrus, lai atrastu vajadzīgo speciālistu</p>
            </div>
          )}

          {hasFilter && meistari.length === 0 ? (
            <div className="text-center py-24">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-brand-soft text-brand text-3xl mb-4">🔍</div>
              <p className="text-lg font-semibold">Nav atrasts neviens meistars</p>
              <p className="text-muted-foreground text-sm mt-1">Mēģiniet mainīt meklēšanas kritērijus</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {meistari.map((m) => (
                <MeistarsCard key={m.id} meistars={m} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Par platformu */}
      <section id="par-mums" className="py-20 bg-brand-soft">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Kāpēc Meistari.lv?</h2>
            <p className="mt-3 text-muted-foreground">Uzticama platforma savienošanai starp meistariem un klientiem Latvijā.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: '✓', title: 'Pārbaudīti meistari', desc: 'Katrs meistars ir verificēts ar reāliem atsauksmēm no klientiem.' },
              { icon: '⚡', title: 'Ātra rezervācija', desc: 'Rezervējiet meistaru tiešsaistē dažu minūšu laikā.' },
              { icon: '★', title: 'Reitingi un atsauksmes', desc: 'Izvēlieties meistaru balstoties uz pārbaudītām atsauksmēm.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-white border border-border p-6 hover:shadow-lg hover:-translate-y-1 transition">
                <div className="h-12 w-12 grid place-items-center rounded-xl bg-brand-soft text-brand text-xl font-bold">
                  {item.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>© 2025 Meistari.lv. Visas tiesības aizsargātas.</div>
          <Link href="/admin/login" className="hover:text-foreground transition">Meistara pieeja</Link>
        </div>
      </footer>
    </div>
  )
}
