'use client'

import Link from 'next/link'
import { Logo } from './Logo'

export function Header() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />

        <nav className="hidden md:flex gap-6 text-sm text-gray-600">
          <a href="/#meistari" className="hover:text-blue-600 transition-colors">Meistari</a>
          <a href="/#kategorijas" className="hover:text-blue-600 transition-colors">Kategorijas</a>
          <a href="/par-mums" className="hover:text-blue-600 transition-colors">Par mums</a>
        </nav>

        <div className="flex gap-3 items-center">
          <Link
            href="/admin/login"
            className="text-sm px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Meistara ieeja
          </Link>
          <Link
            href="/register"
            className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kļūt par meistaru
          </Link>
        </div>
      </div>
    </header>
  )
}
