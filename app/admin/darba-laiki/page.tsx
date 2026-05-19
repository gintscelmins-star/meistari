import { redirect } from 'next/navigation'
import { getSupabaseSSR } from '@/lib/supabase-server'
import DarbaLaikuTabula from './DarbaLaikuTabula'

export default async function DarbaLaikuPage() {
  const supabase = await getSupabaseSSR()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: meistarsRaw } = await supabase
    .from('meistari')
    .select('*')
    .eq('user_id', user.id)
    .single()
  const meistars = meistarsRaw as { id: string; aktīvs: boolean } | null

  if (!meistars) return <div className="text-center py-20 text-gray-400">Profils nav atrasts.</div>

  const { data: darbaLaiki } = await supabase
    .from('darba_laiki')
    .select('dienas_nr, no_laiks, lidz_laiks, strada')
    .eq('meistars_id', meistars.id)
    .order('dienas_nr')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2C2C2A]">Darba laiki</h1>
        <p className="text-gray-500 text-sm mt-1">
          Norādiet kurās dienās un cikos strādājat. Profils būs redzams tikai ja ir vismaz viena darba diena.
        </p>
      </div>

      {!meistars.aktīvs && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 text-sm text-amber-800">
          🔴 Profils pašlaik ir slēpts. Norādiet darba dienas un saglabājiet.
        </div>
      )}

      <DarbaLaikuTabula meistarsId={meistars.id} initialLaiki={darbaLaiki ?? []} />
    </div>
  )
}
