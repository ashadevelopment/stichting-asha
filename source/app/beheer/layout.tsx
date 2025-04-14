'use client'

import Link from 'next/link'
import { ReactNode, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

export default function BeheerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile on initial render and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Set initial state
    checkIfMobile()
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile)
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // Close menu when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setIsMenuOpen(false)
    } else {
      setIsMenuOpen(true)
    }
  }, [pathname, isMobile])

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-24 pb-4 sm:py-6 md:py-12">
      <div className="flex flex-col md:flex-row w-full max-w-[90rem] mx-auto px-4">
        
        {/* Mobile menu button */}
        <div className="md:hidden sticky top-20 z-10 flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm">
          <h1 className="font-semibold text-lg text-gray-700">Admin Dashboard</h1>
          <button 
            onClick={toggleMenu}
            className="text-gray-700 focus:outline-none"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Sidebar */}
        <div className={`
          ${isMenuOpen ? 'block' : 'hidden'} 
          md:block w-full md:w-52 md:flex-shrink-0 bg-white p-4 rounded-xl shadow-sm 
          mb-4 md:mb-0 md:mr-6 z-10 md:z-auto
          ${isMobile ? 'sticky top-32' : ''}
        `}>
          <h2 className="font-semibold text-gray-700 mb-3">Menu</h2>
          <nav className="space-y-2 text-sm">
            {links.map(({ href, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`block py-2 px-3 rounded-md ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-900 font-semibold'
                      : 'text-indigo-800 hover:bg-indigo-50 hover:text-indigo-700'
                  } hover:no-underline transition-colors`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-sm min-h-[400px] overflow-x-auto">
          {children}
        </div>
      </div>
    </div>
  )
}