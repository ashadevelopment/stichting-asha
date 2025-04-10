'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Avatar from '../../../components/Avatar'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [refreshTrigger] = useState(Date.now())

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto mt-10">
      {/* Header met profielfoto en naam */}
      <div className="flex items-center gap-4 mb-4">
        {session?.user?.id ? (
          <Avatar 
            userId={session.user.id}
            name={session.user.name || undefined}
            size={64}
            refreshTrigger={refreshTrigger}
          />
        ) : (
          <Avatar size={64} />
        )}

        <div>
          <h1 className="text-3xl font-semibold">
            Welkom, {session?.user?.name || 'Beheerder'}
          </h1>
          {/* Alleen de rol tonen, zonder label */}
          <p className="text-sm text-gray-500 italic capitalize">
            {session?.user?.role || 'Onbekend'}
          </p>
        </div>
      </div>

      {/* Intro tekst */}
      <div className="text-gray-700">
        <p>
          Welkom op het dashboard. Gebruik het menu aan de linkerkant om te navigeren naar verschillende beheermodules.
        </p>
      </div>
    </div>
  )
}