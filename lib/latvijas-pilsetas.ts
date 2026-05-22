export type Pilseta = { pilseta: string; rajoni: string[] }

export const pilsetas: Pilseta[] = [
  {
    pilseta: 'Rīga',
    rajoni: [
      'Centrs', 'Āgenskalns', 'Pļavnieki', 'Purvciems', 'Imanta',
      'Ziepniekkalns', 'Mežciems', 'Jugla', 'Teika', 'Vecmīlgrāvis',
      'Vecāķi', 'Bolderāja',
    ],
  },
  { pilseta: 'Jūrmala', rajoni: ['Majori', 'Dubulti', 'Dzintari', 'Bulduri', 'Lielupe', 'Ķemeri'] },
  { pilseta: 'Jelgava', rajoni: [] },
  { pilseta: 'Daugavpils', rajoni: [] },
  { pilseta: 'Liepāja', rajoni: [] },
  { pilseta: 'Ventspils', rajoni: [] },
  { pilseta: 'Ogre', rajoni: [] },
  { pilseta: 'Sigulda', rajoni: [] },
  { pilseta: 'Cēsis', rajoni: [] },
  { pilseta: 'Valmiera', rajoni: [] },
  { pilseta: 'Jēkabpils', rajoni: [] },
  { pilseta: 'Rēzekne', rajoni: [] },
]
