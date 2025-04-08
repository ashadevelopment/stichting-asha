'use client'

import { useSession } from 'next-auth/react'
import { Lock, RefreshCw, User2, Phone, Mail, MapPin, BadgeInfo } from 'lucide-react'

export default function PersoonlijkeGegevensPage() {
  const { data: session } = useSession()

  const user = session?.user

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm text-gray-800 text-[16px]">
      {/* Titel */}
      <div className="flex items-center gap-2 mb-6">
        <User2 size={20} className="text-blue-600" />
        <h2 className="text-2xl font-semibold">Persoonlijke Gegevens</h2>
      </div>

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
          <label className="block mb-1 text-sm font-medium flex items-center gap-1">
            <Mail size={14} /> E-mailadres
          </label>
          <input
            type="email"
            defaultValue={user?.email || ''}
            className="w-full border border-gray-200 px-3 py-2 rounded bg-white"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium flex items-center gap-1">
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
          <label className="block mb-1 text-sm font-medium flex items-center gap-1">
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
