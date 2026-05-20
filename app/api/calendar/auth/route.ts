import { redirect } from 'next/navigation'

export async function GET() {
  // Google Calendar nav konfigurēts šajā vidē
  return redirect('/admin/kalendars?error=not_configured')
}
