"use client"

import { useState } from 'react'
import { StickyNote, Send, Users, Calendar } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { format, addDays } from 'date-fns'

export default function NotitiesPage() {
  const { data: session } = useSession()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [roles, setRoles] = useState<string[]>(['gebruiker'])
  const [expirationDays, setExpirationDays] = useState(7)
  const [notices, setNotices] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const allRoles = ['gebruiker', 'vrijwilliger', 'developer', 'mede-beheerder']

  const handleRoleToggle = (role: string) => {
    if (roles.includes(role)) {
      setRoles(roles.filter(r => r !== role))
    } else {
      setRoles([...roles, role])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Calculate expiration date
    const expirationDate = addDays(new Date(), expirationDays)

    try {
      // Create notice in the database
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          message,
          roles,
          expirationDate,
          author: session?.user?.name || 'Onbekend'
        })
      })

      if (!res.ok) {
        throw new Error('Er is een probleem opgetreden bij het opslaan van de notitie')
      }

      // Handle success
      setSuccess('Notitie is succesvol aangemaakt en zal worden weergegeven op de homepage')
      
      // Reset form
      setTitle('')
      setMessage('')
      setRoles(['gebruiker'])
      setExpirationDays(7)
      
      // Fetch updated notices
      fetchNotices()
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNotices = async () => {
    try {
      const res = await fetch('/api/notices')
      if (!res.ok) {
        throw new Error('Kon notities niet ophalen')
      }
      const data = await res.json()
      setNotices(data)
    } catch (err) {
      console.error('Fout bij ophalen notities:', err)
    }
  }

  return (
    <div className="text-gray-800 px-6 py-4">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <StickyNote size={24} /> Notities
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6 max-w-3xl mb-8">
        <div>
          <label className="block text-sm font-medium mb-1">Titel</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border border-gray-200 px-3 py-2 rounded text-sm"
            placeholder="Bijv: Herinnering bijeenkomst"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bericht</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full border border-gray-200 px-3 py-2 rounded text-sm h-32 resize-none"
            placeholder="Typ hier je notitie..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Versturen naar:</label>
            <div className="flex flex-wrap gap-3">
              {allRoles.map((role) => (
                <button
                  type="button"
                  key={role}
                  className={`px-4 py-1 rounded-full text-sm capitalize border ${
                    roles.includes(role)
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                  onClick={() => handleRoleToggle(role)}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-1">
              <Calendar size={16} /> Verloopdatum
            </label>
            <select 
              value={expirationDays}
              onChange={e => setExpirationDays(parseInt(e.target.value))}
              className="w-full border border-gray-200 px-3 py-2 rounded text-sm"
            >
              <option value="1">1 dag</option>
              <option value="3">3 dagen</option>
              <option value="7">1 week</option>
              <option value="14">2 weken</option>
              <option value="30">1 maand</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Notitie verloopt op: {format(addDays(new Date(), expirationDays), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <Send size={16} /> {isLoading ? 'Versturen...' : 'Verstuur notitie'}
          </button>
        </div>
      </form>

      {/* Hier zou je een lijst van bestaande notities kunnen tonen */}
    </div>
  )
}