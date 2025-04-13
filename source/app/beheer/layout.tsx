'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export default function BeheerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const links = [
    { href: '/beheer/dashboard', label: 'Dashboard' },
    { href: '/beheer/gegevens', label: 'Persoonlijke gegevens' },
    { href: '/beheer/gebruikers', label: 'Gebruikers' },
    { href: '/beheer/notities', label: 'Notities' },
    { href: '/beheer/projecten', label: 'Projecten' },
    { href: '/beheer/agenda', label: 'Agenda' },
    { href: '/beheer/contact', label: 'Contact' },
    { href: '/beheer/vrijwilligers', label: 'Vrijwilligers' },
    { href: '/beheer/fotoboek', label: 'Fotoboek' },
  ]

  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-100 py-12">
      <div className="flex gap-10 w-full max-w-[90rem] px-4">
        
        {/* Sidebar */}
        <div className="w-52 bg-white p-4 rounded-xl shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">Menu</h2>
          <nav className="space-y-2 text-sm">
            {links.map(({ href, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`block ${
                    isActive
                      ? 'text-indigo-900 font-semibold'
                      : 'text-indigo-800 hover:text-indigo-700'
                  } hover:no-underline`}
                >
                  {label}
                </Link>
              )
            })}
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
