import { getDemoSantehnikisData } from '@/lib/demo-meistari'
import MeistarsProfils from '@/app/meistari/[slug]/MeistarsProfils'

export const metadata = {
  title: 'Demo Santehniķis | ProMeistars',
  description: 'Meistara profila piemērs — Andris Kalniņš, santehniķis Rīgā.',
}

export default function DemoSantehnikisPage() {
  const data = getDemoSantehnikisData()
  return <MeistarsProfils {...data} isDemo />
}
