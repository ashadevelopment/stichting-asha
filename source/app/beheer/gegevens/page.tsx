'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Lock, RefreshCw, User2, Phone, Mail, MapPin, BadgeInfo } from 'lucide-react'
import ProfilePictureUpload from '../../../components/ProfilePictureUpload'

export default function PersoonlijkeGegevensPage() {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(Date.now())

  const user = session?.user

  const handleProfileUpdate = async () => {
    // Refresh session data after profile update
    await update()
    setRefreshTrigger(Date.now())
    setMessage({ type: 'success', text: 'Profile picture updated successfully' })
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage(null)
    }, 3000)
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm text-gray-800">
      {/* Titel */}
      <div className="flex items-center gap-2 mb-6">
        <User2 size={20} className="text-blue-600" />
        <h2 className="text-2xl font-semibold">Persoonlijke Gegevens</h2>
      </div>

      {/* Profile picture section */}
      <div className="flex justify-center mb-8">
        {user?.id && (
          <ProfilePictureUpload 
            userId={user.id} 
            name={user.name || undefined}
            onSuccess={handleProfileUpdate}
            size={120}
          />
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Rest of the form remains unchanged */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      <div>
          <label className="block mb-1 text-sm font-medium">Voornaam</label>
          <input
            type="text"
            defaultValue={user?.name || ''}
            className="w-full border border-gray-200 px-3 py-2 rounded bg-white"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Achternaam</label>
          <input
            type="text"
            defaultValue="Geen Achternaam"
            className="w-full border border-gray-200 px-3 py-2 rounded bg-white"
          />
        </div>
        <div>
          <label className="mb-1 text-sm font-medium flex items-center gap-1">
            <Mail size={14} /> E-mailadres
          </label>
          <input
            type="email"
            defaultValue={user?.email || ''}
            className="w-full border border-gray-200 px-3 py-2 rounded bg-white"
          />
        </div>
        <div>
          <label className="mb-1 text-sm font-medium flex items-center gap-1">
            <Phone size={14} /> Telefoonnummer
          </label>
          <input
            type="tel"
            defaultValue="Geen Telefoonnummer"
            className="w-full border border-gray-200 px-3 py-2 rounded bg-white"
          />
          <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
            <BadgeInfo size={14} /> Rol:{' '}
            <span className="italic capitalize">{user?.role || 'Onbekend'}</span>
          </p>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 text-sm font-medium flex items-center gap-1">
            <MapPin size={14} /> Adres
          </label>
          <input
            type="text"
            defaultValue="Geen Adres"
            className="w-full border border-gray-200 px-3 py-2 rounded bg-white"
          />
        </div>
      </div>

      {/* Wachtwoord vergeten */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Lock size={18} className="text-blue-600" />
          <h3 className="text-lg font-semibold">Wachtwoord vergeten</h3>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Wachtwoord opvragen
        </button>
      </div>

      {/* Wachtwoord wijzigen */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <RefreshCw size={18} className="text-green-600" />
          <h3 className="text-lg font-semibold">Wachtwoord wijzigen</h3>
        </div>
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Huidig wachtwoord"
            className="w-full border border-gray-200 px-3 py-2 rounded bg-white"
          />
          <input
            type="password"
            placeholder="Nieuw wachtwoord"
            className="w-full border border-gray-200 px-3 py-2 rounded bg-white"
          />
          <input
            type="password"
            placeholder="Bevestig nieuw wachtwoord"
            className="w-full border border-gray-200 px-3 py-2 rounded bg-white"
          />
        </div>
        <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Update wachtwoord
        </button>
      </div>
    </div>
  )
}