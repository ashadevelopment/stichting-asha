"use client"

import { useState } from 'react'
import { StickyNote, Send, Users } from 'lucide-react'

export default function NotitiesPage() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [roles, setRoles] = useState<string[]>([])

  const allRoles = ['gebruiker', 'vrijwilliger', 'developer', 'mede-beheerder']

  const handleRoleToggle = (role: string) => {
    if (roles.includes(role)) {
      setRoles(roles.filter(r => r !== role))
    } else {
      setRoles([...roles, role])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Hier komt de API-call voor het opslaan van de notitie
    console.log({ title, message, roles })

    // Reset form
    setTitle('')
    setMessage('')
    setRoles([])
  }

  return (
    <div className="text-gray-800 px-6 py-4">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <StickyNote size={24} /> Notities
      </h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6 max-w-3xl">
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

        <div className="pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            <Send size={16} /> Verstuur notitie
          </button>
        </div>
      </form>
    </div>
  )
}
