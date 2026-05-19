import { google } from 'googleapis'

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  )
}

export function getAuthUrl(state: string) {
  const client = getOAuth2Client()
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar'],
    state,
  })
}

export async function getTokensFromCode(code: string) {
  const client = getOAuth2Client()
  const { tokens } = await client.getToken(code)
  return tokens
}

export async function getAccessToken(refreshToken: string): Promise<string> {
  const client = getOAuth2Client()
  client.setCredentials({ refresh_token: refreshToken })
  const { token } = await client.getAccessToken()
  if (!token) throw new Error('Neizdevās iegūt access token')
  return token
}

export async function getFreeBusy(
  refreshToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<Array<{ start: string; end: string }>> {
  const accessToken = await getAccessToken(refreshToken)

  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      items: [{ id: calendarId }],
    }),
  })

  if (!res.ok) return []

  const data = await res.json()
  return data.calendars?.[calendarId]?.busy ?? []
}

export async function createCalendarEvent(
  refreshToken: string,
  calendarId: string,
  event: {
    summary: string
    description: string
    startDateTime: string
    endDateTime: string
  }
): Promise<string | null> {
  const accessToken = await getAccessToken(refreshToken)

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.startDateTime, timeZone: 'Europe/Riga' },
        end: { dateTime: event.endDateTime, timeZone: 'Europe/Riga' },
      }),
    }
  )

  if (!res.ok) return null
  const data = await res.json()
  return data.id ?? null
}
