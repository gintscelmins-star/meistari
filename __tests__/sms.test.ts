/**
 * SMS system unit tests.
 * Run: npx vitest run __tests__/sms.test.ts
 */

import { describe, it, expect } from 'vitest'
import { verifyTwilioWebhook, generateTestSignature, formDataToParams } from '../lib/twilio-verify'
import { normalizePhoneNumber } from '../lib/twilio'

// ── verifyTwilioWebhook ────────────────────────────────────────────────────

describe('verifyTwilioWebhook', () => {
  const authToken = 'test_auth_token_abc123'
  const url = 'https://promeistars.lv/api/crm/webhook'
  const params = {
    From: '+37120000001',
    To: '+37112345678',
    Body: 'Jā',
    MessageSid: 'SMxxxxxxx',
  }

  it('accepts a valid signature', () => {
    const sig = generateTestSignature(authToken, url, params)
    expect(verifyTwilioWebhook(authToken, sig, url, params)).toBe(true)
  })

  it('rejects a tampered signature', () => {
    expect(verifyTwilioWebhook(authToken, 'invalidsig==', url, params)).toBe(false)
  })

  it('rejects empty signature', () => {
    expect(verifyTwilioWebhook(authToken, '', url, params)).toBe(false)
  })

  it('rejects valid sig when params differ', () => {
    const sig = generateTestSignature(authToken, url, params)
    const tamperedParams = { ...params, Body: 'NĒ' }
    expect(verifyTwilioWebhook(authToken, sig, url, tamperedParams)).toBe(false)
  })

  it('rejects valid sig when URL differs', () => {
    const sig = generateTestSignature(authToken, url, params)
    expect(verifyTwilioWebhook(authToken, sig, 'https://evil.com/webhook', params)).toBe(false)
  })

  it('is deterministic — same inputs produce same signature', () => {
    const sig1 = generateTestSignature(authToken, url, params)
    const sig2 = generateTestSignature(authToken, url, params)
    expect(sig1).toBe(sig2)
  })
})

// ── formDataToParams ───────────────────────────────────────────────────────

describe('formDataToParams', () => {
  it('extracts all FormData fields into a plain Record', () => {
    const fd = new FormData()
    fd.set('Body', 'Jā')
    fd.set('From', '+37120000001')
    const result = formDataToParams(fd)
    expect(result).toEqual({ Body: 'Jā', From: '+37120000001' })
  })
})

// ── normalizePhoneNumber ───────────────────────────────────────────────────

describe('normalizePhoneNumber', () => {
  const cases: Array<[string, string]> = [
    ['20000001', '+37120000001'],          // 8-digit Latvian
    ['37120000001', '+37120000001'],       // with country code, no +
    ['+37120000001', '+37120000001'],      // already E.164
    ['0037120000001', '+37120000001'],     // 00-prefix
    ['+37129999999', '+37129999999'],      // another Latvian number
  ]

  cases.forEach(([input, expected]) => {
    it(`"${input}" → "${expected}"`, () => {
      expect(normalizePhoneNumber(input)).toBe(expected)
    })
  })
})

// ── isYesResponse (regex, inline) ─────────────────────────────────────────

describe('isYesResponse regex', () => {
  const JA_REGEX = /^\s*(jā|ja|jaa|yes|ok|labi|piekritu|да|ок|согласен)\s*[!.]*\s*$/i

  const yesInputs = ['Jā', 'ja', 'JĀ', 'yes', 'ok', 'OK', 'Ok!', 'labi', 'piekritu', 'да', 'ок', 'согласен']
  const noInputs = ['nē', 'nope', 'varbūt', 'jā bet', 'jāzeps', 'okay']

  yesInputs.forEach(s => {
    it(`"${s}" is a YES`, () => {
      expect(JA_REGEX.test(s)).toBe(true)
    })
  })

  noInputs.forEach(s => {
    it(`"${s}" is NOT a yes`, () => {
      expect(JA_REGEX.test(s)).toBe(false)
    })
  })
})
