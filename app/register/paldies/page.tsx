import Link from 'next/link'
import { Wrench, CheckCircle2 } from 'lucide-react'

export default function PaldiesPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
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

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full rounded-2xl bg-white border border-border p-10 text-center space-y-4">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-brand-soft text-brand">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Pieteikums saņemts!</h1>
          <p className="text-muted-foreground">
            Jūsu pieteikums ir iesniegts. Sazināsimies ar jums 24 stundu laikā un aktivizēsim kontu.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-brand text-brand-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition"
          >
            Atpakaļ uz sākumu
          </Link>
        </div>
      </main>
    </div>
  )
}
