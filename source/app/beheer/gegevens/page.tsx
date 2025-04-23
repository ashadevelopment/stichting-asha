'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Lock, RefreshCw, User2, Phone, Mail, MapPin, BadgeInfo } from 'lucide-react'
import ProfilePictureManager from '../../../components/ProfilePictureManager'

export default function PersoonlijkeGegevensPage() {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(Date.now())

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const user = session?.user

  const handleProfileUpdate = async () => {
    await update()
    setRefreshTrigger(Date.now())
    setMessage({ type: 'success', text: 'Profielfoto is bijgewerkt' })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleForgotPassword = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Er is iets misgegaan')

      setMessage({ type: 'success', text: data.message || 'Resetlink verzonden naar je e-mail.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsLoading(false)
      setTimeout(() => setMessage(null), 4000)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Nieuwe wachtwoorden komen niet overeen.' })
      return
    }

    try {
      setIsLoading(true)
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Er is iets misgegaan')

      setMessage({ type: 'success', text: data.message || 'Wachtwoord succesvol bijgewerkt.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsLoading(false)
      setTimeout(() => setMessage(null), 4000)
    }
  }

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
        <User2 size={20} className="text-blue-600" /> Persoonlijke Gegevens
      </h2>

      <div className="space-y-6">
        {/* Profielkaart */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex flex-col items-center mb-6">
            {user?.id && (
              <ProfilePictureManager 
                userId={user.id} 
                name={user.name || undefined}
                size={120}
                onSuccess={handleProfileUpdate}
              />
            )}
            <h3 className="mt-4 text-lg font-semibold text-gray-800">{user?.name || 'Gebruiker'}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <BadgeInfo size={12} />
              <span className="italic capitalize">{user?.role || 'Onbekend'}</span>
            </p>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded text-center ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-4 mt-4">
            <div>
              <label className="flex mb-1 text-sm font-medium items-center gap-1 text-gray-700">
                <User2 size={14} /> Naam
              </label>
              <input
                type="text"
                defaultValue={user?.name || ''}
                className="w-full border border-gray-200 px-3 py-2 rounded bg-white"
              />
            </div>

            <div>
              <label className="mb-1 text-sm font-medium flex items-center gap-1 text-gray-700">
                <Mail size={14} /> E-mailadres
              </label>
              <input
                type="email"
                defaultValue={user?.email || ''}
                className="w-full border border-gray-200 px-3 py-2 rounded bg-white"
                readOnly
              />
              <p className="mt-1 text-xs text-gray-500">E-mailadres kan niet worden gewijzigd.</p>
            </div>

            <div>
              <label className="mb-1 text-sm font-medium flex items-center gap-1 text-gray-700">
                <Phone size={14} /> Telefoonnummer
              </label>
              <input
                type="tel"
                placeholder="Voer uw telefoonnummer in"
                className="w-full border border-gray-200 px-3 py-2 rounded bg-white"
              />
            </div>

            <div>
              <label className="mb-1 text-sm font-medium flex items-center gap-1 text-gray-700">
                <MapPin size={14} /> Adres
              </label>
              <input
                type="text"
                placeholder="Voer uw adres in"
                className="w-full border border-gray-200 px-3 py-2 rounded bg-white"
              />
            </div>

            <button className="w-full sm:w-auto mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              Gegevens opslaan
            </button>
          </div>
        </div>

        {/* Wachtwoord vergeten */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-blue-600" />
            <h3 className="text-lg font-semibold">Wachtwoord vergeten</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Klik op de onderstaande knop om een link te ontvangen waarmee u uw wachtwoord kunt resetten.
          </p>
          <button
            onClick={handleForgotPassword}
            disabled={isLoading}
            className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Bezig...' : 'Wachtwoord opvragen'}
          </button>
        </div>

        {/* Wachtwoord wijzigen */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw size={18} className="text-green-600" />
            <h3 className="text-lg font-semibold">Wachtwoord wijzigen</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Huidig wachtwoord</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Voer uw huidige wachtwoord in"
                className="w-full border border-gray-200 px-3 py-2 rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Nieuw wachtwoord</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Voer uw nieuwe wachtwoord in"
                className="w-full border border-gray-200 px-3 py-2 rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Bevestig nieuw wachtwoord</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Bevestig uw nieuwe wachtwoord"
                className="w-full border border-gray-200 px-3 py-2 rounded bg-white"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={isLoading}
              className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Bezig...' : 'Wachtwoord bijwerken'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
