"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";


type HeaderProps = {
  className?: string;
};

export function Header({ className = "" }: HeaderProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Controleren of een link actief is
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      {/* Spacer div met dezelfde hoogte als de navbar om de content op de juiste plek te houden */}
      <div className="h-[140px] md:h-[80px]"></div>
      
      {/* Sticky header met position: fixed */}
      <header 
        className={`fixed top-0 left-0 right-0 w-full z-[9999] bg-white shadow-md ${className}`}
        style={{ position: 'fixed', top: 0, left: 0, right: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" className="h-12 w-12" />
            <span className="text-2xl font-bold text-[#2E376F]">
              Stichting Asha
            </span>
          </div>

          {/* Center: Nav Menu */}
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
              href="/fotoboek" 
              className={`transition-colors duration-300 ${isActive('/fotoboek') ? 'text-[#E4C67B]' : 'text-[#2E376F]'}`}
              >
              Fotoboek
              </Link>
          </nav>

          {/* Right: Auth Controls */}
          <div className="font-semibold text-center md:text-right">
            {status === "loading" ? (
              <span className="text-[#2E376F]">Loading...</span>
            ) : session ? (
              <>
                <Link 
                  href="/beheer/dashboard" 
                  className={`transition-colors duration-300 mt-5 ${isActive('/beheer/dashboard') ? 'text-[#E4C67B]' : 'text-[#2E376F]'}`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/api/auth/signout" 
                  className="ml-4 text-[#2E376F]"
                >
                 Uitloggen <LogOut className="w-5 h-5 inline-block m-2" />
                </Link>
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
      </header>
    </>
  );
}