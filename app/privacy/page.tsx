export const metadata = {
  title: 'Privātuma politika | ProMeistars',
  description: 'Privātuma politika latviski un krieviski',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 space-y-16">

      {/* LATVISKI */}
      <section className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Privātuma politika</h1>
        <p className="text-sm text-gray-500">Spēkā no: 2026. gada 1. janvāra</p>

        <div className="space-y-4 text-gray-700">
          <div>
            <h2 className="text-xl font-semibold mb-2">1. Kas vāc datus</h2>
            <p>
              Datus vāc <strong>ProMeistars</strong>, ko pārvalda Gints Celmiņš
              (e-pasts: gints.celmins@gmail.com). Platforma savieno meistarpsersons ar
              potenciālajiem klientiem Latvijā.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">2. Kādi dati tiek vākti</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Vārds, uzvārds</li>
              <li>Tālruņa numurs</li>
              <li>Specialitāte un profesionālā pieredze</li>
              <li>Darba reģions un darba laiks</li>
              <li>E-pasta adrese (reģistrētiem meistariem)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">3. Kāpēc dati tiek vākti</h2>
            <p>
              Dati tiek apstrādāti, lai piedāvātu pakalpojumus — savieno klientus ar
              meistariem, nodrošina rezervēšanu un komunikāciju (SMS/WhatsApp).
              GDPR juridiskais pamats: <strong>leģitīmās intereses</strong> (B2B kontakts).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">4. Cik ilgi dati tiek glabāti</h2>
            <p>
              Dati tiek glabāti <strong>līdz 2 gadiem</strong> bez aktivitātes, vai
              ilgāk — ja pastāv aktīva sadarbība. Pēc pieprasījuma dati tiek
              anonimizēti 30 dienu laikā.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">5. Jūsu tiesības</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Piekļuve</strong> — jūs varat pieprasīt, kādi dati par jums glabājas</li>
              <li><strong>Labošana</strong> — neprecīzu datu labošana</li>
              <li><strong>Dzēšana</strong> — datu anonimizācija pēc pieprasījuma</li>
              <li><strong>Iebildums</strong> — pret apstrādi leģitīmo interešu pamata</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">6. Kur dati tiek glabāti</h2>
            <p>
              Visi dati tiek glabāti <strong>Supabase (ES reģions, Frankfurt)</strong>.
              Dati netiek nodoti trešajām pusēm, izņemot Twilio (SMS/WhatsApp ziņojumi).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">7. Kontakts</h2>
            <p>
              Datu dzēšanas vai labošanas pieprasījumiem rakstiet:{' '}
              <a href="mailto:gints.celmins@gmail.com" className="text-blue-600 underline">
                gints.celmins@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>

      <hr className="border-gray-200" />

      {/* KRIEVISKI */}
      <section className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Политика конфиденциальности</h1>
        <p className="text-sm text-gray-500">Действует с: 1 января 2026 года</p>

        <div className="space-y-4 text-gray-700">
          <div>
            <h2 className="text-xl font-semibold mb-2">1. Кто собирает данные</h2>
            <p>
              Данные собирает <strong>ProMeistars</strong>, которым управляет Гинтс Целминьш
              (e-mail: gints.celmins@gmail.com). Платформа соединяет мастеров с
              потенциальными клиентами в Латвии.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">2. Какие данные собираются</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Имя, фамилия</li>
              <li>Номер телефона</li>
              <li>Специальность и профессиональный опыт</li>
              <li>Регион работы и рабочее время</li>
              <li>Адрес электронной почты (для зарегистрированных мастеров)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">3. Зачем собираются данные</h2>
            <p>
              Данные обрабатываются для предоставления услуг — соединения клиентов с
              мастерами, обеспечения бронирования и коммуникации (SMS/WhatsApp).
              Правовое основание по GDPR: <strong>законные интересы</strong> (B2B контакт).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">4. Как долго хранятся данные</h2>
            <p>
              Данные хранятся <strong>до 2 лет</strong> без активности, или дольше —
              при наличии активного сотрудничества. По запросу данные анонимизируются
              в течение 30 дней.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">5. Ваши права</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Доступ</strong> — вы можете запросить, какие данные о вас хранятся</li>
              <li><strong>Исправление</strong> — исправление неточных данных</li>
              <li><strong>Удаление</strong> — анонимизация данных по запросу</li>
              <li><strong>Возражение</strong> — против обработки на основании законных интересов</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">6. Где хранятся данные</h2>
            <p>
              Все данные хранятся в <strong>Supabase (регион ЕС, Франкфурт)</strong>.
              Данные не передаются третьим лицам, за исключением Twilio (SMS/WhatsApp сообщения).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">7. Контакт</h2>
            <p>
              Для запросов на удаление или исправление данных пишите:{' '}
              <a href="mailto:gints.celmins@gmail.com" className="text-blue-600 underline">
                gints.celmins@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>

    </main>
  )
}
