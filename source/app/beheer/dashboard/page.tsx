'use client'

import { useSession } from 'next-auth/react'

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-2">
        Welkom, {session?.user?.name || 'Beheerder'}
      </h1>
      <p className="text-sm text-gray-500 italic">
        Rol: {session?.user?.role || 'Onbekend'}
      </p>

      <div className="mt-6 text-gray-700">
        <p>Welkom op het dashboard. Gebruik het menu aan de linkerkant om te navigeren naar verschillende beheermodules.</p>
      </div>
    </div>
  )
}
