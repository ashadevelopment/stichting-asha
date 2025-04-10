"use client"

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { User, Pencil, Trash, UserPlus, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import UserModals from './modals'

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

export default function GebruikersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<Gebruiker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [selectedUser, setSelectedUser] = useState<Gebruiker | null>(null)
  const [sortBy, setSortBy] = useState<'fullName' | 'role'>('fullName')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/users')
        
        if (!res.ok) {
          throw new Error('Fout bij ophalen van gebruikers')
        }
        
        const data = await res.json()
        setUsers(data.users)
      } catch (err) {
        console.error('Fout bij ophalen van gebruikers:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.role === 'beheerder' || session?.user?.role === 'developer') {
      fetchUsers()
    }
  }, [session])

  if (!session || (session?.user?.role !== 'beheerder' && session?.user?.role !== 'developer')) {
    return <p className="text-red-500 p-6">Je hebt geen toegang tot deze pagina.</p>
  }

  const handleAddUser = () => {
    setSelectedUser(null)
    setModalOpen('add')
  }

  const handleEditUser = (user: Gebruiker) => {
    setSelectedUser(user)
    setModalOpen('edit')
  }

  const handleDeleteUser = (user: Gebruiker) => {
    setSelectedUser(user)
    setModalOpen('delete')
  }

  const handleModalClose = (refresh: boolean = false) => {
    setModalOpen(null)
    if (refresh) {
      router.refresh()
    }
  }
  
  const toggleSort = (field: 'fullName' | 'role') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('asc')
    }
  }

  // Filter and sort users
  const filteredUsers = users
    .filter(user => 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'fullName') {
        return sortDirection === 'asc' 
          ? a.fullName.localeCompare(b.fullName)
          : b.fullName.localeCompare(a.fullName)
      } else {
        return sortDirection === 'asc'
          ? a.role.localeCompare(b.role)
          : b.role.localeCompare(a.role)
      }
    })

  return (
    <div className="text-gray-800 px-6 py-4">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <User size={24} /> Gebruikersbeheer
      </h2>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Zoeken op naam, email of rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={handleAddUser}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <UserPlus size={18} />
          <span>Nieuwe gebruiker</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="min-w-full">
              <thead className="bg-gray-50 text-left text-sm text-gray-600 uppercase sticky top-0">
                <tr>
                  <th className="px-4 py-3 border-b">Profiel</th>
                  <th 
                    className="px-4 py-3 border-b cursor-pointer" 
                    onClick={() => toggleSort('fullName')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Naam</span>
                      {sortBy === 'fullName' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 border-b">Email</th>
                  <th 
                    className="px-4 py-3 border-b cursor-pointer"
                    onClick={() => toggleSort('role')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Rol</span>
                      {sortBy === 'role' && (
                        <span className="text-xs">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 border-b">Functie</th>
                  <th className="px-4 py-3 border-b">Telefoon</th>
                  <th className="px-4 py-3 border-b w-24">Acties</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 border-b">
                        {user.profilePicture?.data ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img 
                              src={`/api/users/profile-picture?userId=${user._id}`} 
                              alt={user.fullName} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                            {user.initial}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 border-b font-medium">{user.fullName}</td>
                      <td className="px-4 py-3 border-b">{user.email}</td>
                      <td className="px-4 py-3 border-b capitalize italic">
                        {user.role === 'beheerder' ? 'Beheerder' : 
                         user.role === 'developer' ? 'Developer' : 
                         user.role === 'vrijwilliger' ? 'Vrijwilliger' : 
                         user.role === 'stagiair' ? 'Stagiair' : 'Gebruiker'}
                      </td>
                      <td className="px-4 py-3 border-b">{user.function || '-'}</td>
                      <td className="px-4 py-3 border-b">{user.phoneNumber || '-'}</td>
                      <td className="px-4 py-3 border-b">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-1.5 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
                            title="Bewerken"
                          >
                            <Pencil size={16} />
                          </button>
                          {(session.user.role === 'beheerder' || session.user.id === user._id) && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                              title="Verwijderen"
                            >
                              <Trash size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 border-b text-center text-gray-500">
                      {searchTerm ? 'Geen gebruikers gevonden die aan de zoekcriteria voldoen.' : 'Geen gebruikers gevonden.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <UserModals
        modalOpen={modalOpen}
        selectedUser={selectedUser}
        onClose={handleModalClose}
      />
    </div>
  )
}