"use client"

import { useState, useEffect } from 'react'
import { UserCheck, FileText, Check, X, User, Upload, Trash2 } from 'lucide-react'
import ConfirmationDialog from '../../../components/ConfirmationDialog'

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
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export default function VrijwilligersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [needsRefresh, setNeedsRefresh] = useState(false)
  
  // Bevestigingsdialoog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [volunteerToDelete, setVolunteerToDelete] = useState<string | null>(null)

  // Fetch volunteers when component mounts
  useEffect(() => {
    fetchVolunteers();
  }, []);

  // Also fetch when needs refresh changes
  useEffect(() => {
    if (needsRefresh) {
      fetchVolunteers();
      setNeedsRefresh(false);
    }
  }, [needsRefresh]);

    const fetchVolunteers = async () => {
    try {
      setLoading(true);
      // Explicitly request all volunteers
      const response = await fetch('/api/volunteers?status=all')
      if (!response.ok) throw new Error('Fout bij ophalen vrijwilligers')
      const data = await response.json()
      
      // Fix: Extract the volunteers array from the response
      if (data.volunteers) {
        setVolunteers(data.volunteers) // Use data.volunteers instead of data
      } else if (Array.isArray(data)) {
        setVolunteers(data) // Fallback if the API returns array directly
      } else {
        console.error('Unexpected API response structure:', data)
        setVolunteers([])
      }
    } catch (err) {
      setError('Er is een fout opgetreden bij het laden van vrijwilligers')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      console.log(`Approving volunteer with ID: ${id}`);
      
      const response = await fetch(`/api/volunteers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'approve' })
      });
      
      const data = await response.json();
      console.log("Approval response:", data);
      
      if (!response.ok) {
        throw new Error('Fout bij goedkeuren vrijwilliger: ' + (data.error || response.statusText));
      }
      
      // Update the volunteer status locally without full refresh
      setVolunteers(prev => 
        prev.map(vol => 
          vol._id === id ? { ...vol, status: 'approved' } : vol
        )
      );
      
      // Show success message
      setSuccessMessage('Vrijwilliger succesvol goedgekeurd');
      // Clear the success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setError(`Er is een fout opgetreden bij het goedkeuren: ${err instanceof Error ? err.message : 'Onbekende fout'}`);
      // Clear error message after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };  

  const handleDeny = async (id: string) => {
    try {
      console.log(`Denying volunteer with ID: ${id}`);
      
      const response = await fetch(`/api/volunteers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'reject' })
      });
      
      const data = await response.json();
      console.log("Rejection response:", data);
      
      if (!response.ok) {
        throw new Error('Fout bij afkeuren vrijwilliger: ' + (data.error || response.statusText));
      }
      
      // Update the volunteer status locally without full refresh
      setVolunteers(prev => 
        prev.map(vol => 
          vol._id === id ? { ...vol, status: 'rejected' } : vol
        )
      );
      
      // Show success message
      setSuccessMessage('Vrijwilliger succesvol afgewezen');
      // Clear the success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setError(`Er is een fout opgetreden bij het afkeuren: ${err instanceof Error ? err.message : 'Onbekende fout'}`);
      // Clear error message after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDeleteClick = (id: string) => {
    setVolunteerToDelete(id)
    setIsDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!volunteerToDelete) return;
    
    try {
      console.log(`Deleting volunteer with ID: ${volunteerToDelete}`);
      
      const response = await fetch(`/api/volunteers/${volunteerToDelete}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      console.log("Delete response:", data);
      
      if (!response.ok) {
        throw new Error('Fout bij verwijderen vrijwilliger: ' + (data.error || response.statusText));
      }
      
      // Remove from local state
      setVolunteers(prev => prev.filter(vol => vol._id !== volunteerToDelete));
      
      // Show success message
      setSuccessMessage('Vrijwilliger succesvol verwijderd');
      // Clear the success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Reset dialog state
      setIsDialogOpen(false);
      setVolunteerToDelete(null);
    } catch (err) {
      console.error(err);
      setError(`Er is een fout opgetreden bij het verwijderen: ${err instanceof Error ? err.message : 'Onbekende fout'}`);
      
      // Reset dialog state
      setIsDialogOpen(false);
      setVolunteerToDelete(null);
      
      // Clear error message after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const cancelDelete = () => {
    setIsDialogOpen(false)
    setVolunteerToDelete(null)
  }

  const openFile = async (volunteerId: string, fileType: 'cv' | 'motivationLetter') => {
    try {
      console.log(`Opening ${fileType} for volunteer ID: ${volunteerId}`);
      
      const response = await fetch(`/api/volunteers/${volunteerId}/file?type=${fileType}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Could not fetch file: ${errorData.error || response.statusText}`);
      }
      
      const fileData = await response.json();
      
      if (!fileData || !fileData.data) {
        throw new Error('Invalid file data received');
      }
      
      const linkSource = `data:${fileData.contentType};base64,${fileData.data}`;
      const downloadLink = document.createElement('a');
      
      downloadLink.href = linkSource;
      downloadLink.download = fileData.filename;
      downloadLink.click();
    } catch (err) {
      console.error('Error opening file:', err);
      setError(`Fout bij het openen van het bestand: ${err instanceof Error ? err.message : 'Onbekende fout'}`);
      setTimeout(() => setError(null), 5000);
    }
  };

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

  // Filter volunteers by status
  const pendingVolunteers = volunteers.filter(vol => vol.status === 'pending')
  const approvedVolunteers = volunteers.filter(vol => vol.status === 'approved')
  const deniedVolunteers = volunteers.filter(vol => vol.status === 'rejected')

  return (
    <div className="text-gray-800 px-6 py-4">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <UserCheck size={24} /> Vrijwilligers
      </h2>

      {/* Error Message - in consistent style with other admin pages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Success Message - in consistent style with other admin pages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-4 transition-opacity duration-300">
          {successMessage}
        </div>
      )}

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
              <div className="mt-2 flex flex-wrap gap-2">
                <button 
                  onClick={() => handleApprove(volunteer._id)}
                  className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1 flex-inline"
                >
                  <Check size={16} /> Goedkeuren
                </button>
                <button 
                  onClick={() => handleDeny(volunteer._id)}
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1 flex-inline"
                >
                  <X size={16} /> Afkeuren
                </button>
                <button 
                  onClick={() => openFile(volunteer._id, 'cv')}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Bekijk CV
                </button>
                <button 
                  onClick={() => openFile(volunteer._id, 'motivationLetter')}
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
                  onClick={() => openFile(volunteer._id, 'cv')}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Bekijk CV
                </button>
                <button 
                  onClick={() => openFile(volunteer._id, 'motivationLetter')}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Bekijk Motivatie
                </button>
                <button 
                  onClick={() => handleDeleteClick(volunteer._id)}
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
                  onClick={() => handleDeleteClick(volunteer._id)}
                  className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bevestigingsdialoog voor verwijderen */}
      <ConfirmationDialog 
        isOpen={isDialogOpen}
        title="Vrijwilliger verwijderen"
        message="Weet u zeker dat u deze vrijwilliger wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  )
}