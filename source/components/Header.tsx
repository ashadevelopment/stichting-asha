"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

type HeaderProps = {
    className?: string;
  };

export function Header({ className = "" }: HeaderProps) {
  const { data: session, status } = useSession();

  return (
    <header className={`relative w-full shadow-md z-50 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" className="h-12 w-12" />
          <span style={{ color: "#2E376F" }} className="text-2xl font-bold">
            Stichting Asha
          </span>
        </div>

        {/* Center: Nav Menu */}
        <nav className="flex flex-wrap justify-center gap-6 text-base font-medium">
          <Link href="/" style={{ color: "#2E376F" }}>Home</Link>
          <Link href="/agenda" style={{ color: "#2E376F" }}>Agenda</Link>
          <Link href="/projecten" style={{ color: "#2E376F" }}>Projecten</Link>
          <Link href="/contact" style={{ color: "#2E376F" }}>Contact</Link>
        </nav>

        {/* Right: Auth Controls */}
        <div className="font-semibold text-center md:text-right">
          {status === "loading" ? (
            <span style={{ color: "#2E376F" }}>Loading...</span>
          ) : session ? (
            <>
              <Link href="/dashboard" style={{ color: "#2E376F" }}>
                {session.user?.name}
              </Link>
              <Link href="/api/auth/signout" className="ml-4" style={{ color: "#2E376F" }}>
                Sign out
              </Link>
            </>
          ) : (
            <Link href="/login" style={{ color: "#2E376F" }}>Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}
