"use client"

import { useState, useEffect } from 'react'
import { Mail, User, UserCheck, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import ProfilePictureManager from '../../../components/ProfilePictureManager';

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
  role?: string;
  fullName?: string;
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
        // Fetch all users with complete data from the main users API
        const usersResponse = await fetch('/api/users');
        if (!usersResponse.ok) throw new Error('Failed to fetch users');
        const usersData = await usersResponse.json();
        
        // Filter to only include beheerder users and ensure unique IDs
        const beheerders = (usersData || []).filter((user: UserProfile, index: number, array: UserProfile[]) => 
          user.role === 'beheerder' && array.findIndex(u => u._id === user._id) === index
        );
        
        // Fetch current contact persons
        const contactsResponse = await fetch('/api/contacts');
        if (!contactsResponse.ok) throw new Error('Failed to fetch contacts');
        const contactsData = await contactsResponse.json();
        
        // Get complete user data for current contacts from the beheerders list
        const contactsWithDetails = [];
        const seenContactIds = new Set();
        
        for (const contact of (contactsData.contactPersons || [])) {
          // Skip if we've already processed this contact ID
          if (seenContactIds.has(contact._id)) {
            continue;
          }
          seenContactIds.add(contact._id);
          
          const completeUserData = beheerders.find((user: UserProfile) => user._id === contact._id);
          if (completeUserData) {
            contactsWithDetails.push(completeUserData);
          } else {
            // Fallback to original contact data if not found in beheerders
            contactsWithDetails.push(contact);
          }
        }
        
        setUsers(beheerders);
        setCurrentContacts(contactsWithDetails);
        
        // Pre-select current contacts
        setSelectedUsers(contactsWithDetails.map((user: UserProfile) => user._id));
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
    if (user.fullName) {
      return user.fullName;
    }
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || "Geen naam";
  };

  // Helper function to get user's function
  const getUserFunction = (user: UserProfile) => {
    return user.function || 'Geen functie';
  };

  // Helper function to get user's phone number
  const getUserPhoneNumber = (user: UserProfile) => {
    return user.phoneNumber || 'Geen telefoonnummer';
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
    <div className="text-gray-800 p-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
        <Mail size={24} className="sm:w-[24px] sm:h-[24px]" /> Contact Personen
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
      
      <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <UserCheck size={20} /> Huidige contact personen
        </h3>
        
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : currentContacts.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">Geen contact personen gevonden.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {currentContacts.map((contact, index) => (
              <div key={`current-contact-${contact._id}-${index}`} className="bg-gray-50 p-4 rounded-lg flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="flex-shrink-0">
                  <ProfilePictureManager
                    userId={contact._id}
                    name={getFullName(contact)}
                    initial={contact.initial}
                    size={64}
                    editable={false}
                    showButtons={false}
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="text-lg font-semibold text-black">{getFullName(contact)}</h4>
                  <p className="text-gray-600">Functie: {getUserFunction(contact)}</p>
                  <p className="text-gray-600">Telefoonnummer: {getUserPhoneNumber(contact)}</p>
                  <p className="text-gray-600">
                    E-mail:{" "}
                    <a href={`mailto:${contact.email}`} className="text-blue-500">
                      {contact.email}
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <User size={20} /> Selecteer Contact Persoon
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          Selecteer maximaal 2 gebruikers die als contact personen worden weergegeven op de contactpagina.
        </p>
        
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : users.length === 0 ? (
          <p className="text-yellow-600 p-4 bg-yellow-50 rounded-lg">Geen beheerders gevonden om als contactpersoon te selecteren.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
              {users.map((user, index) => (
                <div 
                  key={`user-selection-${user._id}-${index}`} 
                  className={`border rounded-lg p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 cursor-pointer transition-colors ${
                    selectedUsers.includes(user._id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => toggleUserSelection(user._id)}
                >
                  <div className="relative flex-shrink-0">
                    <ProfilePictureManager
                      userId={user._id}
                      name={getFullName(user)}
                      initial={user.initial}
                      size={64}
                      editable={false}
                      showButtons={false}
                    />
                    {selectedUsers.includes(user._id) && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                        <CheckCircle size={14} />
                      </div>
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="text-lg font-medium">{getFullName(user)}</h4>
                    <p className="text-gray-600">{getUserFunction(user)}</p>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-gray-600">{getUserPhoneNumber(user)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center sm:justify-end">
              <button
                className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
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