import { redirect } from 'next/navigation'
import { getSupabaseSSR } from '@/lib/supabase-server'
import PakalpojumiEditor from './PakalpojumiEditor'

export default async function PakalpojumiPage() {
  const supabase = await getSupabaseSSR()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: meistars } = await supabase
    .from('meistari')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!meistars) return <div className="text-center py-20 text-gray-400">Profils nav atrasts.</div>

  const { data: darbaTypi } = await supabase
    .from('meistars_darba_tipi')
    .select('darba_tips_id')
    .eq('meistars_id', meistars.id)
    .limit(1)

  const darbaTypsId = darbaTypi?.[0]?.darba_tips_id ?? null

  const { data: kategorijas } = darbaTypsId
    ? await supabase
        .from('pakalpojumu_kategorijas')
        .select('id, nosaukums, kartiba, standartu_pakalpojumi(id, nosaukums, kartiba)')
        .eq('darba_tips_id', darbaTypsId)
        .order('kartiba')
    : { data: null }

  const { data: existing } = await supabase
    .from('meistara_pakalpojumi')
    .select('id, standartu_pakalpojums_id, cena_no, cena_lidz, apraksts')
    .eq('meistars_id', meistars.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2C2C2A]">Mani pakalpojumi</h1>
        <p className="text-gray-500 text-sm mt-1">
          Atzīmējiet ko darāt un norādiet cenas.
        </p>
      </div>
      {!darbaTypsId || !kategorijas?.length ? (
        <div className="rounded-2xl bg-white border border-border p-8 text-center text-muted-foreground text-sm">
          Darba veids nav norādīts. Pievienojiet to sadaļā{' '}
          <a href="/admin/profils" className="text-brand underline">Profils</a>.
        </div>
      ) : (
        <PakalpojumiEditor
          meistarsId={meistars.id}
          kategorijas={kategorijas as Parameters<typeof PakalpojumiEditor>[0]['kategorijas']}
          existing={existing ?? []}
        />
      )}
    </div>
  )
}
