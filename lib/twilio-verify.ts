import crypto from 'crypto'

/**
 * Verifies X-Twilio-Signature using HMAC-SHA1.
 * Twilio signs: URL + alphabetically sorted POST params concatenated.
 */
export function verifyTwilioWebhook(
  authToken: string,
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  if (!signature) return false

  const sortedKeys = Object.keys(params).sort()
  const str = url + sortedKeys.map(k => k + params[k]).join('')

  const hmac = crypto.createHmac('sha1', authToken)
  hmac.update(str, 'utf8')
  const computed = hmac.digest('base64')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed),
      Buffer.from(signature)
    )
  } catch {
    return false
  }
}

/** Extract FormData into a plain Record for signature verification. */
export function formDataToParams(formData: FormData): Record<string, string> {
  const params: Record<string, string> = {}
  formData.forEach((val, key) => {
    params[key] = val.toString()
  })
  return params
}

/** Generate a valid Twilio signature — used in tests and curl examples. */
export function generateTestSignature(
  authToken: string,
  url: string,
  params: Record<string, string>
): string {
  const sortedKeys = Object.keys(params).sort()
  const str = url + sortedKeys.map(k => k + params[k]).join('')
  const hmac = crypto.createHmac('sha1', authToken)
  hmac.update(str, 'utf8')
  return hmac.digest('base64')
}
