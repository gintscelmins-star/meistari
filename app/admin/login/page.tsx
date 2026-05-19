'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

type State = 'idle' | 'loading' | 'error'

export default function LoginPage() {
  const router = useRouter()
  const [epasts, setEpasts] = useState('')
  const [parole, setParole] = useState('')
  const [state, setState] = useState<State>('idle')
  const [kludaZin, setKludaZin] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    setKludaZin('')

    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: epasts,
      password: parole,
    })

    if (error) {
      setKludaZin('Nepareizs e-pasts vai parole')
      setState('error')
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#2C2C2A]">Meistara pieejai</h1>
          <p className="text-gray-500 text-sm mt-1">Pierakstieties savā kontā</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">E-pasts</label>
            <input
              type="email"
              required
              value={epasts}
              onChange={(e) => setEpasts(e.target.value)}
              placeholder="janis@example.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#2C2C2A] focus:outline-none focus:ring-2 focus:ring-[#2C2C2A]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">Parole</label>
            <input
              type="password"
              required
              value={parole}
              onChange={(e) => setParole(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#2C2C2A] focus:outline-none focus:ring-2 focus:ring-[#2C2C2A]"
            />
          </div>

          {kludaZin && (
            <p className="text-red-500 text-sm">{kludaZin}</p>
          )}

          <button
            type="submit"
            disabled={state === 'loading'}
            className="w-full bg-[#2C2C2A] text-white py-3 rounded-xl font-medium hover:bg-black transition-colors text-sm disabled:opacity-60"
          >
            {state === 'loading' ? 'Pierakstās...' : 'Pierakstīties'}
          </button>
        </form>
      </div>
    </main>
  )
}
