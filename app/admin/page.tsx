import { redirect } from 'next/navigation'
import { getSupabaseSSR } from '@/lib/supabase-server'
import BookingRinda from './BookingRinda'

export default async function AdminPage() {
  const supabase = await getSupabaseSSR()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: meistars } = await supabase
    .from('meistari')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!meistars) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Jūsu konts nav piesaistīts nevienam meistarim.</p>
        <p className="text-gray-400 text-sm mt-1">Sazinieties ar administrāciju.</p>
      </div>
    )
  }

  const { data: bookings } = await supabase
    .from('booking')
    .select('*')
    .eq('meistars_id', meistars.id)
    .order('datums', { ascending: false })
    .order('laiks', { ascending: false })

  const jauni = (bookings ?? []).filter((b) => b.statuss === 'jauns')
  const parējie = (bookings ?? []).filter((b) => b.statuss !== 'jauns')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#2C2C2A]">Rezervācijas</h1>
        <p className="text-gray-500 text-sm mt-1">
          Kopā: {bookings?.length ?? 0} — jauni: {jauni.length}
        </p>
      </div>

      {jauni.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[#2C2C2A] uppercase tracking-wide mb-3">
            Jauni ({jauni.length})
          </h2>
          <div className="space-y-3">
            {jauni.map((b) => (
              <BookingRinda key={b.id} booking={b} />
            ))}
          </div>
        </section>
      )}

      {parējie.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Vēsture
          </h2>
          <div className="space-y-2">
            {parējie.map((b) => (
              <BookingRinda key={b.id} booking={b} />
            ))}
          </div>
        </section>
      )}

      {(bookings ?? []).length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-3xl mb-3">📭</p>
          <p>Vēl nav nevienas rezervācijas</p>
        </div>
      )}
    </div>
  )
}
