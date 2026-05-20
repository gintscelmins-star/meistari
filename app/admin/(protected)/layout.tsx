import { redirect } from 'next/navigation'
import { getSupabaseSSR } from '@/lib/supabase-server'
import AdminNav from './AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseSSR()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: meistarsRaw } = await supabase
    .from('meistari')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const meistars = meistarsRaw as { vards: string; uzvards: string; slug: string; aktīvs: boolean } | null

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav meistars={meistars} userEmail={user.email ?? ''} />
      {meistars && !meistars.aktīvs && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-800">
          Profils nav redzams publiskajā sarakstā — norādiet darba dienas sadaļā{' '}
          <a href="/admin/darba-laiki" className="font-semibold underline">Darba laiki</a>.
        </div>
      )}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
