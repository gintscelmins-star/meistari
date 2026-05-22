export const SMS_TEKSTI = {
  LV: {
    pirmais: (vards: string, url: string) =>
      `Sveiks ${vards}! Esmu Gints. Izveidoju tev demo lapu: ${url} — Pirmais mēnesis bezmaksas!`,
    demo_gatavs: (vards: string, url: string) =>
      `Sveiks ${vards}! Tava demo lapa ir gatava: ${url} — Bezmaksas 14 dienas. Pamēģini!`,
    followup: (vards: string, url: string) =>
      `Sveiks ${vards}! Vai redzēji demo lapu? ${url}`,
    trial_beigas: (vards: string) =>
      `Sveiks ${vards}! Beidzas bezmaksas periods. Turpināt par €19/mēn? Atbildi JĀ vai NĒ.`,
  },
  RU: {
    pirmais: (vards: string, url: string) =>
      `Привет ${vards}! Меня зовут Гинтс. Сделал тебе демо: ${url} — Первый месяц бесплатно!`,
    demo_gatavs: (vards: string, url: string) =>
      `Привет ${vards}! Твоя демо-страница готова: ${url} — Бесплатно 14 дней. Попробуй!`,
    followup: (vards: string, url: string) =>
      `Привет ${vards}! Видел демо страницу? ${url}`,
    trial_beigas: (vards: string) =>
      `Привет ${vards}! Заканчивается бесплатный период. Продолжить за €19/мес? Ответь ДА или НЕТ.`,
  },
}
