import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-gray-600">
              Latvijas lielākā meistaru platforma.
              Atrod uzticamu speciālistu jebkuram darbam.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Meistariem</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/register" className="text-gray-600 hover:text-blue-600 transition-colors">Reģistrēties</a></li>
              <li><a href="/admin/login" className="text-gray-600 hover:text-blue-600 transition-colors">Ielogoties</a></li>
              <li><a href="/cenas" className="text-gray-600 hover:text-blue-600 transition-colors">Cenas</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Klientiem</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/#meistari" className="text-gray-600 hover:text-blue-600 transition-colors">Meklēt meistaru</a></li>
              <li><a href="/#kategorijas" className="text-gray-600 hover:text-blue-600 transition-colors">Kategorijas</a></li>
              <li><a href="/par-mums" className="text-gray-600 hover:text-blue-600 transition-colors">Par mums</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Juridiskais</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">Privātuma politika</a></li>
              <li><a href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">Lietošanas noteikumi</a></li>
              <li><a href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Kontakti</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-500">
          © 2026 ProMeistars. Visas tiesības aizsargātas.
        </div>
      </div>
    </footer>
  )
}
