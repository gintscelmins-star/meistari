export type DarbaLaiks = {
  dienas: string[]
  no: string
  lidz: string
  avarijas: boolean
}

export type DemoMeistars = {
  vards: string
  iniciāļi: string
  specialitate_lv: string
  specialitate_ru: string
  kategorija: string
  regioni: string[]
  darba_laiks: DarbaLaiks
  rating: number
  atsauksmes_skaits: number
  cena_no: number
  subdomens: string
}

export const demo_meistari: DemoMeistars[] = [
  {
    vards: 'Andris Kalniņš',
    iniciāļi: 'AK',
    specialitate_lv: 'Santehniķis',
    specialitate_ru: 'Сантехник',
    kategorija: 'Santehniskie darbi',
    regioni: ['Rīga', 'Jūrmala'],
    darba_laiks: {
      dienas: ['Pirmd', 'Otrd', 'Trešd', 'Ceturtd', 'Piektd'],
      no: '08:00',
      lidz: '20:00',
      avarijas: true,
    },
    rating: 4.8,
    atsauksmes_skaits: 34,
    cena_no: 40,
    subdomens: 'https://andris-kalninsh.promeistars.lv',
  },
  {
    vards: 'Sergejs Ivanovs',
    iniciāļi: 'SI',
    specialitate_lv: 'Santehniķis',
    specialitate_ru: 'Сантехник',
    kategorija: 'Santehniskie darbi',
    regioni: ['Rīga', 'Mārupe'],
    darba_laiks: {
      dienas: ['Pirmd', 'Otrd', 'Trešd', 'Ceturtd', 'Piektd', 'Sestd'],
      no: '09:00',
      lidz: '18:00',
      avarijas: false,
    },
    rating: 4.6,
    atsauksmes_skaits: 28,
    cena_no: 35,
    subdomens: 'https://sergejs-ivanovs.promeistars.lv',
  },
  {
    vards: 'Māris Ozols',
    iniciāļi: 'MO',
    specialitate_lv: 'Santehniķis',
    specialitate_ru: 'Сантехник',
    kategorija: 'Santehniskie darbi',
    regioni: ['Jelgava', 'Rīga'],
    darba_laiks: {
      dienas: ['Pirmd', 'Otrd', 'Trešd', 'Ceturtd', 'Piektd', 'Sestd', 'Svētd'],
      no: '07:00',
      lidz: '22:00',
      avarijas: true,
    },
    rating: 4.9,
    atsauksmes_skaits: 51,
    cena_no: 45,
    subdomens: 'https://maris-ozols.promeistars.lv',
  },
]
