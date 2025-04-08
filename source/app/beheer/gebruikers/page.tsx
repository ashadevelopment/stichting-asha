"use client"

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { User } from 'lucide-react'

interface Gebruiker {
  id: string
  name: string
  email: string
  role: string
}

export default function GebruikersPage() {
  const { data: session } = useSession()
  const [gebruikers, setGebruikers] = useState<Gebruiker[]>([])

  useEffect(() => {
    const fetchGebruikers = async () => {
      try {
        const res = await fetch('/api/gebruikers') // <-- nog te bouwen backend route
        const data = await res.json()
        setGebruikers(data)
      } catch (err) {
        console.error('Fout bij ophalen van gebruikers:', err)
      }
    }

    fetchGebruikers()
  }, [])

  if (session?.user?.role !== 'beheerder') {
    return <p className="text-red-500">Je hebt geen toegang tot deze pagina.</p>
  }

  return (
    <div className="text-gray-800 px-6 py-4">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <User size={24} /> Gebruikerslijst
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-xl shadow-sm">
          <thead className="bg-gray-100 text-left text-sm text-gray-600 uppercase">
            <tr>
              <th className="px-4 py-3 border-b">Naam</th>
              <th className="px-4 py-3 border-b">Email</th>
              <th className="px-4 py-3 border-b">Rol</th>
            </tr>
          </thead>
          <tbody>
            {gebruikers.map((gebruiker) => (
              <tr key={gebruiker.id} className="hover:bg-gray-50 text-sm">
                <td className="px-4 py-3 border-b">{gebruiker.name}</td>
                <td className="px-4 py-3 border-b">{gebruiker.email}</td>
                <td className="px-4 py-3 border-b capitalize italic">
                  {gebruiker.role === 'beheerder' ? 'Beheerder' : gebruiker.role === 'mede-beheerder' ? 'Mede-beheerder' : gebruiker.role}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
