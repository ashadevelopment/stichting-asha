"use client"

import { useState, useEffect } from 'react'
import { StickyNote, Send, Calendar, Trash2, AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { format, addDays, parseISO } from 'date-fns'

interface Notice {
  _id: string;
  title: string;
  message: string;
  expirationDate: string;
  author: string;
  isActive: boolean;
  createdAt: string;
}

export default function NotitiesPage() {
  const { data: session } = useSession()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [expirationDays, setExpirationDays] = useState(7)
  const [notices, setNotices] = useState<Notice[]>([])
  const [activeNotice, setActiveNotice] = useState<Notice | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchNotices()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Calculate expiration date
    const expirationDate = addDays(new Date(), expirationDays)

    try {
      // Check if there's already an active notice
      if (activeNotice) {
        // If there's an active notice, ask if you want to replace it
        if (!confirm('Er is al een actieve notitie. Wil je deze vervangen door een nieuwe?')) {
          setIsLoading(false)
          return
        }
        
        // Deactivate the current active notice
        await fetch(`/api/notices/${activeNotice._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isActive: false })
        })
      }

      // Create new notice in the database
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          message,
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
      
      // Find active notice
      const active = data.find((notice: Notice) => notice.isActive)
      setActiveNotice(active || null)
    } catch (err) {
      console.error('Fout bij ophalen notities:', err)
    }
  }

  const handleDeleteNotice = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze notitie wilt verwijderen?')) {
      return
    }

    try {
      const res = await fetch(`/api/notices/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        throw new Error('Kon notitie niet verwijderen')
      }

      setSuccess('Notitie is succesvol verwijderd')
      fetchNotices()
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden bij het verwijderen')
    }
  }

  const handleActivateNotice = async (id: string) => {
    try {
      // If there's already an active notice, deactivate it first
      if (activeNotice) {
        await fetch(`/api/notices/${activeNotice._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ isActive: false })
        })
      }

      // Activate the selected notice
      const res = await fetch(`/api/notices/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: true })
      })

      if (!res.ok) {
        throw new Error('Kon notitie niet activeren')
      }

      setSuccess('Notitie is succesvol geactiveerd')
      fetchNotices()
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden bij het activeren')
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

      {activeNotice && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-4 flex items-center gap-2">
          <AlertCircle size={18} />
          <span>Er is momenteel een actieve notitie: <strong>{activeNotice.title}</strong></span>
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

        <div>
          <label className="flex text-sm font-medium mb-2 items-center gap-1">
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

      {/* List of notices */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-4xl">
        <h3 className="text-xl font-semibold mb-4">Notities overzicht</h3>
        
        {notices.length === 0 ? (
          <p className="text-gray-500 text-sm">Geen notities gevonden.</p>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <div 
                key={notice._id} 
                className={`p-4 rounded-md border ${
                  notice.isActive 
                    ? 'bg-yellow-50 border-yellow-300' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{notice.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notice.message}</p>
                    <div className="text-xs text-gray-500 mt-2 space-x-4">
                      <span>Door: {notice.author}</span>
                      <span>Aangemaakt: {format(parseISO(notice.createdAt), 'dd/MM/yyyy')}</span>
                      <span>Verloopt: {format(parseISO(notice.expirationDate), 'dd/MM/yyyy')}</span>
                      {notice.isActive && <span className="text-green-600 font-medium">Actief</span>}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {!notice.isActive && (
                      <button
                        onClick={() => handleActivateNotice(notice._id)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Activeer notitie"
                      >
                        <Send size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotice(notice._id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Verwijder notitie"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}