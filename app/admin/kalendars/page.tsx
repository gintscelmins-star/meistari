import { redirect } from 'next/navigation'
import { getSupabaseSSR } from '@/lib/supabase-server'
import { CheckCircle2, Calendar, AlertCircle } from 'lucide-react'
import DisconnectButton from './DisconnectButton'

export default async function KalendarsPage(props: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const searchParams = await props.searchParams
  const supabase = await getSupabaseSSR()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const { data: meistars } = await supabase
    .from('meistari')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const { data: sync } = meistars
    ? await supabase
        .from('kalendars_sync')
        .select('*')
        .eq('meistars_id', meistars.id)
        .maybeSingle()
    : { data: null }

  const isConnected = !!(sync as { sync_aktīvs?: boolean } | null)?.sync_aktīvs

  const ERROR_MSGS: Record<string, string> = {
    access_denied: 'Piekļuve tika liegta.',
    no_refresh_token: 'Google neatgrieza refresh_token. Mēģiniet vēlreiz.',
    meistars_not_found: 'Profils nav atrasts.',
    db_error: 'Neizdevās saglabāt datus.',
    token_exchange: 'Kļūda autorizācijā.',
    not_configured: 'Google Calendar integrācija vēl nav pieejama.',
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Google Calendar</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Savienojiet savu Google kalendāru, lai automātiski bloķētu aizņemtos laikus un pievienotu rezervācijas.
        </p>
      </div>

      {searchParams.success && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 flex items-center gap-2 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          Google Calendar veiksmīgi savienots!
        </div>
      )}

      {searchParams.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {ERROR_MSGS[searchParams.error] ?? 'Nezināma kļūda.'}
        </div>
      )}

      <div className="rounded-2xl bg-white border border-border p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 grid place-items-center rounded-xl bg-brand-soft text-brand">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Google Calendar</p>
            <p className="text-sm text-muted-foreground">
              {isConnected ? `Savienots (${(sync as { google_calendar_id?: string } | null)?.google_calendar_id})` : 'Nav savienots'}
            </p>
          </div>
          <div className="ml-auto">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
              isConnected ? 'bg-green-100 text-green-700' : 'bg-secondary text-muted-foreground'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              {isConnected ? 'Aktīvs' : 'Neaktīvs'}
            </span>
          </div>
        </div>

        {isConnected ? (
          <div className="space-y-3">
            <ul className="text-sm text-muted-foreground space-y-1.5">
              {[
                'Rezervāciju laiki tiek bloķēti jūsu kalendārā',
                'Apstiprinot rezervāciju — tā parādās Google Calendar',
                'Klienti redz tikai brīvos laiku slotus',
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            {meistars && (
              <DisconnectButton meistarsId={meistars.id} />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <ul className="text-sm text-muted-foreground space-y-1.5">
              {[
                'Automātiski bloķē aizņemtos laikus',
                'Rezervācijas parādās jūsu Google Calendar',
                'Klienti redz tikai brīvos laiku slotus',
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary text-muted-foreground px-5 py-2.5 text-sm font-semibold cursor-not-allowed select-none">
              <Calendar className="h-4 w-4" />
              Savienot Google Calendar
              <span className="rounded-full bg-amber-100 text-amber-700 text-xs px-2 py-0.5">Drīzumā</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
