'use client'

import { useState } from 'react'

export default function HandleidingPage() {
  const [activeSection, setActiveSection] = useState<string>('general')

  const menuItems = [
    { key: 'general', label: 'Algemeen' },
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'users', label: 'Gebruikers' },
    { key: 'notes', label: 'Notities' },
    { key: 'projects', label: 'Projecten' },
    { key: 'calendar', label: 'Agenda' },
    { key: 'contact', label: 'Contact' },
    { key: 'volunteers', label: 'Vrijwilligers' },
    { key: 'photos', label: 'Fotoboek' },
    { key: 'newsletter', label: 'Nieuwsbrief' },
    { key: 'troubleshooting', label: 'Probleemoplossing' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Handleiding</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="col-span-1 border-r border-gray-200 pr-4">
            <nav className="space-y-1">
                {menuItems.map(({ key, label }) => (
                <button
                    key={key}
                    onClick={() => setActiveSection(key)}
                    className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition 
                    ${activeSection === key
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-100'}`}
                >
                    {label}
                </button>
                ))}
            </nav>
            </aside>

        {/* Content */}
        <main className="ccol-span-1 md:col-span-3 bg-white rounded-xl p-6">
          {activeSection === 'general' && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Algemene handleiding</h2>
              <p className="mb-4 text-gray-700">
                Welkom bij de beheeromgeving van onze website. Deze handleiding helpt je om alle functies 
                van het beheersysteem effectief te gebruiken. Gebruik het menu aan de linkerkant om naar 
                de specifieke onderdelen te navigeren.
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Inloggen</h3>
                  <p className="text-gray-700">
                    Je kunt inloggen met je e-mailadres en wachtwoord. Als je je wachtwoord bent vergeten, 
                    kun je op de "Wachtwoord vergeten" link klikken op het inlogscherm.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800">Navigatie</h3>
                  <p className="text-gray-700">
                    De navigatiemenu aan de linkerkant geeft toegang tot verschillende secties. Afhankelijk van je 
                    gebruikersrol heb je toegang tot verschillende onderdelen.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800">Gebruikersrollen</h3>
                  <ul className="[list-style-type:circle] pl-5 text-gray-700 space-y-1">
                    <li><strong className='text-red-300'>Beheerder:</strong> Heeft volledige toegang tot alle functies.</li>
                    <li><strong className='text-blue-300'>Developer:</strong> Kan de meeste functies gebruiken, maar heeft geen toegang tot gebruikersbeheer.</li>
                    <li><strong className='text-green-300'>Vrijwilliger:</strong> Heeft beperkte toegang tot dashboard, persoonlijke gegevens en agenda.</li>
                    <li><strong className='text-yellow-300'>Stagiair:</strong> Heeft alleen toegang tot het dashboard en persoonlijke gegevens.</li>
                    <li><strong className='text-gray-300'>User:</strong> Heeft alleen toegang tot het dashboard en persoonlijke gegevens.</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'dashboard' && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard</h2>
              <p className="mb-4 text-gray-700">
                Het dashboard geeft een overzicht van recente activiteiten en belangrijke informatie. 
                Je vindt hier snelkoppelingen naar verschillende secties en een activiteiten-feed.
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Recente activiteiten</h3>
                  <p className="text-gray-700">
                    Dit gedeelte toont de meest recente activiteiten binnen het beheersysteem, zoals nieuwe 
                    notities, bijgewerkte gebruikers en nieuwe agenda-items.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800">Snelkoppelingen</h3>
                  <p className="text-gray-700">
                    Gebruik de snelkoppelingen voor toegang tot de meest gebruikte functies zoals gebruikersbeheer, 
                    website en statistieken.
                  </p>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'users' && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Gebruikersbeheer</h2>
              <p className="mb-4 text-gray-700">
                In deze sectie kun je gebruikers toevoegen, bewerken en verwijderen. Je kunt ook 
                rollen toewijzen en gebruikersgegevens beheren.
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Nieuwe gebruiker toevoegen</h3>
                  <p className="text-gray-700">
                    Klik op de knop "Nieuwe gebruiker" om een nieuw gebruikersaccount aan te maken. 
                    Vul alle vereiste velden in en selecteer de juiste rol. Wanneer je een gebruiker aanmaakt, ontvangt de betreffende persoon een e-mail om het account te activeren. Na activatie verschijnt de gebruiker in de gebruikerslijst. De inloggegevens, inclusief het door jou ingestelde wachtwoord, worden per e-mail verzonden. De gebruiker wordt verzocht dit wachtwoord bij de eerste login zelf te wijzigen.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800">Gebruiker bewerken</h3>
                  <p className="text-gray-700">
                    Klik op een gebruiker in de lijst om de details te bekijken of te bewerken. Je kunt 
                    persoonlijke gegevens wijzigen en rollen aanpassen.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800">Gebruiker verwijderen</h3>
                  <p className="text-gray-700">
                    Om een gebruiker te verwijderen, ga naar de gebruikersdetails en klik op de knop "Verwijderen". 
                    Bevestig de actie wanneer hierom wordt gevraagd. <span className='text-red-500'>Let op: verwijderde gebruikers kunnen niet worden hersteld.</span>
                  </p>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'troubleshooting' && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Probleemoplossing</h2>
              <p className="mb-6 text-gray-700">
                Hier vind je oplossingen voor veelvoorkomende problemen met de website en het beheersysteem.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">Website problemen</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>
                      <strong>De website laadt langzaam:</strong> Controleer de afbeeldingsgrootte op de homepage. 
                      Optimaliseer afbeeldingen voor een snellere laadtijd.
                    </li>
                    <li>
                      <strong>Agenda wordt niet weergegeven:</strong> Wis de browsercache of probeer een andere browser.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800">Aanmelden en toegang</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Kan niet inloggen:</strong> Controleer je inloggegevens en gebruik "Wachtwoord vergeten" indien nodig.</li>
                    <li><strong>Geen toegang tot functies:</strong> Rechten zijn rolgebaseerd. Neem contact op met de beheerder.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800">Technische ondersteuning</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p><strong>Email:</strong> support@example.com</p>
                    <p><strong>Telefoon:</strong> 070-1234567</p>
                    <p className="italic text-sm mt-1">Werkdagen: 09:00 – 17:00</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Placeholder content */}
          {(activeSection !== 'general' &&
            activeSection !== 'dashboard' &&
            activeSection !== 'users' &&
            activeSection !== 'troubleshooting') && (
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {menuItems.find(item => item.key === activeSection)?.label}
              </h2>
              <p className="text-gray-700 mb-4">
                Deze sectie bevat informatie over de {menuItems.find(item => item.key === activeSection)?.label.toLowerCase()} module.
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <p className="text-yellow-800">
                  Deze sectie van de handleiding is nog in ontwikkeling. Kom binnenkort terug voor updates.
                </p>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
