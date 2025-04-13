// app/beheer/gebruikers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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

  function getProfileImage(user: User) {
    if (user.profilePicture?.data) {
      return `data:${user.profilePicture.contentType};base64,${user.profilePicture.data}`;
    }
    return '/images/default-profile.png'; // Default image path
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gebruikers Beheer</h1>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setShowAddModal(true)}
        >
          Nieuwe gebruiker
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 relative">
                      {user.profilePicture?.data ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={getProfileImage(user)}
                          alt={user.fullName}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                          {user.initial}
                        </div>
                      )}
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
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.function}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phoneNumber}
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
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Geen gebruikers gevonden
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user?.profilePicture?.data 
      ? `data:${user.profilePicture.contentType};base64,${user.profilePicture.data}`
      : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfilePicture(null);
    setPreviewUrl(null);
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
      
      // Append profile picture if selected
      if (profilePicture) {
        formDataObj.append('profilePicture', profilePicture);
      } else if (previewUrl === null && isEdit) {
        // If editing and image was removed, indicate to remove on server
        formDataObj.append('removeProfilePicture', 'true');
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
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
              {/* Profile Picture */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Profielfoto</label>
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-500 text-2xl">
                        {user?.initial || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      Upload foto
                    </label>
                    {(previewUrl || (user?.profilePicture?.data)) && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Verwijderen
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Voornaam</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Achternaam</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              {/* Username (Name) */}
              <div>
                <label className="block text-gray-700 mb-1">Gebruikersnaam</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 mb-1">Email</label>
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