'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { UserCircle } from 'lucide-react'
import Avatar from '../../../components/Avatar'

export default function DashboardPage() {
  const { data: session } = useSession()

  // Profielfoto als beschikbaar
  const profileImage = session?.user?.image

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto mt-10">
      {/* Header met profielfoto en naam */}
      <div className="flex items-center gap-4 mb-4">
        {profileImage ? (
          <Image
            src={profileImage}
            alt="Profielfoto"
            width={64}
            height={64}
            className="rounded-full object-cover w-16 h-16"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-2xl font-bold">
            <UserCircle size={32} />
          </div>
        )}

        <div>
          <h1 className="text-3xl font-semibold">
            Welkom, {session?.user?.name || 'Beheerder'}
          </h1>
          {/* Alleen de rol tonen, zonder label */}
          <p className="text-sm text-gray-500 italic">
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
