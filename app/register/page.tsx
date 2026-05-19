import { getSupabaseServer } from '@/lib/supabase'
import Link from 'next/link'
import { Wrench } from 'lucide-react'
import RegisterForma from './RegisterForma'

export default async function RegisterPage() {
  const supabase = getSupabaseServer()

  const [{ data: darbaTipi }, { data: regioni }] = await Promise.all([
    supabase.from('darba_tipi').select('*').order('nosaukums'),
    supabase.from('regioni').select('*').order('nosaukums'),
  ])

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="grid place-items-center h-8 w-8 rounded-md bg-brand text-brand-foreground">
              <Wrench className="h-4 w-4" />
            </span>
            <span className="text-sm">
              Meistari<span className="text-muted-foreground font-medium">.lv</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Reģistrēties kā meistars</h1>
          <p className="text-muted-foreground mt-2">
            Izveidojiet savu profilu un saņemiet rezervācijas no klientiem.
          </p>
        </div>

        <RegisterForma
          darbaTipi={darbaTipi ?? []}
          regioni={regioni ?? []}
        />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Jau ir konts?{' '}
          <Link href="/admin/login" className="text-brand font-semibold hover:underline">
            Pierakstīties
          </Link>
        </p>
      </main>
    </div>
  )
}
