'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

type Props = {
  meistars: { vards: string; uzvards: string; slug: string; aktīvs: boolean } | null
  userEmail: string
}

export default function AdminNav({ meistars, userEmail }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const navItems = [
    { href: '/admin', label: 'Rezervācijas', exact: true },
    { href: '/admin/pakalpojumi', label: 'Mani pakalpojumi', exact: false },
    { href: '/admin/foto', label: 'Fotogrāfijas', exact: false },
    { href: '/admin/darba-laiki', label: 'Darba laiki', exact: false },
    { href: '/admin/profils', label: 'Profils', exact: false },
    { href: '/admin/kalendars', label: 'Kalendārs', exact: false },
  ]

  return (
    <header className="bg-[#2C2C2A] text-white">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/" className="font-bold text-sm opacity-80 hover:opacity-100 flex-shrink-0">
            Meistari.lv
          </Link>
          <nav className="flex gap-0.5 overflow-x-auto scrollbar-none">
            {navItems.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    active ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {meistars && (
            <>
              <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${
                meistars.aktīvs
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-red-500/20 text-red-300'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${meistars.aktīvs ? 'bg-green-400' : 'bg-red-400'}`} />
                {meistars.aktīvs ? 'Redzams' : 'Slēpts'}
              </span>
              <Link
                href={`/meistari/${meistars.slug}`}
                target="_blank"
                className="text-xs text-white/60 hover:text-white/90 transition-colors hidden sm:inline"
              >
                {meistars.vards} ↗
              </Link>
            </>
          )}
          <button
            onClick={handleLogout}
            className="text-xs text-white/60 hover:text-white/90 transition-colors"
          >
            Iziet
          </button>
        </div>
      </div>
    </header>
  )
}
