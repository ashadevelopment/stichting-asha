"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X, ChartNoAxesGantt } from "lucide-react";
import { useState, useEffect } from "react";

type HeaderProps = {
  className?: string;
};

export function Header({ className = "" }: HeaderProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Function to handle sign-out
  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    signOut({ redirect: true, callbackUrl: '/' }); // Redirect to home page after sign-out
  };

  // Controleren of een link actief is
  const isActive = (path: string) => {
    return pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Sticky header met position: fixed */}
      <style jsx global>{`
        body {
          margin-top: 4rem; /* Adjust this value based on your header height */
        }
      `}</style>
      <header 
        className={`fixed top-0 left-0 right-0 w-full z-[9999] bg-white shadow-md ${className}`}
        style={{ position: 'fixed', top: 0, left: 0, right: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-row items-center justify-between">
          
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="h-12 w-12" />
            <span className="text-2xl font-bold text-[#2E376F]">
              Stichting Asha
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex items-center justify-center w-10 h-10 text-[#2E376F] transition-all duration-300"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <div className="relative w-6 h-6">
              <ChartNoAxesGantt 
                className={`absolute inset-0 transform transition-all duration-300 ease-in-out ${
                  isMenuOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                }`} 
              />
              <X 
                className={`absolute inset-0 transform transition-all duration-300 ease-in-out ${
                  isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'
                }`} 
              />
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center">
            <nav className="flex flex-wrap justify-center gap-6 text-base font-medium">
              <Link 
                href="/" 
                className={`transition-colors duration-300 ${isActive('/') ? 'text-[#E4C67B]' : 'text-[#2E376F]'}`}
              >
                Home
              </Link>
              <Link 
                href="/agenda" 
                className={`transition-colors duration-300 ${isActive('/agenda') ? 'text-[#E4C67B]' : 'text-[#2E376F]'}`}
              >
                Agenda
              </Link>
              <Link 
                href="/projecten" 
                className={`transition-colors duration-300 ${isActive('/projecten') ? 'text-[#E4C67B]' : 'text-[#2E376F]'}`}
              >
                Projecten
              </Link>
              <Link 
                href="/contact" 
                className={`transition-colors duration-300 ${isActive('/contact') ? 'text-[#E4C67B]' : 'text-[#2E376F]'}`}
              >
                Contact
              </Link>
              <Link 
                href="/nieuwsbrief" 
                className={`transition-colors duration-300 ${isActive('/nieuwsbrief') ? 'text-[#E4C67B]' : 'text-[#2E376F]'}`}
              >
                Nieuwsbrief
              </Link>
              <Link 
                href="/fotoboek" 
                className={`transition-colors duration-300 ${isActive('/fotoboek') ? 'text-[#E4C67B]' : 'text-[#2E376F]'}`}
              >
                Fotoboek
              </Link>
            </nav>
          </div>

          {/* Desktop Auth Controls */}
          <div className="hidden md:block font-semibold text-right">
            {status === "loading" ? (
              <span className="text-[#2E376F]">Loading...</span>
            ) : session ? (
              <>
                <Link 
                  href="/beheer/dashboard" 
                  className={`transition-colors duration-300 ${isActive('/beheer/dashboard') ? 'text-[#E4C67B]' : 'text-[#2E376F]'}`}
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="ml-4 text-red-700"
                >
                  Uitloggen <LogOut className="w-5 h-5 inline-block m-2" />
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                className={`transition-colors duration-300 ${isActive('/login') ? 'text-[#E4C67B]' : 'text-[#2E376F]'}`}
              >
                Inloggen
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu (Slide down when open) */}
        <div 
          className={`md:hidden w-full bg-white overflow-hidden transition-all duration-300 ease-in-out mb-4 ${
            isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="flex flex-col px-4 pb-6 space-y-3">
            <Link 
              href="/" 
              className={`transition-colors duration-300 py-2 ${isActive('/') ? 'text-[#E4C67B] font-bold' : 'text-[#2E376F]'}`}
            >
              Home
            </Link>
            <Link 
              href="/agenda" 
              className={`transition-colors duration-300 py-2 ${isActive('/agenda') ? 'text-[#E4C67B] font-bold' : 'text-[#2E376F]'}`}
            >
              Agenda
            </Link>
            <Link 
              href="/projecten" 
              className={`transition-colors duration-300 py-2 ${isActive('/projecten') ? 'text-[#E4C67B] font-bold' : 'text-[#2E376F]'}`}
            >
              Projecten
            </Link>
            <Link 
              href="/contact" 
              className={`transition-colors duration-300 py-2 ${isActive('/contact') ? 'text-[#E4C67B] font-bold' : 'text-[#2E376F]'}`}
            >
              Contact
            </Link>
            <Link 
              href="/nieuwsbrief" 
              className={`transition-colors duration-300 py-2 ${isActive('/nieuwsbrief') ? 'text-[#E4C67B] font-bold' : 'text-[#2E376F]'}`}
            >
              Nieuwsbrief
            </Link>
            <Link 
              href="/fotoboek" 
              className={`transition-colors duration-300 py-2 ${isActive('/fotoboek') ? 'text-[#E4C67B] font-bold' : 'text-[#2E376F]'}`}
            >
              Fotoboek
            </Link>

            {/* Mobile Auth Controls */}
            {status === "loading" ? (
              <span className="text-[#2E376F] py-2 border-t border-gray-200 mt-2">Loading...</span>
            ) : session ? (
              <>
                <Link 
                  href="/beheer/dashboard" 
                  className={`transition-colors duration-300 py-2 border-t border-gray-200 mt-2 ${isActive('/beheer/dashboard') ? 'text-[#E4C67B] font-bold' : 'text-[#2E376F]'}`}
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center text-red-700 py-2 w-full"
                >
                  <span>Uitloggen</span> <LogOut className="w-5 h-5 ml-2" />
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                className={`transition-colors duration-300 block py-2 border-t border-gray-200 mt-2 ${isActive('/login') ? 'text-[#E4C67B] font-bold' : 'text-[#2E376F]'}`}
              >
                Inloggen
              </Link>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}