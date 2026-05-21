# Sprint 4 — SMS/WA + Webhooks

## Statuss: ✅ Pabeigts

## Izmaiņas

- `lib/twilio.ts` — Twilio klients + ziņojumu teksti (LV/RU)
- `app/api/crm/send-sms` — SMS sūtīšana ar template
- `app/api/crm/send-whatsapp` — WA sūtīšana ar template
- `app/api/crm/webhook` — inbound atbildes + auto-statuss + admin paziņojums
- `app/api/crm/prospects/[id]` — pievienots GET handler
- `app/api/crm/prospects/[id]/zinojumi` — ziņojumu vēsture
- CRM tabula — 📱 SMS un 💬 WA pogas ar loading/ok/err stāvokļiem
- `app/crm/(protected)/prospects/[id]/page.tsx` — prospect detail lapa

## Twilio webhook konfigurācija

Twilio Console → Phone Numbers → aktīvs numurs → **Messaging** sadaļa:

```
A message comes in → Webhook → POST
https://promeistars.lv/api/crm/webhook
```

Tas pats WhatsApp Sandbox vai numuram.

## ENV mainīgie

```
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx     ← SMS numurs
TWILIO_WHATSAPP_NUMBER=+14155238886  ← WA Sandbox vai verifikāts numurs
ADMIN_WHATSAPP=+371xxxxxxxx          ← tavs WA paziņojumiem
```

## Ziņojumu plūsma

```
CRM → [📱 SMS] → POST /api/crm/send-sms
               → Twilio sūta SMS
               → zinojumi INSERT (out)
               → prospects UPDATE statuss='nosutits'

Klients atbild → Twilio → POST /api/crm/webhook
                         → zinojumi INSERT (in)
                         → prospects UPDATE statuss='atbildeja' (ja pozitīva)
                         → Admin saņem WA paziņojumu
```

## Testēšana

- [ ] SMS nosūtīts → redzams zinojumi tabulā
- [ ] Atbilde → statuss mainās uz "atbildeja"
- [ ] Admin saņem WA paziņojumu
- [ ] Ziņojumu vēsture redzama prospect lapā
- [ ] npm run build bez kļūdām

## Nākamais: Sprint 5 — Jā workflow
