import { getSupabaseServer } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { getDemoSantehnikisData } from '@/lib/demo-meistari'
import MeistarsProfils from './MeistarsProfils'
import MeistaraLapa from './MeistaraLapa'

export default async function MeistarsPage(props: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await props.params

  if (slug === 'demo-santehnikis') {
    const data = getDemoSantehnikisData()
    return <MeistarsProfils {...data} isDemo />
  }

  const supabase = getSupabaseServer()

  // Publicētās prospect lapas
  const { data: prospectMeistars } = await supabase
    .from('prospects')
    .select('id, vards, uzvards, nodarbosanas, regions, apraksts, telefons, foto_hero, foto_darbs_1, foto_darbs_2, foto_darbs_3, foto_darbs_4, foto_profils, darba_laiki, pakalpojumi')
    .eq('demo_slug', slug)
    .eq('publiskets', true)
    .single()

  if (prospectMeistars) {
    return <MeistaraLapa meistars={prospectMeistars as Parameters<typeof MeistaraLapa>[0]['meistars']} />
  }

  // Ja nav atrasts publicēts profils → "Nav atrasts" lapa
  if (slug !== 'demo-santehnikis') {
    const { data: meistars } = await supabase
      .from('meistari')
      .select('*')
      .eq('slug', slug)
      .eq('aktīvs', true)
      .single()

    if (!meistars) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Lapa nav atrasta</h1>
            <p className="text-gray-600 mb-6">Šī meistara profils vēl nav publicēts vai neeksistē.</p>
            <a href="/" className="text-blue-600 hover:underline">← Atpakaļ uz sākumlapu</a>
          </div>
        </div>
      )
    }

    const [
      { data: pakalpojumi },
      { data: atsauksmes },
      { data: regioni },
      { data: darbaTypi },
      { data: galerija },
      { data: darbaLaiki },
    ] = await Promise.all([
      supabase.from('pakalpojumi').select('*').eq('meistars_id', meistars.id).order('cena_no'),
      supabase.from('atsauksmes').select('*').eq('meistars_id', meistars.id).order('datums', { ascending: false }),
      supabase.from('meistars_regioni').select('regioni(nosaukums)').eq('meistars_id', meistars.id),
      supabase.from('meistars_darba_tipi').select('darba_tips_id').eq('meistars_id', meistars.id).limit(1),
      supabase.from('meistara_foto').select('id, url, apraksts').eq('meistars_id', meistars.id).order('kartiba').order('created_at'),
      supabase.from('darba_laiki').select('dienas_nr, no_laiks, lidz_laiks, strada').eq('meistars_id', meistars.id).order('dienas_nr'),
    ])

    const darbaTypsId = darbaTypi?.[0]?.darba_tips_id ?? null
    const [{ data: katalogs }, { data: meistaraPakRaw }] = await Promise.all([
      darbaTypsId
        ? supabase
            .from('pakalpojumu_kategorijas')
            .select('id, nosaukums, kartiba, standartu_pakalpojumi(nosaukums, kartiba)')
            .eq('darba_tips_id', darbaTypsId)
            .order('kartiba')
        : Promise.resolve({ data: null }),
      supabase
        .from('meistara_pakalpojumi')
        .select('cena_no, cena_lidz, apraksts, standartu_pakalpojumi(nosaukums, kartiba, pakalpojumu_kategorijas(nosaukums, kartiba))')
        .eq('meistars_id', meistars.id),
    ])

    type KatalogaRinda = {
      id: string
      nosaukums: string
      kartiba: number | null
      standartu_pakalpojumi: Array<{ nosaukums: string; kartiba: number | null }>
    }
    const katalogaKategorijas = (katalogs ?? []) as KatalogaRinda[]

    type MeistaraPakItem = {
      cena_no: number | null
      cena_lidz: number | null
      apraksts: string | null
      standartu_pakalpojumi: {
        nosaukums: string
        kartiba: number | null
        pakalpojumu_kategorijas: { nosaukums: string; kartiba: number | null } | null
      } | null
    }
    const meistaraPak = (meistaraPakRaw ?? []) as MeistaraPakItem[]

    const meistaraPakByKat = meistaraPak.reduce<
      Record<string, { katNosaukums: string; katKartiba: number; items: MeistaraPakItem[] }>
    >((acc, row) => {
      const kat = row.standartu_pakalpojumi?.pakalpojumu_kategorijas
      const key = kat?.nosaukums ?? 'Citi'
      if (!acc[key]) acc[key] = { katNosaukums: key, katKartiba: kat?.kartiba ?? 99, items: [] }
      acc[key].items.push(row)
      return acc
    }, {})
    const meistaraPakKategorijas = Object.values(meistaraPakByKat)
      .sort((a, b) => a.katKartiba - b.katKartiba)
      .map(k => ({
        katNosaukums: k.katNosaukums,
        katKartiba: k.katKartiba,
        items: k.items.map(item => ({
          cena_no: item.cena_no,
          cena_lidz: item.cena_lidz,
          apraksts: item.apraksts,
          nosaukums: item.standartu_pakalpojumi?.nosaukums ?? null,
        })),
      }))

    const regioniNosaukumi = (regioni ?? []).map((r: { regioni: { nosaukums: string }[] | { nosaukums: string } | null }) => {
      const reg = r.regioni
      if (!reg) return null
      return Array.isArray(reg) ? reg[0]?.nosaukums : reg.nosaukums
    }).filter(Boolean) as string[]

    return (
      <MeistarsProfils
        meistars={meistars}
        pakalpojumi={pakalpojumi ?? []}
        atsauksmes={atsauksmes ?? []}
        galerija={galerija ?? []}
        darbaLaiki={darbaLaiki ?? []}
        regioniNosaukumi={regioniNosaukumi}
        meistaraPakKategorijas={meistaraPakKategorijas}
        katalogaKategorijas={katalogaKategorijas}
      />
    )
  }


  notFound()
}
