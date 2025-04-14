"use client"

import { useState, useEffect } from 'react'
import { CalendarPlus, Edit, Trash2, Calendar, Clock, MapPin } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { format, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale'
import ConfirmationDialog from '../../../components/ConfirmationDialog'

interface Event {
  _id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  author: string
}

export default function AgendaPage() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Form state
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [showForm, setShowForm] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: ''
  })

  // Bevestigingsdialoog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)

  // Beschikbare tijdsopties op 15-minuten intervallen
  const timeOptions = generateTimeOptions()

  // Functie om tijdsopties te genereren met 15-minuten intervallen
  function generateTimeOptions() {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, '0')
        const formattedMinute = minute.toString().padStart(2, '0')
        options.push(`${formattedHour}:${formattedMinute}`)
      }
    }
    return options
  }

  // Evenementen ophalen
  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/events')
      
      if (!res.ok) {
        throw new Error('Fout bij ophalen van evenementen')
      }
      
      const data = await res.json()
      setEvents(data)
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden')
      console.error('Fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Bij component mount de evenementen ophalen
  useEffect(() => {
    fetchEvents()
  }, [])

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      date: '',
      time: '',
      location: ''
    })
    setCurrentEvent(null)
    setFormMode('create')
  }

  const handleEditClick = (event: Event) => {
    setCurrentEvent(event)
    setForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location
    })
    setFormMode('edit')
    setShowForm(true)
    
    // Scroll naar boven voor mobiele gebruikers
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAddNewClick = () => {
    resetForm()
    setFormMode('create')
    setShowForm(true)
    
    // Scroll naar boven voor mobiele gebruikers
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Initieer verwijderen - open de bevestigingsdialoog
  const handleDeleteClick = (id: string) => {
    setEventToDelete(id)
    setIsDialogOpen(true)
  }

  // Bevestig verwijderen
  const confirmDelete = async () => {
    if (!eventToDelete) return
    
    try {
      const res = await fetch(`/api/events/${eventToDelete}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) {
        throw new Error('Fout bij verwijderen van evenement')
      }
      
      // Verwijder het evenement uit de lokale state
      setEvents(events.filter(event => event._id !== eventToDelete))
      
      // Toon een tijdelijke succesmelding
      setError('') // Wis eerst eventuele fouten
      setSuccessMessage('Evenement is succesvol verwijderd')
      setTimeout(() => setSuccessMessage(''), 3000) // Verberg na 3 seconden
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden')
      console.error('Delete error:', err)
    } finally {
      // Sluit de dialoog en reset de state
      setIsDialogOpen(false)
      setEventToDelete(null)
    }
  }

  // Annuleer verwijderen
  const cancelDelete = () => {
    setIsDialogOpen(false)
    setEventToDelete(null)
  }

  // Succes melding state
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validatie
    if (!form.title || !form.description || !form.date || !form.time || !form.location) {
      setError('Alle velden zijn verplicht')
      return
    }
    
    try {
      if (formMode === 'create') {
        // Nieuw evenement aanmaken
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(form)
        })
        
        if (!res.ok) {
          throw new Error('Fout bij aanmaken van evenement')
        }
        
        const newEvent = await res.json()
        setEvents([...events, newEvent])
        setSuccessMessage('Evenement is succesvol toegevoegd')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        // Bestaand evenement updaten
        const res = await fetch(`/api/events/${currentEvent?._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(form)
        })
        
        if (!res.ok) {
          throw new Error('Fout bij bijwerken van evenement')
        }
        
        const updatedEvent = await res.json()
        setEvents(events.map(event => 
          event._id === currentEvent?._id ? updatedEvent : event
        ))
        setSuccessMessage('Evenement is succesvol bijgewerkt')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
      
      // Reset form en sluit het formulier
      resetForm()
      setShowForm(false)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden')
      console.error('Submit error:', err)
    }
  }

  // Render check voor beheerders
  if (session?.user?.role !== 'beheerder') {
    return (
      <div className="text-gray-800 p-4">
        <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
          <CalendarPlus size={24} /> Agenda Beheer
        </h2>
        <p className="text-red-500">Je hebt geen toegang tot deze pagina. Alleen beheerders kunnen evenementen beheren.</p>
      </div>
    )
  }

  return (
    <div className="text-gray-800 p-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
        <CalendarPlus size={20} className="sm:w-[24px] sm:h-[24px]" /> Agenda Beheer
      </h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-4 transition-opacity duration-300">
          {successMessage}
        </div>
      )}
      
      {/* Knop voor toevoegen of verbergen/tonen formulier */}
      <button
        onClick={() => showForm ? setShowForm(false) : handleAddNewClick()}
        className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
      >
        <CalendarPlus size={16} className="sm:w-[18px] sm:h-[18px]" />
        {showForm ? 'Verberg formulier' : 'Nieuw evenement toevoegen'}
      </button>
      
      {/* Formulier */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold mb-4">
            {formMode === 'create' ? 'Nieuw evenement toevoegen' : 'Evenement bewerken'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titel</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2 text-black"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Beschrijving</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md p-2 text-black"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Datum</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-black"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tijd</label>
                <select
                  name="time"
                  value={form.time}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-black"
                  required
                >
                  <option value="">Selecteer tijd</option>
                  {timeOptions.map(time => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium mb-1">Locatie</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md p-2 text-black"
                  required
                />
              </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                {formMode === 'create' ? 'Toevoegen' : 'Bijwerken'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Annuleren
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Lijst van evenementen */}
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold mb-2">Evenementen</h3>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : events.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Geen evenementen gevonden.</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <h4 className="text-lg font-semibold">{event.title}</h4>
                  
                  <div className="flex gap-2 mt-1 sm:mt-0">
                    <button
                      onClick={() => handleEditClick(event)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Bewerk evenement"
                    >
                      <Edit size={18} />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteClick(event._id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Verwijder evenement"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-700 mt-2">{event.description}</p>
                
                <div className="mt-3 text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span>
                      {format(parseISO(event.date), 'd MMMM yyyy', { locale: nl })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span>{event.time} uur</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{event.location}</span>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  Toegevoegd door: {event.author}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Bevestigingsdialoog voor verwijderen */}
      <ConfirmationDialog 
        isOpen={isDialogOpen}
        title="Evenement verwijderen"
        message="Weet u zeker dat u dit evenement wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  )
}