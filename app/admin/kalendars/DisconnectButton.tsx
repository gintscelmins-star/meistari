'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

export default function DisconnectButton({ meistarsId }: { meistarsId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDisconnect() {
    setLoading(true)
    const supabase = getSupabaseClient()
    await supabase
      .from('kalendars_sync')
      .update({ sync_aktīvs: false, google_refresh_token: null })
      .eq('meistars_id', meistarsId)
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleDisconnect}
      disabled={loading}
      className="text-sm text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
    >
      {loading ? 'Atvienojas...' : 'Atvienot Google Calendar'}
    </button>
  )
}
