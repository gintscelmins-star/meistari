export type Pakalpojums = { lv: string; ru: string }

export type Apakskategorija = {
  nosaukums_lv: string
  nosaukums_ru: string
  pakalpojumi: Pakalpojums[]
}

export type Kategorija = {
  kategorija_lv: string
  kategorija_ru: string
  apakskategorijas: Apakskategorija[]
}

export const pakalpojumi: Kategorija[] = [
  {
    kategorija_lv: 'Būvdarbi',
    kategorija_ru: 'Строительство',
    apakskategorijas: [
      {
        nosaukums_lv: 'Apdare, iekšdarbi',
        nosaukums_ru: 'Отделка, внутренние работы',
        pakalpojumi: [
          { lv: 'Apkures sistēmas', ru: 'Системы отопления' },
          { lv: 'Apmetēju darbi', ru: 'Штукатурные работы' },
          { lv: 'Apmetums dekoratīvais', ru: 'Декоративная штукатурка' },
          { lv: 'Darbi ar reģipsi', ru: 'Работы с гипсокартоном' },
          { lv: 'Elektriskā instalācija', ru: 'Электромонтаж' },
          { lv: 'Flīžu likšana', ru: 'Укладка плитки' },
          { lv: 'Kondicionieru uzstādīšana', ru: 'Установка кондиционеров' },
          { lv: 'Krāsošanas darbi', ru: 'Малярные работы' },
          { lv: 'Linoleja ieklāšana', ru: 'Укладка линолеума' },
          { lv: 'Nostiepjamie griesti', ru: 'Натяжные потолки' },
          { lv: 'Parketa ieklāšana', ru: 'Укладка паркета' },
          { lv: 'Santehniskie darbi', ru: 'Сантехнические работы' },
          { lv: 'Tapešu līmēšana', ru: 'Поклейка обоев' },
          { lv: 'Telpu uzkopšana', ru: 'Уборка помещений' },
          { lv: 'Uzlejamās grīdas', ru: 'Наливные полы' },
          { lv: 'Ventilācija', ru: 'Вентиляция' },
        ],
      },
      {
        nosaukums_lv: 'Būvdarbi, projekti',
        nosaukums_ru: 'Строительство, проекты',
        pakalpojumi: [
          { lv: 'Betonēšanas darbi', ru: 'Бетонные работы' },
          { lv: 'Bruģēšanas darbi', ru: 'Брусчатка' },
          { lv: 'Demontāžas darbi', ru: 'Демонтажные работы' },
          { lv: 'Dzīvojamās mājas', ru: 'Жилые дома' },
          { lv: 'Fasādes darbi', ru: 'Фасадные работы' },
          { lv: 'Galdniecības darbi', ru: 'Столярные работы' },
          { lv: 'Jumta darbi', ru: 'Кровельные работы' },
          { lv: 'Kanalizācija, ūdensvads', ru: 'Канализация, водопровод' },
          { lv: 'Metināšanas darbi', ru: 'Сварочные работы' },
          { lv: 'Mūrēšana, pamati', ru: 'Кладка, фундаменты' },
          { lv: 'Pirtis', ru: 'Бани' },
          { lv: 'Projektēšanas darbi', ru: 'Проектирование' },
          { lv: 'Teritorijas labiekārtošana', ru: 'Благоустройство' },
          { lv: 'Urbumi', ru: 'Бурение' },
        ],
      },
      {
        nosaukums_lv: 'Logi, durvis, kāpnes',
        nosaukums_ru: 'Окна, двери, лестницы',
        pakalpojumi: [
          { lv: 'Durvis, durvju mezgli', ru: 'Двери' },
          { lv: 'Kāpnes, margas', ru: 'Лестницы, перила' },
          { lv: 'Logi, stikla paketes', ru: 'Окна, стеклопакеты' },
          { lv: 'Vārti, vārtiņi', ru: 'Ворота' },
          { lv: 'Žogi, nožogojumi', ru: 'Заборы, ограждения' },
        ],
      },
    ],
  },
]

export function getAllPakalpojumiLv(): string[] {
  return pakalpojumi.flatMap(k =>
    k.apakskategorijas.flatMap(ak => ak.pakalpojumi.map(p => p.lv))
  )
}

export function findKategorijaForPakalpojums(lv: string): { kategorija_lv: string; apakskategorija_lv: string } | null {
  for (const k of pakalpojumi) {
    for (const ak of k.apakskategorijas) {
      if (ak.pakalpojumi.some(p => p.lv === lv)) {
        return { kategorija_lv: k.kategorija_lv, apakskategorija_lv: ak.nosaukums_lv }
      }
    }
  }
  return null
}
