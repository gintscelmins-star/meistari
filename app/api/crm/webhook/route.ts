import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { twilioClient } from '@/lib/twilio'
import { getSupabaseServer } from '@/lib/supabase'
import { verifyTwilioWebhook, formDataToParams } from '@/lib/twilio-verify'
import { logWebhookEvent } from '@/lib/webhook-logger'

const TWIML_OK = '<?xml version="1.0"?><Response></Response>'
const SITE_URL = 'https://promeistars.lv'

const JA_REGEX = /^\s*(jā|ja|jaa|yes|ok|labi|piekritu|да|ок|согласен)\s*[!.]*\s*$/i

function twiml(): NextResponse {
  return new NextResponse(TWIML_OK, { headers: { 'Content-Type': 'text/xml' } })
}

export async function POST(req: NextRequest) {
  // Read body once — used for both signature verification and processing
  const formData = await req.formData()
  const params = formDataToParams(formData)

  // ── Security: X-Twilio-Signature verification ─────────────────────────────
  const authToken = process.env.TWILIO_AUTH_TOKEN ?? ''
  const signature = req.headers.get('x-twilio-signature') ?? ''
  const skipVerify = process.env.SKIP_TWILIO_VERIFY === 'true'

  if (!skipVerify) {
    const isValid = verifyTwilioWebhook(authToken, signature, req.url, params)
    if (!isValid) {
      await logWebhookEvent({
        event_type: 'invalid_signature',
        status: 'error',
        from_number: params['From'],
        details: { url: req.url, sig_present: !!signature },
      })
      return new NextResponse('Unauthorized', { status: 403 })
    }
  }

  // ── Parse payload ─────────────────────────────────────────────────────────
  const no = params['From']
  const teksts = params['Body']
  const messageSid = params['MessageSid']

  if (!no || !teksts) {
    return twiml()
  }

  const kanals = no.startsWith('whatsapp:') ? 'whatsapp' : 'sms'
  const talrunis = no.replace('whatsapp:', '')

  const supabase = getSupabaseServer()

  // ── Prospect lookup ───────────────────────────────────────────────────────
  const { data: prospect } = await supabase
    .from('prospects')
    .select('id, vards, uzvards, valoda, anketa_unique_code, telefons, whatsapp')
    .eq('telefons', talrunis)
    .eq('dzesanas_pieprasits', false)
    .single()

  if (!prospect) {
    await logWebhookEvent({
      event_type: 'unknown_sender',
      status: 'ignored',
      from_number: talrunis,
      details: { kanals, message_sid: messageSid },
    })
    return twiml()
  }

  // Log incoming message
  await logWebhookEvent({
    event_type: kanals === 'whatsapp' ? 'incoming_wa' : 'incoming_sms',
    status: 'success',
    from_number: talrunis,
    prospect_id: prospect.id,
    details: { teksts: teksts.slice(0, 200), message_sid: messageSid },
  })

  // ── Save incoming message to zinojumi ─────────────────────────────────────
  await supabase.from('zinojumi').insert({
    prospect_id: prospect.id,
    kanals,
    virziens: 'in',
    teksts,
    statuss: 'nosutits',
  })

  // ── Update prospect status ────────────────────────────────────────────────
  await supabase
    .from('prospects')
    .update({ statuss: 'atbildeja', pedeja_kontakts: new Date().toISOString() })
    .eq('id', prospect.id)

  const adminWa = process.env.ADMIN_WHATSAPP
  const isJa = JA_REGEX.test(teksts.trim())

  if (isJa && !prospect.anketa_unique_code) {
    // ── "Jā" path — send anketa link ─────────────────────────────────────
    const anketaCode = crypto.randomUUID()
    const anketaUrl = `${SITE_URL}/anketa/${anketaCode}`

    await supabase
      .from('prospects')
      .update({
        anketa_unique_code: anketaCode,
        statuss: 'anketa_nosutita',
        updated_at: new Date().toISOString(),
      })
      .eq('id', prospect.id)

    const smsTeksts =
      prospect.valoda === 'ru'
        ? `Отлично! Заполни анкету (займёт 3 мин): ${anketaUrl} — ProMeistars`
        : `Lieliski! Aizpildi anketu (3 min): ${anketaUrl} — ProMeistars`

    await twilioClient.messages
      .create({
        body: smsTeksts,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: prospect.telefons,
      })
      .catch(() => {})

    await logWebhookEvent({
      event_type: 'anketa_sent',
      status: 'success',
      from_number: talrunis,
      prospect_id: prospect.id,
      details: { anketa_url: anketaUrl },
    })

    if (adminWa) {
      await twilioClient.messages
        .create({
          body: `🎉 JĀ! ${prospect.vards} ${prospect.uzvards} piekrita.\nAnketa: ${anketaUrl}\nTel: ${talrunis}`,
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER!}`,
          to: `whatsapp:${adminWa}`,
        })
        .catch(() => {})

      await logWebhookEvent({
        event_type: 'admin_notified',
        status: 'success',
        from_number: talrunis,
        prospect_id: prospect.id,
      })
    }
  } else {
    // ── Other reply — notify admin ────────────────────────────────────────
    if (adminWa) {
      await twilioClient.messages
        .create({
          body: `🔔 JAUNA ATBILDE!\n${prospect.vards} ${prospect.uzvards}: "${teksts}"\nTel: ${talrunis}`,
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER!}`,
          to: `whatsapp:${adminWa}`,
        })
        .catch(() => {})

      await logWebhookEvent({
        event_type: 'admin_notified',
        status: 'success',
        from_number: talrunis,
        prospect_id: prospect.id,
        details: { teksts: teksts.slice(0, 100) },
      })
    }
  }

  return twiml()
}
