import { NextRequest } from 'next/server'

const requests = new Map<string, number[]>()

export function rateLimit(
  req: NextRequest,
  maxRequests = 100,
  windowMs = 60000
): boolean {
  const ip = req.headers.get('x-forwarded-for') ??
             req.headers.get('x-real-ip') ??
             'unknown'
  const now = Date.now()
  const windowStart = now - windowMs

  const reqTimes = requests.get(ip) ?? []
  const recentReqs = reqTimes.filter(t => t > windowStart)

  if (recentReqs.length >= maxRequests) return false

  recentReqs.push(now)
  requests.set(ip, recentReqs)
  return true
}
