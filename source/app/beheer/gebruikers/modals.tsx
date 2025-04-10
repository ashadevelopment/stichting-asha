"use client"

import { useState, useEffect } from 'react'
import { X, Upload, Trash } from 'lucide-react'

interface Gebruiker {
  _id: string
  name: string
  firstName: string
  lastName: string
  email: string
  role: string
  function?: string
  phoneNumber?: string
  profilePicture?: {
    data: string
    contentType: string
    filename: string
  }
  fullName: string
  initial: string
}

interface UserModalsProps {
  modalOpen: 'add' | 'edit' | 'delete' | null
  selectedUser: Gebruiker | null
  onClose: (refresh?: boolean) => void
}

export default function UserModals({ modalOpen, selectedUser, onClose }: UserModalsProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    function: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  })
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteProfilePicture, setDeleteProfilePicture] = useState(false)

  useEffect(() => {
    if (modalOpen === 'edit' && selectedUser) {
      setFormData({
        firstName: selectedUser.firstName || '',
        lastName: selectedUser.lastName || '',
        email: selectedUser.email || '',
        role: selectedUser.role || 'user',
        function: selectedUser.function || '',
        phoneNumber: selectedUser.phoneNumber || '',
        password: '',
        confirmPassword: ''
      })
      
      if (selectedUser.profilePicture?.data) {
        setProfilePreview(`/api/users/profile-picture?userId=${selectedUser._id}`)
      } else {
        setProfilePreview(null)
      }
      
      setDeleteProfilePicture(false)
    } else if (modalOpen === 'add') {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'user',
        function: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
      })
      setProfilePicture(null)
      setProfilePreview(null)
      setDeleteProfilePicture(false)
    }
    
    setError('')
  }, [modalOpen, selectedUser])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfilePicture(file)
      
      const reader = new FileReader()
      reader.onload = () => {
        setProfilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      setDeleteProfilePicture(false)
    }
  }

  const handleRemoveProfilePicture = () => {
    setProfilePicture(null)
    setProfilePreview(null)
    setDeleteProfilePicture(true)
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) return 'Voornaam is verplicht'
    if (!formData.lastName.trim()) return 'Achternaam is verplicht'
    if (!formData.email.trim()) return 'Email is verplicht'
    if (!formData.email.includes('@')) return 'Voer een geldig e-mailadres in'
    
    if (modalOpen === 'add') {
      if (!formData.password) return 'Wachtwoord is verplicht'
      if (formData.password.length < 8) return 'Wachtwoord moet minimaal 8 karakters zijn'
      if (formData.password !== formData.confirmPassword) return 'Wachtwoorden komen niet overeen'
    } else if (modalOpen === 'edit') {
      if (formData.password && formData.password.length < 8) {
        return 'Wachtwoord moet minimaal 8 karakters zijn'
      }
      if (formData.password !== formData.confirmPassword) {
        return 'Wachtwoorden komen niet overeen'
      }
    }
    
    return null
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    
    try {
      setLoading(true)
      setError('')
      
      const userData = new FormData()
      userData.append('firstName', formData.firstName)
      userData.append('lastName', formData.lastName)
      userData.append('email', formData.email)
      userData.append('role', formData.role)
      userData.append('function', formData.function)
      userData.append('phoneNumber', formData.phoneNumber)
      userData.append('password', formData.password)
      
      if (profilePicture) {
        userData.append('profilePicture', profilePicture)
      }
      
      const response = await fetch('/api/users/create', {
        method: 'POST',
        body: userData
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Gebruiker toevoegen mislukt')
      }
      
      onClose(true)
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedUser) return
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    
    try {
      setLoading(true)
      setError('')
      
      const userData = new FormData()
      userData.append('userId', selectedUser._id)
      userData.append('firstName', formData.firstName)
      userData.append('lastName', formData.lastName)
      userData.append('email', formData.email)
      userData.append('role', formData.role)
      userData.append('function', formData.function)
      userData.append('phoneNumber', formData.phoneNumber)
      
      if (formData.password) {
        userData.append('password', formData.password)
      }
      
      if (profilePicture) {
        userData.append('profilePicture', profilePicture)
      }
      
      userData.append('deleteProfilePicture', deleteProfilePicture.toString())
      
      const response = await fetch('/api/users/update', {
        method: 'POST',
        body: userData
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Gebruiker bijwerken mislukt')
      }
      
      // If profile picture was deleted, make a separate call
      if (deleteProfilePicture && selectedUser._id) {
        const deleteResponse = await fetch('/api/users/profile-picture/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: selectedUser._id })
        })
        
        if (!deleteResponse.ok) {
          console.error('Fout bij verwijderen profielfoto')
        }
      }
      
      onClose(true)
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: selectedUser._id })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Gebruiker verwijderen mislukt')
      }
      
      onClose(true)
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  if (!modalOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Add User Modal */}
        {modalOpen === 'add' && (
          <div>
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-xl font-semibold">Nieuwe gebruiker toevoegen</h3>
              <button onClick={() => onClose()} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-6">
              <div className="mb-6 flex flex-col items-center">
                <div className="relative mb-3">
                  {profilePreview ? (
                    <div className="w-24 h-24 rounded-full border overflow-hidden relative group">
                      <img 
                        src={profilePreview} 
                        alt="Profielfoto preview" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button 
                          type="button" 
                          onClick={handleRemoveProfilePicture}
                          className="p-1.5 bg-red-600 text-white rounded-full"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <label className="cursor-pointer p-3 bg-gray-300 hover:bg-gray-400 rounded-full text-gray-700 flex items-center justify-center">
                        <Upload size={24} />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                        />
                      </label>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {!profilePreview && "Klik om een profielfoto te uploaden"}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-1 font-medium text-sm">Voornaam</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Achternaam</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium text-sm">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-1 font-medium text-sm">Functie</label>
                  <input
                    type="text"
                    name="function"
                    value={formData.function}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Telefoon</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium text-sm">Rol</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">Gebruiker</option>
                  <option value="vrijwilliger">Vrijwilliger</option>
                  <option value="stagiair">Stagiair</option>
                  <option value="developer">Developer</option>
                  <option value="beheerder">Beheerder</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-medium text-sm">Wachtwoord</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Bevestig wachtwoord</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg"
                  disabled={loading}
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? 'Toevoegen...' : 'Toevoegen'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Edit User Modal */}
        {modalOpen === 'edit' && selectedUser && (
          <div>
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-xl font-semibold">Gebruiker bewerken</h3>
              <button onClick={() => onClose()} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="p-6">
              <div className="mb-6 flex flex-col items-center">
                <div className="relative mb-3">
                  {profilePreview ? (
                    <div className="w-24 h-24 rounded-full border overflow-hidden relative group">
                      <img 
                        src={profilePreview} 
                        alt="Profielfoto preview" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button 
                          type="button" 
                          onClick={handleRemoveProfilePicture}
                          className="p-1.5 bg-red-600 text-white rounded-full"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <label className="cursor-pointer p-3 bg-gray-300 hover:bg-gray-400 rounded-full text-gray-700 flex items-center justify-center">
                        <Upload size={24} />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                        />
                      </label>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {!profilePreview && "Klik om een profielfoto te uploaden"}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-1 font-medium text-sm">Voornaam</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Achternaam</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium text-sm">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-1 font-medium text-sm">Functie</label>
                  <input
                    type="text"
                    name="function"
                    value={formData.function}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Telefoon</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block mb-1 font-medium text-sm">Rol</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">Gebruiker</option>
                  <option value="vrijwilliger">Vrijwilliger</option>
                  <option value="stagiair">Stagiair</option>
                  <option value="developer">Developer</option>
                  <option value="beheerder">Beheerder</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-1 font-medium text-sm">Nieuw wachtwoord (optioneel)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Bevestig wachtwoord</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg"
                  disabled={loading}
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? 'Opslaan...' : 'Opslaan'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Delete User Modal */}
        {modalOpen === 'delete' && selectedUser && (
          <div>
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-xl font-semibold">Gebruiker verwijderen</h3>
              <button onClick={() => onClose()} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="mb-4">
                  Weet je zeker dat je deze gebruiker wilt verwijderen?
                </p>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    {selectedUser.profilePicture?.data ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img 
                          src={`/api/users/profile-picture?userId=${selectedUser._id}`} 
                          alt={selectedUser.fullName} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                        {selectedUser.initial}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{selectedUser.fullName}</p>
                      <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg"
                  disabled={loading}
                >
                  Annuleren
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? 'Verwijderen...' : 'Verwijderen'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}