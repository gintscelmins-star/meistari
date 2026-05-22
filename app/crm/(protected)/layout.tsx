import { redirect } from 'next/navigation'
import { getSupabaseSSR } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseSSR()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/crm/login')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col py-6 px-3 gap-1 shrink-0">
        <div className="font-bold text-base text-gray-900 px-3 mb-4">ProMeistars</div>
        <Link
          href="/crm"
          className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition"
        >
          Prospects
        </Link>
        <Link
          href="/crm/prospects/new"
          className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition"
        >
          + Jauns prospect
        </Link>
        <Link
          href="/crm/import"
          className="px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition"
        >
          CSV imports
        </Link>
        <div className="mt-auto">
          <p className="px-3 text-xs text-gray-400 truncate">{user.email}</p>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
