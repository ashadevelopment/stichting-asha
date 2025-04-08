import Link from 'next/link'
import { ReactNode } from 'react'

export default function BeheerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-100 py-12">
      <div className="flex gap-6 w-full max-w-6xl px-4">
        
        {/* Sidebar */}
        <div className="w-52 bg-white p-4 rounded-xl shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">Menu</h2>
          <nav className="space-y-2 text-sm">
            <Link href="/beheer/dashboard" className="text-blue-600 hover:underline block">
              Dashboard
            </Link>
            <Link href="/beheer/gegevens" className="text-blue-600 hover:underline block">
              Persoonlijke gegevens
            </Link>
            <Link href="/beheer/gebruikers" className="text-blue-600 hover:underline block">
              Gebruikers
            </Link>
            <Link href="/beheer/notities" className="text-blue-600 hover:underline block">
              Notities
            </Link>
            <Link href="/beheer/projecten" className="text-blue-600 hover:underline block">
              Projecten
            </Link>
            <Link href="/beheer/agenda" className="text-blue-600 hover:underline block">
              Agenda
            </Link>
            <Link href="/beheer/contact" className="text-blue-600 hover:underline block">
              Contact
            </Link>
            <Link href="/beheer/vrijwilligers" className="text-blue-600 hover:underline block">
              Vrijwilligers
            </Link>
            <Link href="/beheer/fotoboek" className="text-blue-600 hover:underline block">
              Fotoboek
            </Link>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white p-8 rounded-xl shadow-sm min-h-[400px]">
          {children}
        </div>
      </div>
    </div>
  )
}
