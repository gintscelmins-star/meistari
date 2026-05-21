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

export type DemoPaklItem = {
  id: string
  nosaukums: string
  cena_no: number
  ilgums_h: number | null
  meistars_id: string
}

export type DemoAtsauksme = {
  id: string
  autors: string
  teksts: string
  vertejums: number
  datums: string
  meistars_id: string
}

export type DemoFoto = {
  id: string
  url: string
  apraksts: string | null
}

export type DemoDarbaLaiks = {
  dienas_nr: number
  no_laiks: string
  lidz_laiks: string
  strada: boolean
}

export type DemoPakKat = {
  katNosaukums: string
  katKartiba: number
  items: Array<{
    cena_no: number | null
    cena_lidz: number | null
    apraksts: string | null
    nosaukums: string | null
  }>
}

export type DemoKatalogaKat = {
  id: string
  nosaukums: string
  standartu_pakalpojumi: Array<{ nosaukums: string; kartiba: number | null }>
}

export type DemoProfilsData = {
  meistars: {
    id: string
    vards: string
    uzvards: string
    specialitate: string
    apraksts: string | null
    pieredze_gadi: number | null
    rating: number | null
    foto_url: string | null
    telefons: string
    aktīvs: boolean
    pilseta: string | null
    slug: string
    user_id: string | null
  }
  pakalpojumi: DemoPaklItem[]
  atsauksmes: DemoAtsauksme[]
  galerija: DemoFoto[]
  darbaLaiki: DemoDarbaLaiks[]
  regioniNosaukumi: string[]
  meistaraPakKategorijas: DemoPakKat[]
  katalogaKategorijas: DemoKatalogaKat[]
}

export function getDemoSantehnikisData(): DemoProfilsData {
  return {
    meistars: {
      id: 'demo-santehnikis',
      vards: 'Andris',
      uzvards: 'Kalniņš',
      specialitate: 'Santehniķis',
      apraksts: 'Vairāk nekā 15 gadus strādāju par santehniķi Rīgā un apkārtnē. Strādāju precīzi, tīri un ar garantiju. Pieņemu avārijas izsaukumus 24/7.',
      pieredze_gadi: 15,
      rating: 4.8,
      foto_url: null,
      telefons: '+371 20000000',
      aktīvs: true,
      pilseta: 'Rīga',
      slug: 'demo-santehnikis',
      user_id: null,
    },
    pakalpojumi: [
      { id: 'p1', nosaukums: 'Ūdensvada darbi', cena_no: 40, ilgums_h: 1, meistars_id: 'demo' },
      { id: 'p2', nosaukums: 'Kanalizācija', cena_no: 45, ilgums_h: 2, meistars_id: 'demo' },
      { id: 'p3', nosaukums: 'Apkures sistēmas', cena_no: 60, ilgums_h: 3, meistars_id: 'demo' },
      { id: 'p4', nosaukums: 'Boileri un ūdenssildītāji', cena_no: 80, ilgums_h: 2, meistars_id: 'demo' },
      { id: 'p5', nosaukums: 'Vannas istabas iekārtošana', cena_no: 200, ilgums_h: null, meistars_id: 'demo' },
      { id: 'p6', nosaukums: 'Ārkārtas dienests 24/7', cena_no: 80, ilgums_h: 1, meistars_id: 'demo' },
    ],
    atsauksmes: [
      { id: 'a1', autors: 'Ilze Bērziņa', teksts: 'Ātri ieradās un nomainīja krānu. Viss tīri un kārtīgi. Iesaku!', vertejums: 5, datums: '2025-03-15', meistars_id: 'demo' },
      { id: 'a2', autors: 'Jānis Ozols', teksts: 'Avārijas izsaukums naktī — atbrauca pēc stundas un atrisināja problēmu. Paldies!', vertejums: 5, datums: '2025-02-20', meistars_id: 'demo' },
      { id: 'a3', autors: 'Anna Liepiņa', teksts: 'Profesionāli ierīkoja jaunu vannas istabu. Cena godīga, darbs kvalitatīvs.', vertejums: 5, datums: '2025-01-10', meistars_id: 'demo' },
    ],
    galerija: [],
    darbaLaiki: [
      { dienas_nr: 1, no_laiks: '08:00', lidz_laiks: '20:00', strada: true },
      { dienas_nr: 2, no_laiks: '08:00', lidz_laiks: '20:00', strada: true },
      { dienas_nr: 3, no_laiks: '08:00', lidz_laiks: '20:00', strada: true },
      { dienas_nr: 4, no_laiks: '08:00', lidz_laiks: '20:00', strada: true },
      { dienas_nr: 5, no_laiks: '08:00', lidz_laiks: '20:00', strada: true },
      { dienas_nr: 6, no_laiks: '09:00', lidz_laiks: '18:00', strada: true },
      { dienas_nr: 7, no_laiks: '00:00', lidz_laiks: '00:00', strada: false },
    ],
    regioniNosaukumi: ['Rīga', 'Jūrmala', 'Mārupe', 'Ķekava', 'Salaspils'],
    meistaraPakKategorijas: [
      {
        katNosaukums: 'Ūdensvads un kanalizācija',
        katKartiba: 1,
        items: [
          { nosaukums: 'Cauruļu remonts un nomaiņa', cena_no: 40, cena_lidz: 120, apraksts: null },
          { nosaukums: 'Aizdambējumu tīrīšana', cena_no: 45, cena_lidz: 100, apraksts: null },
          { nosaukums: 'Jaunu cauruļvadu montāža', cena_no: 60, cena_lidz: 200, apraksts: null },
        ],
      },
      {
        katNosaukums: 'Apkure un boileri',
        katKartiba: 2,
        items: [
          { nosaukums: 'Radiatoru uzstādīšana', cena_no: 60, cena_lidz: 150, apraksts: null },
          { nosaukums: 'Boilera uzstādīšana', cena_no: 80, cena_lidz: 200, apraksts: null },
          { nosaukums: 'Apkures sistēmas remonts', cena_no: 70, cena_lidz: 250, apraksts: null },
        ],
      },
    ],
    katalogaKategorijas: [],
  }
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
    subdomens: '/meistari/demo-santehnikis',
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
    subdomens: '/meistari/demo-santehnikis',
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
    subdomens: '/meistari/demo-santehnikis',
  },
]
