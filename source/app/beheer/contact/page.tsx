"use client"

import { useState, useEffect } from 'react'
import { Mail, User, UserCheck, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import Avatar from '../../../components/Avatar'

interface UserProfile {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  function?: string;
  phoneNumber?: string;
  profilePicture?: {
    data: string;
    contentType: string;
  };
  initial?: string;
}

export default function ContactPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentContacts, setCurrentContacts] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{text: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [refreshTrigger] = useState(Date.now());

  // Fetch users and current contacts on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all users
        const usersResponse = await fetch('/api/users');
        if (!usersResponse.ok) throw new Error('Failed to fetch users');
        const usersData = await usersResponse.json();
        
        // Fetch current contact persons
        const contactsResponse = await fetch('/api/contacts');
        if (!contactsResponse.ok) throw new Error('Failed to fetch contacts');
        const contactsData = await contactsResponse.json();
        
        setUsers(usersData.users || []);
        setCurrentContacts(contactsData.contactPersons || []);
        
        // Pre-select current contacts
        setSelectedUsers((contactsData.contactPersons || []).map((contact: UserProfile) => contact._id));
      } catch (error) {
        console.error('Error fetching data:', error);
        setStatusMessage({
          text: 'Er is een fout opgetreden bij het ophalen van de gegevens',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Helper function to get user's full name
  const getFullName = (user: UserProfile) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || "Geen naam";
  };

  // Handler for toggling user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => {
      // If user is already selected, remove them
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      
      // If trying to add more than 2 users, show error
      if (prev.length >= 2) {
        setStatusMessage({
          text: 'Er kunnen maximaal 2 contactpersonen worden geselecteerd',
          type: 'error'
        });
        return prev;
      }
      
      // Add the user
      return [...prev, userId];
    });
  };

  // Handler for saving contact settings
  const saveContactSettings = async () => {
    try {
      setSaving(true);
      setStatusMessage(null);
      
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contactPersonIds: selectedUsers }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Er is een fout opgetreden');
      }
      
      // Update current contacts with the new selection
      setCurrentContacts(users.filter(user => selectedUsers.includes(user._id)));
      
      setStatusMessage({
        text: 'Contactpersonen zijn succesvol bijgewerkt',
        type: 'success'
      });
    } catch (error: any) {
      console.error('Error saving contact settings:', error);
      setStatusMessage({
        text: error.message || 'Er is een fout opgetreden bij het opslaan',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="text-gray-800 px-6 py-4">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Mail size={24} /> Contact Personen
      </h2>
      
      {statusMessage && (
        <div className={`mb-4 p-4 rounded-md flex items-start gap-2 ${
          statusMessage.type === 'success' ? 'bg-green-50 text-green-700' :
          statusMessage.type === 'error' ? 'bg-red-50 text-red-700' :
          'bg-blue-50 text-blue-700'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle size={20} /> :
           statusMessage.type === 'error' ? <XCircle size={20} /> :
           <AlertCircle size={20} />}
          <p>{statusMessage.text}</p>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <UserCheck size={20} /> Huidige contact personen
        </h3>
        
        {loading ? (
          <p className="text-gray-600">Contact personen laden...</p>
        ) : currentContacts.length === 0 ? (
          <p className="text-gray-600">Geen contact personen ingesteld</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentContacts.map(contact => (
              <div key={contact._id} className="border border-gray-200 rounded-lg p-4 flex items-center">
                <Avatar
                  userId={contact._id}
                  name={getFullName(contact)}
                  initial={contact.initial}
                  size={64}
                  refreshTrigger={refreshTrigger}
                />
                <div className="ml-4">
                  <h4 className="text-lg font-medium">{getFullName(contact)}</h4>
                  <p className="text-gray-600">{contact.function || 'Geen functie'}</p>
                  <p className="text-gray-600">{contact.email}</p>
                  <p className="text-gray-600">{contact.phoneNumber || 'Geen telefoonnummer'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <User size={20} /> Selecteer Contact Persoon
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          Selecteer maximaal 2 gebruikers die als contact personen worden weergegeven op de contactpagina.
        </p>
        
        {loading ? (
          <p className="text-gray-600">Gebruikers laden...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-7">
              {users.map(user => (
                <div 
                  key={user._id} 
                  className={`border rounded-lg p-4 flex items-center cursor-pointer transition-colors ${
                    selectedUsers.includes(user._id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleUserSelection(user._id)}
                >
                  <div className="relative">
                    <Avatar
                      userId={user._id}
                      name={getFullName(user)}
                      initial={user.initial}
                      size={64}
                      refreshTrigger={refreshTrigger}
                    />
                    {selectedUsers.includes(user._id) && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                        <CheckCircle size={14} />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium">{getFullName(user)}</h4>
                    <p className="text-gray-600">{user.function || 'Geen functie'}</p>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-gray-600">{user.phoneNumber || 'Geen telefoonnummer'}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                onClick={saveContactSettings}
                disabled={saving || selectedUsers.length === 0}
              >
                {saving ? 'Opslaan...' : 'Contactpersonen opslaan'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}