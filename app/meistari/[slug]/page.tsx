import { getSupabaseServer } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Wrench, Star, MapPin, Clock, CheckCircle2,
  Phone, MessageCircle, Sparkles, Award, Shield,
} from 'lucide-react'
import BookingForma from './BookingForma'
import CenuKalkulators from './CenuKalkulators'
import RevealInit from './RevealInit'

export default async function MeistarsPage(props: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await props.params
  const supabase = getSupabaseServer()

  const { data: meistars } = await supabase
    .from('meistari')
    .select('*')
    .eq('slug', slug)
    .eq('aktīvs', true)
    .single()

  if (!meistars) notFound()

  const [{ data: pakalpojumi }, { data: atsauksmes }, { data: regioni }, { data: darbaTypi }, { data: galerija }, { data: darbaLaiki }] = await Promise.all([
    supabase.from('pakalpojumi').select('*').eq('meistars_id', meistars.id).order('cena_no'),
    supabase.from('atsauksmes').select('*').eq('meistars_id', meistars.id).order('datums', { ascending: false }),
    supabase.from('meistars_regioni').select('regioni(nosaukums)').eq('meistars_id', meistars.id),
    supabase.from('meistars_darba_tipi').select('darba_tips_id').eq('meistars_id', meistars.id).limit(1),
    supabase.from('meistara_foto').select('id, url, apraksts').eq('meistars_id', meistars.id).order('kartiba').order('created_at'),
    supabase.from('darba_laiki').select('dienas_nr, no_laiks, lidz_laiks, strada').eq('meistars_id', meistars.id).order('dienas_nr'),
  ])

  const darbaTypsId = darbaTypi?.[0]?.darba_tips_id ?? null
  const { data: katalogs } = darbaTypsId
    ? await supabase
        .from('pakalpojumu_kategorijas')
        .select('id, nosaukums, kartiba, standartu_pakalpojumi(nosaukums, kartiba)')
        .eq('darba_tips_id', darbaTypsId)
        .order('kartiba')
    : { data: null }

  type KatalogaRinda = {
    id: string
    nosaukums: string
    kartiba: number | null
    standartu_pakalpojumi: Array<{ nosaukums: string; kartiba: number | null }>
  }
  const katalogaKategorijas = (katalogs ?? []) as KatalogaRinda[]

  const pilnaisVards = `${meistars.vards} ${meistars.uzvards}`
  const regioniNosaukumi = (regioni ?? []).map((r: { regioni: { nosaukums: string }[] | { nosaukums: string } | null }) => {
    const reg = r.regioni
    if (!reg) return null
    return Array.isArray(reg) ? reg[0]?.nosaukums : reg.nosaukums
  }).filter(Boolean) as string[]

  const telRaw = meistars.telefons ?? ''
  const telUrl = telRaw ? `tel:${telRaw.replace(/\s/g, '')}` : null
  const waUrl = telRaw ? `https://wa.me/${telRaw.replace(/[\s+]/g, '')}` : null

  const navLinks = [
    { href: '#pakalpojumi', label: 'Pakalpojumi' },
    { href: '#cenas', label: 'Cenas' },
    { href: '#par-meistaru', label: 'Par meistaru' },
    { href: '#atsauksmes', label: 'Atsauksmes' },
    { href: '#kontakti', label: 'Kontakti' },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <RevealInit />

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
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-foreground transition">{l.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition">
              ← Visi meistari
            </Link>
            {telUrl && (
              <a href={telUrl} className="inline-flex items-center gap-2 rounded-full bg-brand text-brand-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition">
                <Phone className="h-4 w-4" /> Zvanīt
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden bg-brand-soft">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div className="reveal">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand border border-brand/20">
              <Sparkles className="h-3.5 w-3.5" /> {meistars.specialitate}
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">{pilnaisVards}</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">
              {meistars.apraksts ??
                `${meistars.specialitate}${(meistars.pieredze_gadi ?? 0) > 0 ? ` ar ${meistars.pieredze_gadi}+ gadu pieredzi` : ''}. Kvalitatīvs darbs ar garantiju.`}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {telUrl && (
                <a href={telUrl} className="inline-flex items-center gap-2 rounded-full bg-brand text-brand-foreground px-5 py-3 font-semibold shadow-sm hover:opacity-90 transition">
                  <Phone className="h-4 w-4" /> Zvanīt {telRaw}
                </a>
              )}
              {waUrl && (
                <a href={waUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-white text-foreground border border-border px-5 py-3 font-semibold hover:bg-secondary transition">
                  <MessageCircle className="h-4 w-4 text-[#25D366]" /> WhatsApp
                </a>
              )}
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {(meistars.pieredze_gadi ?? 0) > 0 && (
                <li className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand" />
                  Pieredze {meistars.pieredze_gadi}+ gadi
                </li>
              )}
              {Number(meistars.rating ?? 0) > 0 && (
                <li className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand" />
                  Reitings {Number(meistars.rating).toFixed(1)}
                </li>
              )}
              {regioniNosaukumi.length > 0 && (
                <li className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand" />
                  {regioniNosaukumi.join(', ')}
                </li>
              )}
            </ul>
          </div>

          <div className="reveal relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl ring-1 ring-border bg-brand-soft">
              {meistars.foto_url ? (
                <img src={meistars.foto_url} alt={pilnaisVards} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-8xl font-bold text-brand">
                  {meistars.vards[0]}
                </div>
              )}
            </div>
            {(meistars.pieredze_gadi ?? 0) > 0 && (
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-border px-4 py-3 hidden sm:flex items-center gap-3">
                <Award className="h-8 w-8 text-brand" />
                <div>
                  <div className="text-sm font-bold leading-tight">{meistars.pieredze_gadi}+ gadu</div>
                  <div className="text-xs text-muted-foreground">pieredze</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pakalpojumu katalogs */}
      {katalogaKategorijas.length > 0 && (
        <section id="pakalpojumi" className="py-20 bg-background">
          <div className="mx-auto max-w-6xl px-4">
            <div className="reveal text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold">Pakalpojumi</h2>
              <p className="mt-3 text-muted-foreground">Pilns pakalpojumu klāsts, ko piedāvā {pilnaisVards}.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {katalogaKategorijas.map((kat) => (
                <div key={kat.id} className="reveal rounded-2xl overflow-hidden border border-border">
                  <div className="bg-secondary px-5 py-3">
                    <h3 className="font-bold text-foreground">{kat.nosaukums}</h3>
                  </div>
                  <div className="bg-white px-5 py-4 space-y-2.5">
                    {[...kat.standartu_pakalpojumi]
                      .sort((a, b) => (a.kartiba ?? 0) - (b.kartiba ?? 0))
                      .map((p) => (
                        <div key={p.nosaukums} className="flex items-start gap-2.5 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-brand flex-shrink-0 mt-0.5" />
                          <span>{p.nosaukums}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Foto galerija */}
      {galerija && galerija.length > 0 && (
        <section id="foto" className="py-20 bg-brand-soft">
          <div className="mx-auto max-w-6xl px-4">
            <div className="reveal text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold">Darbu piemēri</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galerija.map((f) => (
                <div key={f.id} className="reveal rounded-2xl overflow-hidden aspect-square bg-secondary">
                  <img src={f.url} alt={f.apraksts ?? pilnaisVards} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cenas + kalkulators */}
      {pakalpojumi && pakalpojumi.length > 0 && (
        <section id="cenas" className="py-20 bg-background">
          <div className="mx-auto max-w-6xl px-4">
            <div className="reveal text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold">Cenas</h2>
              <p className="mt-3 text-muted-foreground">Pakalpojumu cenas no {pilnaisVards}.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {pakalpojumi.map((p) => (
                <div key={p.id} className="reveal group rounded-2xl bg-white border border-border p-6 hover:shadow-lg hover:-translate-y-1 transition">
                  <div className="h-12 w-12 grid place-items-center rounded-xl bg-brand-soft text-brand group-hover:bg-brand group-hover:text-brand-foreground transition">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{p.nosaukums}</h3>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span>No <span className="font-bold text-foreground">{p.cena_no}€</span></span>
                    {p.ilgums_h && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />{p.ilgums_h}h
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="reveal text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold">Orientējošs cenu aprēķins</h2>
              <p className="mt-3 text-muted-foreground">Aptuvenā cena pirms rezervācijas.</p>
            </div>
            <div className="reveal max-w-4xl mx-auto rounded-2xl bg-white border border-border p-6 sm:p-8 shadow-sm">
              <CenuKalkulators pakalpojumi={pakalpojumi} telUrl={telUrl} />
            </div>
          </div>
        </section>
      )}

      {/* Par meistaru */}
      <section id="par-meistaru" className="py-20 bg-background">
        <div className="mx-auto max-w-6xl px-4 grid lg:grid-cols-2 gap-10 items-center">
          <div className="reveal">
            <div className="aspect-[4/5] max-w-md rounded-2xl overflow-hidden ring-1 ring-border shadow-md bg-brand-soft">
              {meistars.foto_url ? (
                <img src={meistars.foto_url} alt={pilnaisVards} loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-9xl font-bold text-brand">
                  {meistars.vards[0]}
                </div>
              )}
            </div>
          </div>
          <div className="reveal">
            <h2 className="text-3xl sm:text-4xl font-bold">Par {pilnaisVards}</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {meistars.apraksts ??
                `${pilnaisVards} ir pieredzējis ${meistars.specialitate.toLowerCase()}${(meistars.pieredze_gadi ?? 0) > 0 ? ` ar ${meistars.pieredze_gadi}+ gadu pieredzi Latvijā` : ''}. Strādā precīzi, tīri un ar garantiju.`}
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Verificēts profils ar reālām atsauksmēm',
                'Ātra atbilde uz rezervāciju',
                'Garantija uz visiem darbiem',
                ...(regioniNosaukumi.length > 0 ? [`Strādā: ${regioniNosaukumi.join(', ')}`] : []),
              ].map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-brand mt-0.5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm">
              <Shield className="h-4 w-4 text-brand" /> Meistari.lv verificēts speciālists
            </div>
          </div>
        </div>
      </section>

      {/* Atsauksmes */}
      <section id="atsauksmes" className="py-20 bg-brand-soft">
        <div className="mx-auto max-w-6xl px-4">
          <div className="reveal text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Klientu atsauksmes
              {atsauksmes && atsauksmes.length > 0 && (
                <span className="text-muted-foreground font-normal text-2xl ml-2">({atsauksmes.length})</span>
              )}
            </h2>
          </div>
          {atsauksmes && atsauksmes.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-5">
              {atsauksmes.map((a) => (
                <div key={a.id} className="reveal rounded-2xl bg-white border border-border p-6">
                  <div className="flex gap-0.5 text-brand">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < a.vertejums ? 'fill-current' : 'text-border fill-none'}`} />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed">{a.teksts}</p>
                  <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-sm font-semibold">{a.autors}</span>
                    <span className="text-xs text-muted-foreground">{a.datums}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="reveal rounded-2xl bg-white border border-border p-8 text-center text-muted-foreground text-sm">
              Vēl nav atsauksmju
            </div>
          )}
        </div>
      </section>

      {/* Kontakti + Booking */}
      <section id="kontakti" className="py-20 bg-background">
        <div className="mx-auto max-w-6xl px-4">
          <div className="reveal text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">Kontakti</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="reveal rounded-2xl bg-white border border-border p-6 sm:p-8 space-y-5">
              {telUrl && (
                <a href={telUrl} className="flex items-center gap-4 group">
                  <div className="h-11 w-11 grid place-items-center rounded-xl bg-brand text-brand-foreground">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Zvanīt</div>
                    <div className="font-bold group-hover:text-brand transition">{telRaw}</div>
                  </div>
                </a>
              )}
              {waUrl && (
                <a href={waUrl} target="_blank" rel="noopener" className="flex items-center gap-4 group">
                  <div className="h-11 w-11 grid place-items-center rounded-xl bg-[#25D366] text-white">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">WhatsApp</div>
                    <div className="font-bold group-hover:text-brand transition">{telRaw}</div>
                  </div>
                </a>
              )}
              {regioniNosaukumi.length > 0 && (
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 grid place-items-center rounded-xl bg-brand-soft text-brand">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Darba reģions</div>
                    <div className="font-semibold">{regioniNosaukumi.join(', ')}</div>
                  </div>
                </div>
              )}
              {(meistars.pieredze_gadi ?? 0) > 0 && (
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 grid place-items-center rounded-xl bg-brand-soft text-brand">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Pieredze</div>
                    <div className="font-semibold">{meistars.pieredze_gadi}+ gadu pieredze</div>
                  </div>
                </div>
              )}
              <div className="rounded-xl overflow-hidden border border-border aspect-[16/9]">
                <iframe
                  title="Karte"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=24.05%2C56.92%2C24.18%2C56.98&layer=mapnik"
                  className="w-full h-full"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="reveal">
              <BookingForma meistarsId={meistars.id} pakalpojumi={pakalpojumi ?? []} darbaLaiki={darbaLaiki ?? []} />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>© 2025 Meistari.lv. Visas tiesības aizsargātas.</div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-foreground transition">← Visi meistari</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
