'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Lock, RefreshCw, User2, Phone, Mail, MapPin, BadgeInfo, Save, CheckCircle } from 'lucide-react'
import ProfilePictureManager from '../../../components/ProfilePictureManager'

export default function PersoonlijkeGegevensPage() {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(Date.now())
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isLoadingUserData, setIsLoadingUserData] = useState(true)

  // Password states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // User information states
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')

  const user = session?.user

  // Fetch current user details when session is loaded
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user?.id) {
        setIsLoadingUserData(true)
        try {
          const response = await fetch(`/api/users/details?userId=${user.id}`)
          if (response.ok) {
            const userData = await response.json()
            
            // Set form fields with user data
            setFirstName(userData.firstName || '')
            setLastName(userData.lastName || '')
            setEmail(userData.email || '')
            setPhoneNumber(userData.phoneNumber || '')
          } else {
            // If API call fails, try to use session data as fallback
            const nameParts = user.name?.split(' ') || ['', '']
            if (nameParts.length > 1) {
              setFirstName(nameParts[0])
              setLastName(nameParts.slice(1).join(' '))
            } else {
              setFirstName(user.name || '')
            }
            setEmail(user.email || '')
          }
        } catch (error) {
          console.error('Error fetching user details:', error)
          // Fallback to session data
          const nameParts = user.name?.split(' ') || ['', '']
          if (nameParts.length > 1) {
            setFirstName(nameParts[0])
            setLastName(nameParts.slice(1).join(' '))
          } else {
            setFirstName(user.name || '')
          }
          setEmail(user.email || '')
        } finally {
          setIsLoadingUserData(false)
        }
      }
    }
    
    fetchUserDetails()
  }, [user])

  const handleProfileUpdate = async () => {
    await update()
    setRefreshTrigger(Date.now())
    setMessage({ type: 'success', text: 'Profielfoto is bijgewerkt' })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSaveUserInfo = async () => {
    if (!user?.id) return
    
    try {
      setSaveLoading(true)
      const formData = new FormData()
      
      formData.append('userId', user.id)
      formData.append('firstName', firstName)
      formData.append('lastName', lastName)
      formData.append('email', email)
      formData.append('phoneNumber', phoneNumber)
      
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        body: formData
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Er is iets misgegaan bij het bijwerken van uw gegevens')
      }
      
      // Show success animation
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
      
      // Update the session with new data
      const updatedSession = await update({
        ...session,
        user: {
          ...session?.user,
          firstName: firstName,
          lastName: lastName,
          name: `${firstName} ${lastName}`.trim(),
          email: email,
        }
      })
      
      setMessage({ type: 'success', text: data.message || 'Gegevens succesvol bijgewerkt' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaveLoading(false)
    }
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
        <User2 size={24} /> Persoonlijke Gegevens
      </h2>

      <div className="space-y-6">
        {/* Profielkaart */}
        <div className="bg-white rounded-xl p-4 sm:p-6">
          <div className="flex flex-col items-center mb-6">
            {user?.id && (
              <ProfilePictureManager 
                userId={user.id} 
                name={`${firstName} ${lastName}`.trim() || user?.name || undefined}
                size={120}
                onSuccess={handleProfileUpdate}
                // Force a key refresh whenever refreshTrigger changes to ensure re-render
                key={`profile-pic-${refreshTrigger}`}
              />
            )}
            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              {firstName && lastName ? `${firstName} ${lastName}` : user?.name || 'Gebruiker'}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <BadgeInfo size={12} />
              <span className="italic capitalize">{user?.role || 'Onbekend'}</span>
            </p>
            {email && (
              <p className="text-sm text-gray-500 mt-1">{email}</p>
            )}
          </div>
          
          <div className="mb-6 bg-blue-50 p-4 rounded-lg border-blue-100 text-blue-800 text-sm">
            <h4 className="font-medium mb-1">Persoonlijke gegevens beheren</h4>
            <p>Op deze pagina kunt u uw persoonlijke gegevens bekijken en bijwerken. Wijzigingen worden automatisch opgeslagen wanneer u op de knop "Gegevens opslaan" klikt.</p>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded text-center ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message.text}
            </div>
          )}
          
          {isLoadingUserData && (
            <div className="flex justify-center items-center p-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Gegevens laden...</span>
            </div>
          )}

          {!isLoadingUserData && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex mb-1 text-sm font-medium items-center gap-1 text-gray-700">
                  <User2 size={14} /> Voornaam
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-200 px-3 py-2 rounded bg-white"
                />
              </div>
              <div>
                <label className="flex mb-1 text-sm font-medium items-center gap-1 text-gray-700">
                  <User2 size={14} /> Achternaam
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-200 px-3 py-2 rounded bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 text-sm font-medium flex items-center gap-1 text-gray-700">
                <Mail size={14} /> E-mailadres
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full border border-gray-200 px-3 py-2 rounded ${user?.role !== 'beheerder' ? 'bg-gray-50' : 'bg-white'}`}
                readOnly={user?.role !== 'beheerder'}
              />
              {user?.role !== 'beheerder' ? (
                <p className="mt-1 text-xs text-gray-500">
                  E-mailadres kan niet worden gewijzigd. Neem contact op met de beheerder voor wijzigingen.
                </p>
              ) : (
                <p className="mt-1 text-xs text-green-600">
                  Als beheerder kunt u uw e-mailadres aanpassen.
                </p>
              )}
            </div>

            <div>
                <label className="mb-1 text-sm font-medium flex items-center gap-1 text-gray-700">
                  <Phone size={14} /> Telefoonnummer
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
                    setPhoneNumber(numericValue);
                  }}
                  placeholder="Voer uw telefoonnummer in"
                  className="w-full border border-gray-200 px-3 py-2 rounded bg-white"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
            </div>

            <button 
              onClick={handleSaveUserInfo}
              disabled={saveLoading || saveSuccess}
              className="flex items-center justify-center gap-2 w-full sm:w-auto mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-75"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle size={18} />
                  Opgeslagen
                </>
              ) : saveLoading ? (
                'Opslaan...'
              ) : (
                <>
                  <Save size={18} />
                  Gegevens opslaan
                </>
              )}
            </button>
          </div>
            )}
        </div>

        {/* Wachtwoord vergeten */}
        <div className="bg-white rounded-xl p-4 sm:p-6">
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
        <div className="bg-white rounded-xl p-4 sm:p-6">
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