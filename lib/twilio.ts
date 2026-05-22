import twilio from 'twilio'
export { SMS_TEKSTI } from './sms-teksti'

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)
