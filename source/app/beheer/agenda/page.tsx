// app/beheer/agenda/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Calendar, Clock, Users, MapPin } from 'lucide-react';

interface Event {
  _id?: string;
  title: string;
  description: string;
  type: 'eenmalig' | 'standaard' | 'dagelijks' | 'wekelijks';
  startTime: string;
  endTime: string;
  author: string;
  location: string;
  zaal: string;
  date: string;
  recurringDays?: number[];
  recurringWeeks?: number[];
  recurringDayOfWeek?: number;
  recurringId?: string; // Add this to group recurring events
}

interface GroupedEvent {
  id: string;
  title: string;
  description: string;
  type: 'eenmalig' | 'standaard' | 'dagelijks' | 'wekelijks';
  startTime: string;
  endTime: string;
  author: string;
  location: string;
  zaal: string;
  date: string;
  recurringDays?: number[];
  recurringWeeks?: number[];
  recurringDayOfWeek?: number;
  recurringId?: string;
  eventCount?: number; // Number of occurrences
  events?: Event[]; // Original events for this group
}

const EVENT_TYPES = [
  { value: 'eenmalig', label: 'Eenmalig' },
  { value: 'standaard', label: 'Standaard' },
  { value: 'dagelijks', label: 'Dagelijks' },
  { value: 'wekelijks', label: 'Wekelijks' }
];

const ZALEN = [
  'Zaal 1', 'Zaal 2', 'Zaal 3', 'Zaal 4', 'Zaal 5',
  'Zaal 6', 'Zaal 7', 'Zaal 8', 'Zaal 9', 'Zaal 10'
];

const WEEKDAYS = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];

// Utility functions for Netherlands timezone handling
const formatTimeForInput = (timeString: string): string => {
  if (!timeString) return '';
  
  if (timeString.match(/^\d{2}:\d{2}$/)) {
    return timeString;
  }
  
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Amsterdam'
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', { timeZone: 'Europe/Amsterdam' });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

const createNetherlandsDateTime = (dateString: string, timeString: string): string => {
  if (!dateString || !timeString) return '';
  
  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date(`${dateString}T${hours}:${minutes}:00`);
    const netherlandsDate = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Amsterdam' }));
    return netherlandsDate.toISOString();
  } catch (error) {
    console.error('Error creating Netherlands datetime:', error);
    return '';
  }
};

// Function to group recurring events
const groupEvents = (events: Event[]): GroupedEvent[] => {
  const grouped: { [key: string]: GroupedEvent } = {};
  
  events.forEach(event => {
    if (event.type === 'eenmalig') {
      // Single events remain individual
      grouped[event._id || ''] = {
        id: event._id || '',
        ...event,
        eventCount: 1,
        events: [event]
      };
    } else {
      // Group recurring events by title, type, time, and location
      const groupKey = `${event.title}-${event.type}-${event.startTime}-${event.endTime}-${event.zaal}-${event.author}`;
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          id: groupKey,
          ...event,
          eventCount: 1,
          events: [event]
        };
      } else {
        grouped[groupKey].eventCount = (grouped[groupKey].eventCount || 0) + 1;
        grouped[groupKey].events?.push(event);
      }
    }
  });
  
  return Object.values(grouped);
};

// Function to get recurring pattern description
const getRecurringDescription = (event: GroupedEvent): string => {
  switch (event.type) {
    case 'standaard':
      if (event.recurringDayOfWeek !== undefined) {
        return `Elke ${WEEKDAYS[event.recurringDayOfWeek].toLowerCase()}`;
      }
      return 'Standaard herhaling';
    case 'dagelijks':
      if (event.recurringDays && event.recurringDays.length > 0) {
        const days = event.recurringDays.map(d => WEEKDAYS[d]).join(', ');
        return `Dagelijks: ${days}`;
      }
      return 'Dagelijks';
    case 'wekelijks':
      return 'Wekelijks';
    default:
      return '';
  }
};

export default function BeheerAgendaPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [groupedEvents, setGroupedEvents] = useState<GroupedEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GroupedEvent | null>(null);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Event>({
    title: '',
    description: '',
    type: 'eenmalig',
    startTime: '',
    endTime: '',
    author: '',
    location: '',
    zaal: 'Zaal 1',
    date: '',
    recurringDays: [],
    recurringWeeks: [],
    recurringDayOfWeek: undefined
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const grouped = groupEvents(events);
    setGroupedEvents(grouped);
  }, [events]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      
      const formattedEvents = data.map((event: Event) => ({
        ...event,
        startTime: formatTimeForInput(event.startTime),
        endTime: formatTimeForInput(event.endTime),
        date: formatDateForInput(event.date)
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const TIME_OPTIONS = generateTimeOptions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const eventData = {
        ...formData,
        startTime: createNetherlandsDateTime(formData.date, formData.startTime),
        endTime: createNetherlandsDateTime(formData.date, formData.endTime),
        date: new Date(`${formData.date}T00:00:00`).toISOString()
      };
      
      const url = editingEvent ? `/api/events/${editingEvent.events?.[0]._id}` : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        fetchEvents();
        closeModal();
      } else {
        console.error('Error saving event');
      }
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDeleteGroup = async (groupedEvent: GroupedEvent) => {
    const eventCount = groupedEvent.eventCount || 1;
    const confirmMessage = eventCount > 1 
      ? `Weet je zeker dat je alle ${eventCount} evenementen van "${groupedEvent.title}" wilt verwijderen?`
      : `Weet je zeker dat je dit evenement wilt verwijderen?`;
    
    if (confirm(confirmMessage)) {
      try {
        // Delete all events in the group
        const deletePromises = groupedEvent.events?.map(event => 
          fetch(`/api/events/${event._id}`, { method: 'DELETE' })
        ) || [];
        
        await Promise.all(deletePromises);
        fetchEvents();
      } catch (error) {
        console.error('Error deleting events:', error);
      }
    }
  };

  const toggleExpanded = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const openModal = (event?: GroupedEvent) => {
    if (event) {
      setEditingEvent(event);
      const firstEvent = event.events?.[0] || event;
      setFormData({
        ...firstEvent,
        startTime: formatTimeForInput(firstEvent.startTime),
        endTime: formatTimeForInput(firstEvent.endTime),
        date: formatDateForInput(firstEvent.date)
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        type: 'eenmalig',
        startTime: '',
        endTime: '',
        author: '',
        location: '',
        zaal: 'Zaal 1',
        date: '',
        recurringDays: [],
        recurringWeeks: [],
        recurringDayOfWeek: undefined
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRecurringDaysChange = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      recurringDays: prev.recurringDays?.includes(dayIndex)
        ? prev.recurringDays.filter(d => d !== dayIndex)
        : [...(prev.recurringDays || []), dayIndex]
    }));
  };

  const handleRecurringWeeksChange = (weekIndex: number) => {
    setFormData(prev => ({
      ...prev,
      recurringWeeks: prev.recurringWeeks?.includes(weekIndex)
        ? prev.recurringWeeks.filter(w => w !== weekIndex)
        : [...(prev.recurringWeeks || []), weekIndex]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agenda Beheer</h1>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nieuw Evenement
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid gap-4">
          {groupedEvents.map((groupedEvent) => (
            <div key={groupedEvent.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{groupedEvent.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        groupedEvent.type === 'eenmalig' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {EVENT_TYPES.find(t => t.value === groupedEvent.type)?.label}
                      </span>
                      {groupedEvent.eventCount && groupedEvent.eventCount > 1 && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                          {groupedEvent.eventCount} evenementen
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{groupedEvent.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {groupedEvent.type === 'eenmalig' 
                            ? new Date(groupedEvent.date).toLocaleDateString('nl-NL', { timeZone: 'Europe/Amsterdam' })
                            : getRecurringDescription(groupedEvent)
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{groupedEvent.startTime} - {groupedEvent.endTime}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{groupedEvent.zaal}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{groupedEvent.author}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {groupedEvent.eventCount && groupedEvent.eventCount > 1 && (
                      <button
                        onClick={() => toggleExpanded(groupedEvent.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {expandedEvents.has(groupedEvent.id) ? 'Inklappen' : 'Uitklappen'}
                      </button>
                    )}
                    <button
                      onClick={() => openModal(groupedEvent)}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-2"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(groupedEvent)}
                      className="text-red-600 hover:text-red-800 transition-colors p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Expanded individual events */}
                {expandedEvents.has(groupedEvent.id) && groupedEvent.events && groupedEvent.events.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Individuele evenementen:</h4>
                    <div className="space-y-2">
                      {groupedEvent.events.map((event, index) => (
                        <div key={event._id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                          <span className="text-sm">
                            {new Date(event.date).toLocaleDateString('nl-NL', { timeZone: 'Europe/Amsterdam' })} - 
                            {event.startTime} tot {event.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingEvent ? 'Evenement Bewerken' : 'Nieuw Evenement'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titel *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {EVENT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beschrijving *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Date (for eenmalig only) */}
                  {formData.type === 'eenmalig' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Datum *
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Starttijd *
                    </label>
                    <select
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Eindtijd *
                    </label>
                    <select
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Organizer & Zaal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organisator *
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zaal *
                    </label>
                    <select
                      name="zaal"
                      value={formData.zaal}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ZALEN.map(zaal => (
                        <option key={zaal} value={zaal}>
                          {zaal}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Locatie *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Recurring Options */}
                {formData.type === 'dagelijks' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selecteer dagen:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {WEEKDAYS.map((day, index) => (
                        <label key={day} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.recurringDays?.includes(index) || false}
                            onChange={() => handleRecurringDaysChange(index)}
                            className="mr-2"
                          />
                          {day}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {formData.type === 'standaard' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dag van de week:
                    </label>
                    <select
                      name="recurringDayOfWeek"
                      value={formData.recurringDayOfWeek || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecteer dag</option>
                      {WEEKDAYS.map((day, index) => (
                        <option key={day} value={index}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.type === 'wekelijks' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selecteer weken (1-52):
                    </label>
                    <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto">
                      {Array.from({ length: 52 }, (_, i) => i + 1).map(week => (
                        <label key={week} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.recurringWeeks?.includes(week) || false}
                            onChange={() => handleRecurringWeeksChange(week)}
                            className="mr-1"
                          />
                          {week}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {editingEvent ? 'Bijwerken' : 'Opslaan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
}