import { redirect } from 'next/navigation'
import { getSupabaseSSR } from '@/lib/supabase-server'
import FotoGalerija from './FotoGalerija'

export default async function FotoPage() {
  const supabase = await getSupabaseSSR()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: meistars } = await supabase
    .from('meistari')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!meistars) return <div className="text-center py-20 text-gray-400">Profils nav atrasts.</div>

  const { data: foto } = await supabase
    .from('meistara_foto')
    .select('*')
    .eq('meistars_id', meistars.id)
    .order('kartiba')
    .order('created_at')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2C2C2A]">Manas fotogrāfijas</h1>
        <p className="text-gray-500 text-sm mt-1">
          Pievienojiet darbu piemēru attēlus. Maks. 10 fotogrāfijas.
        </p>
      </div>
      <FotoGalerija meistarsId={meistars.id} initialFoto={foto ?? []} />
    </div>
  )
}
