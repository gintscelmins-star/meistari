export const SMS_TEKSTI = {
  LV: {
    pirmais: (vards: string, url: string) =>
      `Sveiks ${vards}! ProMeistars platformā izveidoju tev demo lapu: ${url} — Pirmais mēnesis bezmaksas!`,
    demo_gatavs: (vards: string, url: string) =>
      `Sveiks ${vards}! Tava demo lapa ir gatava: ${url} — Bezmaksas 14 dienas. Pamēģini!`,
    anketa: (_vards: string, url: string) =>
      `Lieliski! Aizpildi anketu (3 min): ${url}`,
    followup: (vards: string, url: string) =>
      `Sveiks ${vards}! Vai redzēji demo lapu? ${url}`,
    publicets: (vards: string, url: string) =>
      `Tava lapa ir publicēta! ${url}\n\nPirmās 14 dienas bezmaksas. Pēc tam €19/mēn.\n\n— ProMeistars`,
    trial_beigas: (vards: string) =>
      `Sveiks ${vards}! Beidzas bezmaksas periods. Turpināt par €19/mēn? Atbildi JĀ vai NĒ. — ProMeistars`,
  },
  RU: {
    pirmais: (vards: string, url: string) =>
      `Привет ${vards}! На ProMeistars создал тебе демо: ${url} — Первый месяц бесплатно!`,
    demo_gatavs: (vards: string, url: string) =>
      `Привет ${vards}! Твоя демо-страница готова: ${url} — Бесплатно 14 дней. Попробуй!`,
    anketa: (_vards: string, url: string) =>
      `Отлично! Заполни анкету (3 мин): ${url}`,
    followup: (vards: string, url: string) =>
      `Привет ${vards}! Видел демо страницу? ${url}`,
    publicets: (vards: string, url: string) =>
      `Твоя страница опубликована! ${url}\n\nПервые 14 дней бесплатно. Потом €19/мес.\n\n— ProMeistars`,
    trial_beigas: (vards: string) =>
      `Привет ${vards}! Заканчивается бесплатный период. Продолжить за €19/мес? Ответь ДА или НЕТ. — ProMeistars`,
  },
}
