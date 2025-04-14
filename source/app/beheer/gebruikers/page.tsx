'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfilePictureManager from '../../../components/ProfilePictureManager';

interface User {
  _id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  function: string;
  phoneNumber: string;
  fullName: string;
  initial: string;
  profilePicture?: {
    filename: string | null;
    contentType: string | null;
    data: string | null;
  };
}

export default function GebruikersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const router = useRouter();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      // Check the structure of the response and handle accordingly
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(userId: string) {
    if (confirm('Weet je zeker dat je deze gebruiker wilt verwijderen?')) {
      try {
        const response = await fetch(`/api/users/delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          throw new Error('Failed to delete user');
        }

        // Refresh the user list
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  }

  function handleEdit(user: User) {
    setSelectedUser(user);
    setShowEditModal(true);
  }

  const roleColors: Record<string, string> = {
    beheerder: 'bg-red-100 text-red-800',
    developer: 'bg-blue-100 text-blue-800',
    vrijwilliger: 'bg-green-100 text-green-800',
    stagiair: 'bg-yellow-100 text-yellow-800',
    user: 'bg-gray-100 text-gray-800',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Gebruikers Beheer</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
          onClick={() => setShowAddModal(true)}
        >
          Nieuwe gebruiker
        </button>
      </div>

      {/* Mobile User Cards - Shown on small screens */}
      <div className="sm:hidden space-y-4">
        {users.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Geen gebruikers gevonden</p>
        ) : (
          users.map((user) => (
            <div key={user._id} className="bg-white shadow-md rounded-lg p-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 h-12 w-12 relative">
                  <ProfilePictureManager 
                    userId={user._id}
                    name={user.fullName}
                    initial={user.initial}
                    size={48}
                    editable={false}
                    showButtons={false}
                  />
                </div>
                <div className="ml-4">
                  <div className="text-lg font-medium text-gray-900">{user.fullName}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
              
              <div className="mb-3">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>
                  {user.role}
                </span>
              </div>
              
              <div className="text-sm text-gray-500 mb-4">
                <div>Functie: {user.function || 'N/A'}</div>
                <div>Telefoonnummer: {user.phoneNumber || 'N/A'}</div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="text-indigo-600 hover:text-indigo-900 px-3 py-1 border border-indigo-300 rounded-md text-sm"
                >
                  Bewerken
                </button>
                <button
                  onClick={() => deleteUser(user._id)}
                  className="text-red-600 hover:text-red-900 px-3 py-1 border border-red-300 rounded-md text-sm"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table - Hidden on small screens */}
      <div className="hidden sm:block bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gebruiker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Functie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefoonnummer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Geen gebruikers gevonden
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          <ProfilePictureManager 
                            userId={user._id}
                            name={user.fullName}
                            initial={user.initial}
                            size={40}
                            editable={false}
                            showButtons={false}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.function || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phoneNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Bewerken
                      </button>
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Verwijderen
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal (Add/Edit) */}
      {(showAddModal || showEditModal) && (
        <UserFormModal
          isOpen={showAddModal || showEditModal}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSuccess={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedUser(null);
            fetchUsers();
          }}
          isEdit={showEditModal}
        />
      )}
    </div>
  );
}

// User Form Modal Component
function UserFormModal({ isOpen, onClose, user, onSuccess, isEdit }: {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
  isEdit: boolean;
}) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'user',
    function: user?.function || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileUpdated, setProfileUpdated] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureSuccess = () => {
    setProfileUpdated(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataObj = new FormData();
      
      // Append all user data fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value);
      });
      
      // Append user ID if editing
      if (isEdit && user?._id) {
        formDataObj.append('userId', user._id);
      }
      
      const endpoint = isEdit ? '/api/users/update' : '/api/users/create';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        body: formDataObj,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Er is een fout opgetreden');
      }

      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {isEdit ? 'Gebruiker bewerken' : 'Nieuwe gebruiker'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Profile Picture Manager - only show in edit mode when we have a user ID */}
              {isEdit && user?._id && (
                <div className="flex justify-center mb-6">
                  <ProfilePictureManager
                    userId={user._id}
                    name={formData.firstName || formData.name}
                    email={formData.email}
                    size={100}
                    editable={true}
                    onSuccess={handleProfilePictureSuccess}
                    showButtons={true}
                  />
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">
                    Voornaam {!isEdit && <span className="text-red-500">*</span>}
                    </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">
                    Achternaam {!isEdit && <span className="text-red-500">*</span>}
                    </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 mb-1">
                  Email {!isEdit && <span className="text-red-500">*</span>}
                  </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              {/* Password (required for new users) */}
              <div>
                <label className="block text-gray-700 mb-1">
                  Wachtwoord {!isEdit && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required={!isEdit}
                  placeholder={isEdit ? "Alleen invullen om te wijzigen" : ""}
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-gray-700 mb-1">Rol</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="user">Gebruiker</option>
                  <option value="beheerder">Beheerder</option>
                  <option value="developer">Developer</option>
                  <option value="vrijwilliger">Vrijwilliger</option>
                  <option value="stagiair">Stagiair</option>
                </select>
              </div>

              {/* Function */}
              <div>
                <label className="block text-gray-700 mb-1">Functie</label>
                <input
                  type="text"
                  name="function"
                  value={formData.function}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-gray-700 mb-1">Telefoonnummer</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              {profileUpdated && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  Profielfoto bijgewerkt! Sla de gebruiker op om alle wijzigingen te bevestigen.
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Bezig...' : isEdit ? 'Opslaan' : 'Toevoegen'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}