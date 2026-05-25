import Link from 'next/link'
import {
  Wrench, Star, MapPin, Clock, CheckCircle2,
  Phone, MessageCircle, Sparkles, Award, Shield,
} from 'lucide-react'
import BookingForma from './BookingForma'
import CenuKalkulators from './CenuKalkulators'
import FotoGalerija from './FotoGalerija'
import StickyMobileCTA from './StickyMobileCTA'
import RevealInit from './RevealInit'

type MeistarsData = {
  id: string
  vards: string
  uzvards: string
  specialitate: string
  apraksts: string | null
  pieredze_gadi: number | null
  rating: number | null
  foto_url: string | null
  telefons: string
}

type PakItem = {
  id: string
  nosaukums: string
  cena_no: number
  ilgums_h: number | null
  meistars_id: string
}

type AtsauksmeItem = {
  id: string
  autors: string
  teksts: string
  vertejums: number
  datums: string
}

type FotoItem = {
  id: string
  url: string
  apraksts: string | null
}

type DarbaLaiksItem = {
  dienas_nr: number
  no_laiks: string
  lidz_laiks: string
  strada: boolean
}

type PakKatItem = {
  katNosaukums: string
  katKartiba: number
  items: Array<{
    cena_no: number | null
    cena_lidz: number | null
    apraksts: string | null
    nosaukums: string | null
  }>
}

type KatalogaKatItem = {
  id: string
  nosaukums: string
  standartu_pakalpojumi: Array<{ nosaukums: string; kartiba: number | null }>
}

export type MeistarsProfilsProps = {
  meistars: MeistarsData
  pakalpojumi: PakItem[]
  atsauksmes: AtsauksmeItem[]
  galerija: FotoItem[]
  darbaLaiki: DarbaLaiksItem[]
  regioniNosaukumi: string[]
  meistaraPakKategorijas: PakKatItem[]
  katalogaKategorijas: KatalogaKatItem[]
  isDemo?: boolean
}

const navLinks = [
  { href: '#pakalpojumi', label: 'Pakalpojumi' },
  { href: '#cenas', label: 'Cenas' },
  { href: '#par-meistaru', label: 'Par meistaru' },
  { href: '#atsauksmes', label: 'Atsauksmes' },
  { href: '#kontakti', label: 'Kontakti' },
]

export default function MeistarsProfils({
  meistars,
  pakalpojumi,
  atsauksmes,
  galerija,
  darbaLaiki,
  regioniNosaukumi,
  meistaraPakKategorijas,
  katalogaKategorijas,
  isDemo = false,
}: MeistarsProfilsProps) {
  const pilnaisVards = `${meistars.vards} ${meistars.uzvards}`
  const telRaw = meistars.telefons ?? ''
  const telUrl = telRaw ? `tel:${telRaw.replace(/\s/g, '')}` : null
  const waUrl = telRaw ? `https://wa.me/${telRaw.replace(/[\s+]/g, '')}` : null

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 lg:pb-0">
      <RevealInit />

      {isDemo && (
        <div className="bg-amber-50 border-b border-amber-200 text-center py-2 px-4 text-xs text-amber-800 font-medium">
          Demo profils — dati ir izdomāti demonstrācijai
        </div>
      )}

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

      {/* Ko es daru */}
      {meistaraPakKategorijas.length > 0 ? (
        <section id="pakalpojumi" className="py-20 bg-background">
          <div className="mx-auto max-w-6xl px-4">
            <div className="reveal text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold">Ko es daru</h2>
              <p className="mt-3 text-muted-foreground">Pakalpojumi, ko piedāvā {pilnaisVards}.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {meistaraPakKategorijas.map((kat) => (
                <div key={kat.katNosaukums} className="reveal rounded-2xl overflow-hidden border border-border">
                  <div className="bg-secondary px-5 py-3">
                    <h3 className="font-bold text-foreground">{kat.katNosaukums}</h3>
                  </div>
                  <div className="bg-white divide-y divide-border">
                    {kat.items.map((item, i) => (
                      <div key={i} className="flex items-start justify-between gap-3 px-5 py-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <CheckCircle2 className="h-4 w-4 text-brand flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="text-sm">{item.nosaukums}</span>
                            {item.apraksts && (
                              <p className="text-xs text-muted-foreground mt-0.5">{item.apraksts}</p>
                            )}
                          </div>
                        </div>
                        {(item.cena_no || item.cena_lidz) && (
                          <span className="text-sm font-semibold text-brand whitespace-nowrap flex-shrink-0">
                            {item.cena_no && item.cena_lidz
                              ? `${item.cena_no}–${item.cena_lidz}€`
                              : item.cena_no
                              ? `no ${item.cena_no}€`
                              : `līdz ${item.cena_lidz}€`}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : katalogaKategorijas.length > 0 ? (
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
      ) : null}

      {/* Foto galerija */}
      {galerija.length > 0 && (
        <section id="foto" className="py-20 bg-brand-soft">
          <div className="mx-auto max-w-6xl px-4">
            <div className="reveal text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold">Darbu piemēri</h2>
            </div>
            <FotoGalerija fotos={galerija} meistaraNosaukums={pilnaisVards} />
          </div>
        </section>
      )}

      {/* Cenas + kalkulators */}
      {pakalpojumi.length > 0 && (
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
              {atsauksmes.length > 0 && (
                <span className="text-muted-foreground font-normal text-2xl ml-2">({atsauksmes.length})</span>
              )}
            </h2>
          </div>
          {atsauksmes.length > 0 ? (
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
              {isDemo ? (
                <div className="rounded-2xl bg-white border border-border p-8 text-center space-y-3">
                  <p className="text-lg font-bold">Rezervācija</p>
                  <p className="text-sm text-muted-foreground">Demo režīmā rezervācijas nav aktīvas. Reģistrējiet savu profilu, lai aktivizētu rezervēšanu.</p>
                  <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-brand text-brand-foreground px-5 py-3 font-semibold hover:opacity-90 transition text-sm">
                    Reģistrēties kā meistars
                  </Link>
                </div>
              ) : (
                <BookingForma meistarsId={meistars.id} pakalpojumi={pakalpojumi} darbaLaiki={darbaLaiki} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border mt-20">
        <div className="mx-auto max-w-2xl px-4 py-8 text-center">
          <p className="text-sm text-gray-600 mb-1">
            Lapa izveidota ar{' '}
            <a href="https://promeistars.lv" className="text-blue-600 hover:underline font-medium">
              ProMeistars
            </a>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            <a href="/privacy" className="hover:underline">Privātums</a>
            {' · '}
            <a href="/terms" className="hover:underline">Noteikumi</a>
            {' · '}
            <a href="/" className="hover:underline">← Visi meistari</a>
          </p>
          <p className="text-xs text-gray-300 mt-1">© 2026 ProMeistars. Visas tiesības aizsargātas.</p>
        </div>
      </footer>

      <StickyMobileCTA telUrl={telUrl} waUrl={waUrl} vards={meistars.vards} />
    </div>
  )
}
