'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, X, ChevronRight } from 'lucide-react'

export default function HandleidingPage() {
  const [activeSection, setActiveSection] = useState('general')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  const handleSectionChange = (key: string)  => {
    setActiveSection(key)
    // Close sidebar on mobile after selection with a small delay
    // to allow the user to see the selection feedback
    setTimeout(() => {
      setSidebarOpen(false)
    }, 300)
  }

  // Handle content animation on section change
  useEffect(() => {
    if (contentRef.current) {
      // First set initial state
      contentRef.current.style.opacity = '0'
      contentRef.current.style.transform = 'translateY(20px)'
      
      // Then animate in
      const animation = {
        opacity: [0, 1],
        transform: ['translateY(20px)', 'translateY(0px)']
      }
      
      contentRef.current.animate(animation, {
        duration: 600,
        easing: 'ease-out',
        fill: 'forwards'
      })
    }
  }, [activeSection])

  // Handle click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
        const target = event.target as Node;

      if (
        sidebarOpen && 
        sidebarRef.current && 
        toggleButtonRef.current &&
        !sidebarRef.current.contains(target) &&
        !toggleButtonRef.current.contains(target)
      ) {
        setSidebarOpen(false)
      }
    }

    // Use mousedown and touchstart to catch all types of clicks
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [sidebarOpen])

  // Add body scroll lock when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  // Function to render the content section based on active section
  const renderContent = () => {
    switch(activeSection) {
      case 'general':
        return (
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Algemene handleiding</h2>
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
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li><strong className="text-red-300">Beheerder:</strong> Heeft volledige toegang tot alle functies.</li>
                  <li><strong className="text-blue-300">Developer:</strong> Kan de meeste functies gebruiken, maar heeft geen toegang tot gebruikersbeheer.</li>
                  <li><strong className="text-green-300">Vrijwilliger:</strong> Heeft beperkte toegang tot dashboard, persoonlijke gegevens en agenda.</li>
                  <li><strong className="text-yellow-300">Stagiair:</strong> Heeft alleen toegang tot het dashboard en persoonlijke gegevens.</li>
                  <li><strong className="text-gray-300">User:</strong> Heeft alleen toegang tot het dashboard en persoonlijke gegevens.</li>
                </ul>
              </div>
            </div>
          </section>
        );
      
      case 'dashboard':
        return (
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Dashboard</h2>
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
        );

      case 'users':
        return (
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Gebruikersbeheer</h2>
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
                  Bevestig de actie wanneer hierom wordt gevraagd. <span className="text-red-500">Let op: verwijderde gebruikers kunnen niet worden hersteld.</span>
                </p>
              </div>
            </div>
          </section>
        );

      case 'notes':
        return (
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Notities</h2>
            <p className="mb-4 text-gray-700">
              De notities module stelt je in staat om belangrijke mededelingen aan te maken die worden weergegeven op de homepage van de website.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800">Nieuwe notitie toevoegen</h3>
                <p className="text-gray-700">
                  Om een nieuwe notitie toe te voegen, vul je het formulier in met de volgende velden:
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-1 mt-2">
                  <li><strong>Titel:</strong> Een korte, duidelijke titel voor de notitie.</li>
                  <li><strong>Bericht:</strong> De inhoud van de notitie die je wilt communiceren.</li>
                  <li><strong>Verloopdatum:</strong> Selecteer hoe lang de notitie actief moet blijven (1 dag tot 1 maand).</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  Klik op "Verstuur notitie" om de notitie op te slaan. De notitie wordt automatisch geactiveerd en zal zichtbaar zijn op de homepage tot de verloopdatum is bereikt.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800">Notities beheren</h3>
                <p className="text-gray-700">
                  In het notities overzicht zie je alle bestaande notities met de volgende informatie:
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-1 mt-2">
                  <li>Titel en inhoud van de notitie</li>
                  <li>Auteur en aanmaakdatum</li>
                  <li>Verloopdatum</li>
                  <li>Status (actief of inactief)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800">Actieve notitie</h3>
                <p className="text-gray-700">
                  Er kan altijd slechts één actieve notitie zijn die op de homepage wordt weergegeven. Notities die actief zijn worden in het overzicht gemarkeerd met een gele achtergrond.
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-1 mt-2">
                  <li>Om een inactieve notitie te activeren, klik op het "verstuur" icoon naast de notitie.</li>
                  <li>Wanneer je een nieuwe notitie activeert, wordt de huidige actieve notitie automatisch gedeactiveerd.</li>
                  <li>Om een notitie te verwijderen, klik op het prullenbak icoon naast de notitie. <span className="text-red-500">Let op: verwijderde notities kunnen niet worden hersteld.</span></li>
                </ul>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                <p className="text-blue-800">
                  <strong>Tip:</strong> Houd notities kort en bondig voor een betere leesbaarheid op de homepage.
                </p>
              </div>
            </div>
          </section>
        );

      case 'projects':
        return (
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Projecten</h2>
            <p className="mb-4 text-gray-700">
              De projecten module stelt je in staat om projecten toe te voegen en te beheren die op de website worden weergegeven. 
              Deze functie is alleen beschikbaar voor gebruikers met de rol 'beheerder' of 'developer'.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800">Nieuw project toevoegen</h3>
                <p className="text-gray-700">
                  Om een nieuw project toe te voegen, vul je het formulier in met de volgende velden:
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-1 mt-2">
                  <li><strong>Projectnaam:</strong> Een duidelijke naam voor het project.</li>
                  <li><strong>Beschrijving:</strong> Een korte beschrijving van het project.</li>
                  <li><strong>Uitgebreide Beschrijving:</strong> Optioneel veld voor meer details over het project.</li>
                  <li><strong>Tags:</strong> Trefwoorden die bij het project horen, gescheiden door komma's.</li>
                  <li><strong>Projectdatum:</strong> De datum waarop het project plaatsvindt of heeft plaatsgevonden.</li>
                  <li><strong>Afbeelding:</strong> Optioneel een afbeelding voor het project.</li>
                  <li><strong>Document:</strong> Optioneel een document dat bij het project hoort (PDF, Word, Excel).</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  Klik op "Project Toevoegen" om het project op te slaan. Het nieuwe project zal worden weergegeven in de lijst met bestaande projecten.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800">Projecten beheren</h3>
                <p className="text-gray-700">
                  In het projecten overzicht zie je alle bestaande projecten met de volgende functies:
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-1 mt-2">
                  <li><strong>Bewerken:</strong> Klik op het bewerk-icoon (document) om een bestaand project aan te passen.</li>
                  <li><strong>Verwijderen:</strong> Klik op het prullenbak-icoon om een project te verwijderen. Er zal een bevestigingsdialoog verschijnen.</li>
                  <li><strong>Document downloaden:</strong> Als er een document is toegevoegd aan het project, kun je dit downloaden via de "Download Document" link.</li>
                </ul>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                <p className="text-blue-800">
                  <strong>Tips voor projecten:</strong>
                </p>
                <ul className="list-disc pl-5 text-blue-800 space-y-1 mt-1">
                  <li>Gebruik duidelijke, beschrijvende projectnamen.</li>
                  <li>Optimaliseer afbeeldingen voordat je ze uploadt voor betere laadtijden.</li>
                  <li>Gebruik relevante tags om projecten beter vindbaar te maken.</li>
                </ul>
              </div>
            </div>
          </section>
        );

      case 'calendar':
        return (
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Agenda</h2>
            <p className="mb-4 text-gray-700">
              In deze sectie kun je evenementen toevoegen, bewerken en verwijderen. De agenda wordt getoond op de website en is zichtbaar voor alle bezoekers.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800">Nieuw evenement toevoegen</h3>
                <p className="text-gray-700">
                  Klik op de knop "Nieuw evenement toevoegen" bovenaan de pagina. Vul het formulier in met de volgende gegevens:
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-1 mt-2">
                  <li><strong>Titel:</strong> De naam van het evenement (verplicht).</li>
                  <li><strong>Beschrijving:</strong> Een korte omschrijving van het evenement (verplicht).</li>
                  <li><strong>Datum:</strong> De datum waarop het evenement plaatsvindt (verplicht).</li>
                  <li><strong>Tijd:</strong> Het tijdstip waarop het evenement begint, in 15-minuten intervallen (verplicht).</li>
                  <li><strong>Locatie:</strong> De plaats waar het evenement wordt gehouden (verplicht).</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800">Evenement bewerken</h3>
                <p className="text-gray-700">
                  Klik op het bewerk-icoon (potlood) naast het evenement dat je wilt wijzigen. Het formulier bovenaan de pagina wordt gevuld met de bestaande gegevens. Pas de gegevens aan en klik op "Bijwerken" om de wijzigingen op te slaan.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800">Evenement verwijderen</h3>
                <p className="text-gray-700">
                  Klik op het prullenbak-icoon naast het evenement dat je wilt verwijderen. Er verschijnt een bevestigingsdialoog. Klik op "Bevestigen" om het evenement permanent te verwijderen of op "Annuleren" om terug te keren zonder het evenement te verwijderen.
                </p>
                <p className="text-red-500 mt-1">Let op: verwijderde evenementen kunnen niet worden hersteld.</p>
              </div>
            </div>
          </section>
        );

      case 'contact':
        return (
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
            <p className="mb-4 text-gray-700">
              In de contactmodule kunt u beheren welke personen als contactpersonen worden weergegeven op de openbare contactpagina van de website.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800">Huidige contactpersonen</h3>
                <p className="text-gray-700">
                  Bovenaan de pagina ziet u de huidige contactpersonen die op de website worden weergegeven. Voor elke persoon wordt 
                  de profielfoto, naam, functie, telefoonnummer en e-mailadres getoond.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800">Contactpersonen selecteren</h3>
                <p className="text-gray-700">
                  In het onderste gedeelte van de pagina kunt u uit de lijst van beheerders maximaal twee personen selecteren die als contactpersonen worden weergegeven:
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-1 mt-2">
                  <li>Klik op een persoon om deze te selecteren (blauwe markering).</li>
                  <li>Klik nogmaals op een geselecteerde persoon om de selectie ongedaan te maken.</li>
                  <li>Er kunnen maximaal 2 contactpersonen worden geselecteerd.</li>
                  <li>Klik op "Contactpersonen opslaan" om de wijzigingen door te voeren.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800">Belangrijke informatie</h3>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Alleen gebruikers met de rol "beheerder" kunnen als contactpersoon worden geselecteerd.</li>
                  <li>De geselecteerde contactpersonen zijn direct zichtbaar op de contactpagina van de website.</li>
                  <li>Zorg ervoor dat de contactpersonen up-to-date profielfoto's, telefoonnummers en e-mailadressen hebben.</li>
                </ul>
              </div>
            </div>
          </section>
        );

      case 'volunteers':
        return (
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Vrijwilligers</h2>
            <p className="mb-4 text-gray-700">
              De vrijwilligersmodule stelt u in staat om aanmeldingen van potentiële vrijwilligers te beheren, goed te keuren of af te wijzen.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800">Openstaande aanmeldingen</h3>
                <p className="text-gray-700">
                  Dit deel van de pagina toont alle vrijwilligersaanmeldingen die nog beoordeeld moeten worden. Voor elke aanmelding ziet u:
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-1 mt-2">
                  <li>Persoonlijke gegevens (naam, e-mail, telefoonnummer)</li>
                  <li>Het bericht dat de vrijwilliger heeft achtergelaten</li>
                  <li>De aanmelddatum</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  Per aanmelding kunt u de volgende acties uitvoeren:
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-1 mt-2">
                  <li><strong className='text-green-600'>Goedkeuren:</strong> Accepteert de vrijwilliger en verplaatst deze naar Actieve Vrijwilligers.</li>
                  <li><strong className='text-red-600'>Afkeuren:</strong> Wijst de vrijwilliger af en verplaatst deze naar Afgewezen Aanmeldingen.</li>
                  <li><strong className='text-blue-600'>Bekijk CV/Motivatie:</strong> Downloadt en opent het betreffende document.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800">Actieve vrijwilligers</h3>
                <p className="text-gray-700">
                  Hier ziet u alle goedgekeurde vrijwilligers. Per vrijwilliger kunt u:
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-1 mt-2">
                  <li>Hun CV en motivatiebrief bekijken</li>
                  <li>De vrijwilliger verwijderen uit het systeem (met bevestigingsdialoog)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800">Afgewezen aanmeldingen</h3>
                <p className="text-gray-700">
                  In dit gedeelte staan alle vrijwilligers die zijn afgewezen. Deze sectie is alleen zichtbaar als er afgewezen vrijwilligers zijn.
                  U kunt afgewezen vrijwilligers permanent verwijderen uit het systeem.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800">Aandachtspunten</h3>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Het verwijderen van vrijwilligers is permanent en kan niet ongedaan worden gemaakt.</li>
                  <li>Wanneer een vrijwilliger wordt goedgekeurd, wordt deze niet automatisch toegevoegd als gebruiker in het systeem.</li>
                  <li>De vrijwilligersmodule is alleen bedoeld voor het beheren van aanmeldingen, niet voor het plannen van activiteiten.</li>
                </ul>
              </div>
            </div>
          </section>
        );

      case 'photos':
        return (
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Fotoboek</h2>
            <p className="mb-4 text-gray-700">
              In het Fotoboek kun je foto's en video's uploaden en beheren die op de website worden getoond. Deze media zijn belangrijk voor het visueel weergeven van activiteiten en projecten.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800">Media toevoegen</h3>
                <p className="text-gray-700 mb-2">
                  Je kunt eenvoudig nieuwe foto's en video's toevoegen aan het fotoboek door het formulier in te vullen.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li>Klik op "Nieuwe media toevoegen" als het formulier niet zichtbaar is.</li>
                  <li>Vul een <strong>titel</strong> in voor je media (verplicht).</li>
                  <li>Voeg optioneel een <strong>beschrijving</strong> toe.</li>
                  <li>Klik op "Kies een foto of video" om een bestand te selecteren.</li>
                  <li>Bekijk het voorbeeld om te controleren of je de juiste media hebt geselecteerd.</li>
                  <li>Klik op "Opslaan" om de media te uploaden.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800">Bestandslimieten en -formaten</h3>
                <p className="text-gray-700 mb-2">
                  Let op de volgende bestandslimieten en ondersteunde formaten:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-1">
                  <li><strong>Afbeeldingen:</strong> maximaal 5MB in JPEG, PNG, GIF of WebP formaat.</li>
                  <li><strong>Video's:</strong> maximaal 50MB in MP4, WebM of Ogg formaat.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800">Tips voor optimaal gebruik</h3>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md mt-2">
                  <ul className="list-disc pl-6 text-blue-800 space-y-1">
                    <li>Gebruik duidelijke, beschrijvende titels voor je media.</li>
                    <li>Voeg een beschrijving toe met relevante details.</li>
                    <li>Optimaliseer afbeeldingen vóór het uploaden.</li>
                    <li>Voor video's, overweeg kortere clips (30 seconden tot 2 minuten).</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        );
      
      case 'newsletter':
        return (
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Nieuwsbrief</h2>
            <p className="mb-4 text-gray-700">
              De nieuwsbrief module stelt je in staat om interessante artikelen en video's te delen met de website bezoekers. 
              Deze functie is alleen beschikbaar voor gebruikers met de rol 'beheerder' of 'developer'.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800">Nieuwe post toevoegen</h3>
                <p className="text-gray-700">
                  Om een nieuwe nieuwsbrief post toe te voegen:
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-1 mt-2">
                  <li>Klik op de knop "Nieuwe Post" rechtsboven op de pagina.</li>
                  <li><strong>Link/URL:</strong> Voer de URL in van het artikel of de video die je wilt delen. Voor YouTube video's wordt automatisch een preview gegenereerd.</li>
                  <li><strong>Titel:</strong> Een duidelijke titel voor de post (wordt automatisch ingevuld bij link preview).</li>
                  <li><strong>Type:</strong> Kies tussen 'Artikel' of 'Video' afhankelijk van de content.</li>
                  <li><strong>Beschrijving:</strong> Een korte samenvatting van de content (verplicht).</li>
                  <li><strong>Content:</strong> Optioneel veld voor aanvullende informatie of commentaar.</li>
                  <li><strong>Video URL:</strong> Voor video posts, de embed URL (wordt automatisch ingevuld voor YouTube).</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  Klik op "Opslaan" om de post toe te voegen aan de nieuwsbrief sectie van de website.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800">Link Preview Functie</h3>
                <p className="text-gray-700">
                  Wanneer je een URL invoert, wordt automatisch een preview gegenereerd:
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-1 mt-2">
                  <li><strong>YouTube video's:</strong> Worden automatisch gedetecteerd en als video type ingesteld.</li>
                  <li><strong>Andere websites:</strong> Er wordt geprobeerd titel, beschrijving en afbeelding op te halen.</li>
                  <li>De preview helpt bij het controleren of je de juiste content deelt.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800">Posts beheren</h3>
                <p className="text-gray-700">
                  In het overzicht van bestaande posts kun je:
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-1 mt-2">
                  <li><strong>Bewerken:</strong> Klik op het bewerk-icoon (potlood) om een bestaande post aan te passen.</li>
                  <li><strong>Verwijderen:</strong> Klik op het prullenbak-icoon om een post te verwijderen. Er wordt om bevestiging gevraagd.</li>
                  <li><strong>Link openen:</strong> Klik op de blauwe link onder elke post om naar de originele bron te gaan.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800">Post Types</h3>
                <p className="text-gray-700">
                  Er zijn twee hoofdtypes posts:
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-1 mt-2">
                  <li><strong>Artikel:</strong> Voor nieuwsartikelen, blogposts en andere tekstgebaseerde content.</li>
                  <li><strong>Video:</strong> Voor YouTube video's en andere video content met embedded speler.</li>
                </ul>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                <p className="text-blue-800">
                  <strong>Tips voor nieuwsbrief posts:</strong>
                </p>
                <ul className="list-disc pl-5 text-blue-800 space-y-1 mt-1">
                  <li>Gebruik relevante en interessante content die past bij jullie organisatie.</li>
                  <li>Schrijf duidelijke, beknopte beschrijvingen.</li>
                  <li>Voor YouTube video's kun je de gewone YouTube URL gebruiken - deze wordt automatisch omgezet.</li>
                  <li>Controleer altijd de preview voordat je een post opslaat.</li>
                </ul>
              </div>
            </div>
          </section>
        );

      case 'troubleshooting':
        return (
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Probleemoplossing</h2>
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
                    <li><strong>Geen toegang tot functies:</strong> Rechten zijn rolgebaseerd. Neem contact op met de Developers</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-5">Technische ondersteuning</h3>
                  <div className="bg-blue-100 p-4 rounded-lg border border-blue-300">
                    <p><strong>Email:</strong> ectn033@gmail.com</p>
                    <p><strong>Telefoon:</strong>06 38 41 51 73</p>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-lg border border-blue-300 mt-3">
                    <p><strong>Email:</strong> support@example.com</p>
                    <p><strong>Telefoon:</strong> 070-1234567</p>
                  </div>
                </div>
              </div>
              </section>
        );

        default:
            return (
                <section>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">Sectie niet gevonden</h2>
                <p className="text-gray-700">Deze sectie is momenteel niet beschikbaar.</p>
                </section>
            )
  }
}

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-4 md:py-8">
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Handleiding</h1>

        {/* Mobile menu toggle */}
        <button
            ref={toggleButtonRef}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-md bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Sluit menu" : "Open menu"}
            aria-expanded={sidebarOpen}
        >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Mobile overlay */}
        {sidebarOpen && (
            <div className="fixed inset-0 z-40 bg-black bg-opacity-40 md:hidden" aria-hidden="true" />
        )}

        {/* Sidebar */}
        <aside
            ref={sidebarRef}
            className={`fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 md:static md:translate-x-0 md:block md:shadow-none 
            ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
        >
            <div className="flex flex-col h-full p-5 md:p-0">
            {/* Close button for mobile */}
            <div className="flex justify-between items-center mb-6 md:hidden mt-24">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                className="p-2 text-gray-500 hover:text-gray-700"
                onClick={() => setSidebarOpen(false)}
                aria-label="Sluit menu"
                >
                <X size={20} />
                </button>
            </div>

            <div className="overflow-y-auto flex-grow md:sticky md:top-4">
                <nav className="space-y-1">
                {menuItems.map(({ key, label }) => (
                    <button
                    key={key}
                    onClick={() => handleSectionChange(key)}
                    className={`flex w-full items-center text-left px-3 py-2 rounded-md text-sm font-medium transition ${
                        activeSection === key
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    >
                    <span className="flex-1">{label}</span>
                    {activeSection === key && <ChevronRight size={16} className="text-indigo-600" />}
                    </button>
                ))}
                </nav>
            </div>
            </div>
        </aside>

        {/* Main content */}
        <main className="col-span-1 md:col-span-3 bg-white rounded-xl p-5 md:p-6">
            <div ref={contentRef} className="prose max-w-none">
            {renderContent()}
            </div>
        </main>
        </div>
    </div>
    );
}