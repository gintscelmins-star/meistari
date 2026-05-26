/**
 * SMS/Webhook testing utilities.
 * Run directly: npx tsx lib/sms-testing.ts
 */

import { sendTwilioMessage, getTwilioInfo, normalizePhoneNumber } from '@/lib/twilio'
import { generateTestSignature } from '@/lib/twilio-verify'

const WEBHOOK_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/crm/webhook`
  : 'https://promeistars.lv/api/crm/webhook'

/** Send a real SMS to a single phone number. */
export async function testSendSMS(
  phone: string,
  message: string
): Promise<void> {
  console.log(`Sending SMS to ${phone}...`)
  const result = await sendTwilioMessage(phone, message, 'sms')
  if (result.success) {
    console.log(`✅ Sent! SID: ${result.sid}`)
  } else {
    console.error(`❌ Failed: ${result.error}`)
  }
}

/** Send a test SMS to all 3 test prospect phones. */
export async function testBulkSMS(message: string): Promise<void> {
  const testPhones = ['+37120000001', '+37120000002', '+37120000003']
  console.log(`Bulk SMS to ${testPhones.length} test numbers...`)
  for (const phone of testPhones) {
    await testSendSMS(phone, message)
  }
}

/** Build a test Twilio webhook POST body and log the curl command. */
export function simulateTwilioWebhook(fromPhone: string, messageBody: string): void {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) {
    console.error('❌ TWILIO_AUTH_TOKEN not set')
    return
  }

  const params: Record<string, string> = {
    From: fromPhone,
    To: process.env.TWILIO_PHONE_NUMBER ?? '+37100000000',
    Body: messageBody,
    MessageSid: `SM${Date.now()}`,
    AccountSid: process.env.TWILIO_ACCOUNT_SID ?? '',
    NumMedia: '0',
  }

  const signature = generateTestSignature(authToken, WEBHOOK_URL, params)
  const formBody = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

  console.log('\n📨 Simulated webhook curl command:')
  console.log(`curl -X POST "${WEBHOOK_URL}" \\`)
  console.log(`  -H "X-Twilio-Signature: ${signature}" \\`)
  console.log(`  -H "Content-Type: application/x-www-form-urlencoded" \\`)
  console.log(`  -d "${formBody}"`)
  console.log()
}

/** Check that X-Twilio-Signature verification works correctly. */
export function testWebhookSignature(): void {
  const authToken = 'test_auth_token_123'
  const url = 'https://promeistars.lv/api/crm/webhook'
  const params = { Body: 'Jā', From: '+37120000001', To: '+37112345678' }

  const { verifyTwilioWebhook, generateTestSignature: gen } =
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@/lib/twilio-verify') as typeof import('@/lib/twilio-verify')

  const sig = gen(authToken, url, params)
  const valid = verifyTwilioWebhook(authToken, sig, url, params)
  const invalid = verifyTwilioWebhook(authToken, 'badsig==', url, params)

  console.log(`✅ Valid signature check: ${valid ? 'PASS' : 'FAIL'}`)
  console.log(`✅ Invalid signature check: ${!invalid ? 'PASS' : 'FAIL'}`)
}

/** Check Twilio account connectivity. */
export async function testTwilioConnection(): Promise<void> {
  console.log('Testing Twilio connection...')
  const info = await getTwilioInfo()
  if (info) {
    console.log(`✅ Connected: ${info.friendlyName} (${info.status})`)
    console.log(`   Account SID: ${info.accountSid}`)
  } else {
    console.error('❌ Could not connect to Twilio API')
  }
}

/** Normalize phone number examples. */
export function testNormalizePhone(): void {
  const cases: [string, string][] = [
    ['20000001', '+37120000001'],
    ['37120000001', '+37120000001'],
    ['+37120000001', '+37120000001'],
    ['0037120000001', '+37120000001'],
  ]
  console.log('Phone normalization tests:')
  for (const [input, expected] of cases) {
    const result = normalizePhoneNumber(input)
    const ok = result === expected
    console.log(`  ${ok ? '✅' : '❌'} "${input}" → "${result}" (expected: "${expected}")`)
  }
}

// CLI entry point
async function main() {
  const cmd = process.argv[2]

  if (cmd === 'connection') {
    await testTwilioConnection()
  } else if (cmd === 'signature') {
    testWebhookSignature()
  } else if (cmd === 'normalize') {
    testNormalizePhone()
  } else if (cmd === 'simulate') {
    const phone = process.argv[3] ?? '+37120000001'
    const body = process.argv[4] ?? 'Jā'
    simulateTwilioWebhook(phone, body)
  } else if (cmd === 'sms') {
    const phone = process.argv[3]
    const msg = process.argv[4] ?? 'Test SMS no ProMeistars'
    if (!phone) { console.error('Usage: npx tsx lib/sms-testing.ts sms <phone> [message]'); process.exit(1) }
    await testSendSMS(phone, msg)
  } else {
    console.log('Usage: npx tsx lib/sms-testing.ts <command>')
    console.log('Commands:')
    console.log('  connection          — test Twilio API connectivity')
    console.log('  signature           — verify HMAC-SHA1 implementation')
    console.log('  normalize           — test phone number normalization')
    console.log('  simulate <from> <body>  — print curl for a fake webhook')
    console.log('  sms <phone> [msg]   — send a real SMS')
  }
}

if (require.main === module) {
  main().catch(console.error)
}
