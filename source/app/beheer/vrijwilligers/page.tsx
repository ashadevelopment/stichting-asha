"use client"

import { useState, useEffect } from 'react'
import { UserCheck, FileText, Check, X, User } from 'lucide-react'

interface Volunteer {
  _id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  message: string
  cv: {
    filename: string
    contentType: string
    data: string
  }
  motivationLetter: {
    filename: string
    contentType: string
    data: string
  }
  status: 'pending' | 'approved' | 'denied'
  createdAt: string
}

export default function VrijwilligersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVolunteers()
  }, [])

  const fetchVolunteers = async () => {
    try {
      const response = await fetch('/api/volunteers')
      if (!response.ok) throw new Error('Fout bij ophalen vrijwilligers')
      const data = await response.json()
      setVolunteers(data)
    } catch (err) {
      setError('Er is een fout opgetreden bij het laden van vrijwilligers')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/volunteers/${id}/approve`, {
        method: 'PUT',
      })
      
      if (!response.ok) throw new Error('Fout bij goedkeuren vrijwilliger')
      
      // Update local state to reflect the change
      setVolunteers(prev => 
        prev.map(vol => vol._id === id ? {...vol, status: 'approved'} : vol)
      )
    } catch (err) {
      setError('Er is een fout opgetreden bij het goedkeuren')
      console.error(err)
    }
  }

  const handleDeny = async (id: string) => {
    try {
      const response = await fetch(`/api/volunteers/${id}/deny`, {
        method: 'PUT',
      })
      
      if (!response.ok) throw new Error('Fout bij afkeuren vrijwilliger')
      
      // Update local state to reflect the change
      setVolunteers(prev => 
        prev.map(vol => vol._id === id ? {...vol, status: 'denied'} : vol)
      )
    } catch (err) {
      setError('Er is een fout opgetreden bij het afkeuren')
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze vrijwilliger wilt verwijderen?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/volunteers/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Fout bij verwijderen vrijwilliger')
      
      // Remove from local state
      setVolunteers(prev => prev.filter(vol => vol._id !== id))
    } catch (err) {
      setError('Er is een fout opgetreden bij het verwijderen')
      console.error(err)
    }
  }

  const openFile = (fileData: string, fileType: string, fileName: string) => {
    const linkSource = `data:${fileType};base64,${fileData}`
    const downloadLink = document.createElement('a')
    
    downloadLink.href = linkSource
    downloadLink.download = fileName
    downloadLink.click()
  }

  if (loading) return (
    <div className="text-gray-800 px-6 py-4">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <UserCheck size={24} /> Vrijwilligers
      </h2>
      <div className="flex justify-center">
        <p>Laden...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="text-gray-800 px-6 py-4">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <UserCheck size={24} /> Vrijwilligers
      </h2>
      <div className="bg-red-50 border border-red-400 p-4 rounded-xl text-red-700">
        {error}
      </div>
    </div>
  )

  // Filter volunteers by status
  const pendingVolunteers = volunteers.filter(vol => vol.status === 'pending')
  const approvedVolunteers = volunteers.filter(vol => vol.status === 'approved')
  const deniedVolunteers = volunteers.filter(vol => vol.status === 'denied')

  return (
    <div className="text-gray-800 px-6 py-4">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <UserCheck size={24} /> Vrijwilligers
      </h2>

      {/* Aanmeldingen */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-4 mb-8">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <FileText size={20} /> Openstaande Aanmeldingen
        </h3>
        <p className="text-sm text-gray-700">Overzicht van aanmeldingen die nog goedgekeurd moeten worden.</p>

        {pendingVolunteers.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Er zijn geen openstaande aanmeldingen.</p>
        ) : (
          pendingVolunteers.map(volunteer => (
            <div key={volunteer._id} className="border-t pt-4">
              <h3 className="font-semibold text-lg">{volunteer.firstName} {volunteer.lastName}</h3>
              <p className="text-sm text-gray-600">Email: {volunteer.email}</p>
              <p className="text-sm text-gray-600">Telefoon: {volunteer.phoneNumber}</p>
              <p className="text-sm text-gray-600">Bericht: {volunteer.message}</p>
              <p className="text-sm text-gray-600">Aangemeld op: {new Date(volunteer.createdAt).toLocaleDateString('nl-NL')}</p>
              <div className="mt-2 space-x-3">
                <button 
                  onClick={() => handleApprove(volunteer._id)}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1 inline-flex"
                >
                  <Check size={16} /> Goedkeuren
                </button>
                <button 
                  onClick={() => handleDeny(volunteer._id)}
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1 inline-flex"
                >
                  <X size={16} /> Afkeuren
                </button>
                <button 
                  onClick={() => openFile(volunteer.cv.data, volunteer.cv.contentType, volunteer.cv.filename)}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Bekijk CV
                </button>
                <button 
                  onClick={() => openFile(volunteer.motivationLetter.data, volunteer.motivationLetter.contentType, volunteer.motivationLetter.filename)}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Bekijk Motivatie
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actieve Vrijwilligers */}
      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-4 mb-8">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <User size={20} /> Actieve Vrijwilligers
        </h3>
        <p className="text-sm text-gray-700">Overzicht van goedgekeurde vrijwilligers.</p>

        {approvedVolunteers.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Er zijn geen actieve vrijwilligers.</p>
        ) : (
          approvedVolunteers.map(volunteer => (
            <div key={volunteer._id} className="border-t pt-4">
              <h3 className="font-semibold text-lg">{volunteer.firstName} {volunteer.lastName}</h3>
              <p className="text-sm text-gray-600">Email: {volunteer.email}</p>
              <p className="text-sm text-gray-600">Telefoon: {volunteer.phoneNumber}</p>
              <div className="mt-2 space-x-3">
                <button 
                  onClick={() => openFile(volunteer.cv.data, volunteer.cv.contentType, volunteer.cv.filename)}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Bekijk CV
                </button>
                <button 
                  onClick={() => openFile(volunteer.motivationLetter.data, volunteer.motivationLetter.contentType, volunteer.motivationLetter.filename)}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Bekijk Motivatie
                </button>
                <button 
                  onClick={() => handleDelete(volunteer._id)}
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Afgewezen Aanmeldingen */}
      {deniedVolunteers.length > 0 && (
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <X size={20} /> Afgewezen Aanmeldingen
          </h3>
          <p className="text-sm text-gray-700">Overzicht van afgewezen vrijwilligers.</p>

          {deniedVolunteers.map(volunteer => (
            <div key={volunteer._id} className="border-t pt-4">
              <h3 className="font-semibold text-lg text-gray-500">{volunteer.firstName} {volunteer.lastName}</h3>
              <p className="text-sm text-gray-500">Email: {volunteer.email}</p>
              <div className="mt-2 space-x-3">
                <button 
                  onClick={() => handleDelete(volunteer._id)}
                  className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}