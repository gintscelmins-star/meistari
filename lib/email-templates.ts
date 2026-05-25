export const emailTemplates = {
  welcome: (vards: string) => ({
    subject: `Laipni lūdzam ProMeistars platformā, ${vards}!`,
    body: `Sveiks ${vards}!

Paldies, ka izvēlējies ProMeistars.

Tava meistara lapa drīzumā būs pieejama.
Saņemsi ziņu, kad lapa būs gatava.

Ja ir jautājumi — atbildi uz šo e-pastu.

Ar cieņu,
ProMeistars komanda

---
ProMeistars | promeistars.lv
Atrod uzticamu meistaru Latvijā`,
  }),

  published: (vards: string, url: string) => ({
    subject: `${vards}, tava lapa ir publicēta!`,
    body: `Sveiks ${vards}!

Tava meistara lapa ir publicēta un pieejama:
${url}

Ko darīt tālāk:
1. Ievietot šo linku savos SS.lv sludinājumos
2. Dalīties ar linku sociālajos tīklos
3. Pārbaudīt, vai visi dati ir pareizi

Pirmās 14 dienas ir bez maksas.

Ar cieņu,
ProMeistars

---
ProMeistars | promeistars.lv`,
  }),

  trialEnding: (vards: string, dienas: number) => ({
    subject: `${vards}, bezmaksas periods beidzas pēc ${dienas} dienām`,
    body: `Sveiks ${vards}!

Tava ProMeistars bezmaksas perioda beidzas pēc ${dienas} dienām.

Lai turpinātu izmantot platformu, aktivizē abonemetu par €19/mēnesī.

Ja ir jautājumi — atbildi uz šo e-pastu.

Ar cieņu,
ProMeistars

---
ProMeistars | promeistars.lv`,
  }),
}
