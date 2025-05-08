'use client'

import Link from 'next/link'
import { ReactNode, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

// Define user roles from the User model
type UserRole = 'beheerder' | 'developer' | 'vrijwilliger' | 'stagiair' | 'user'

// Define the structure for route permissions
type RoutePermissions = {
  [key in UserRole]: string[]
}

export default function BeheerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  // Get the role from session or fallback to 'user'
  const [userRole, setUserRole] = useState<UserRole>((session?.user?.role as UserRole) || 'user')

  // Define which routes each role can access
  const routePermissions: RoutePermissions = {
    beheerder: [
      '/beheer/dashboard',
      '/beheer/gegevens',
      '/beheer/gebruikers',
      '/beheer/notities',
      '/beheer/projecten',
      '/beheer/agenda',
      '/beheer/contact',
      '/beheer/vrijwilligers',
      '/beheer/fotoboek',
      '/beheer/nieuwsbrief',
    ],
    developer: [
      '/beheer/dashboard',
      '/beheer/gegevens',
      '/beheer/notities',
      '/beheer/projecten',
      '/beheer/agenda',
      '/beheer/contact',
      '/beheer/fotoboek',
      '/beheer/nieuwsbrief',
    ],
    vrijwilliger: [
      '/beheer/dashboard',
      '/beheer/gegevens',
      '/beheer/agenda',
    ],
    stagiair: [
      '/beheer/dashboard',
      '/beheer/gegevens',
    ],
    user: [
      '/beheer/dashboard',
      '/beheer/gegevens',
    ],
  }

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

  // Update user role when session changes
  useEffect(() => {
    if (session?.user?.role) {
      setUserRole(session.user.role as UserRole)
    }
  }, [session])
  
  // Effect to check if user has access to current route
  useEffect(() => {
    // Make sure we have a valid role and pathname
    if (!userRole || !pathname) return
    
    // Get the allowed routes for current user role
    const allowedRoutes = routePermissions[userRole] || routePermissions.user
    
    // Check if current pathname is allowed
    if (pathname && !allowedRoutes.includes(pathname)) {
      // If not allowed, redirect to dashboard or another safe route
      router.push('/beheer/dashboard')
    }
  }, [pathname, userRole, router])

  // Main navigation links
  const allLinks = [
    { href: '/beheer/dashboard', label: 'Dashboard' },
    { href: '/beheer/gegevens', label: 'Persoonlijke gegevens' },
    { href: '/beheer/gebruikers', label: 'Gebruikers' },
    { href: '/beheer/notities', label: 'Notities' },
    { href: '/beheer/projecten', label: 'Projecten' },
    { href: '/beheer/agenda', label: 'Agenda' },
    { href: '/beheer/contact', label: 'Contact' },
    { href: '/beheer/vrijwilligers', label: 'Vrijwilligers' },
    { href: '/beheer/fotoboek', label: 'Fotoboek' },
    { href: '/beheer/nieuwsbrief', label: 'Nieuwsbrief' },
  ]

  // Filter links based on user role
  const authorizedLinks = allLinks.filter(link => 
    routePermissions[userRole].includes(link.href)
  )

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // For testing purposes - allows changing the role to see different menus
  const changeRole = (role: UserRole) => {
    setUserRole(role)
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20 pb-4 sm:py-6 md:py-12 overflow-x-hidden relative">
      <div className="flex flex-col md:flex-row w-full max-w-[90rem] mx-auto px-4">
        
        {/* Mobile menu button */}
        <button 
              onClick={toggleMenu}
              className="text-gray-700 focus:outline-none"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
          <div className="md:hidden sticky top-1 z-10 flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm">
            <h1 className="font-semibold text-lg text-gray-700">Dashboard Menu</h1>
              <span className="text-xl">{isMenuOpen ? '▼' : '◄'}</span>
          </div>
        </button>
        
        {/* Sidebar */}
        <div className={`
          ${isMenuOpen ? 'block' : 'hidden'} 
          md:block w-full md:w-52 md:flex-shrink-0 bg-white p-4 rounded-xl shadow-sm 
          mb-4 md:mb-0 md:mr-6
          ${isMobile ? '' : 'sticky top-18 h-fit self-start'}
        `}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-gray-700">Menu</h2>
          </div>
          
          <nav className="space-y-2 text-sm">
            {authorizedLinks.map(({ href, label }) => {
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
        <div className="flex-1 bg-white p-4 sm:p-6 md:p-8 z-18 rounded-xl shadow-sm min-h-[400px] overflow-x-auto">
          {children}
        </div>
      </div>
    </div>
  )
}