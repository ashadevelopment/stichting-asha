// app/agenda/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  description: string;
  type: string;
  startTime: string;
  endTime: string;
  author: string;
  location: string;
  zaal: string;
  date: string;
}

const WEEKDAYS = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
const MONTHS = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
];

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedWeekday, setSelectedWeekday] = useState<string>('');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  useEffect(() => {
    fetchEvents();
  }, [currentMonth, currentYear]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/events?month=${currentMonth + 1}&year=${currentYear}`);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const getDaysInMonth = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    // Fix: Properly adjust for Monday = 0 system
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const days = [];
    
    // Previous month days
    const prevMonthDate = new Date(currentYear, currentMonth, 0);
    const prevMonth = prevMonthDate.getDate();
    const prevMonthYear = prevMonthDate.getFullYear();
    const prevMonthMonth = prevMonthDate.getMonth();
    
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonth - i,
        isCurrentMonth: false,
        date: new Date(prevMonthYear, prevMonthMonth, prevMonth - i)
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(currentYear, currentMonth, day)
      });
    }
    
    // Next month days to fill the grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth + 1, day)
      });
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    // Fix: Create date string in local timezone to match event dates
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    return events.filter(event => event.date === dateString);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get events for the current week
  const getCurrentWeekEvents = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);
    
    const weekEvents: { [key: string]: Event[] } = {};
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      // Fix: Use same date string format as getEventsForDate
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const dayNum = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${dayNum}`;
      const dayName = WEEKDAYS[i];
      
      weekEvents[dayName] = events.filter(event => event.date === dateString);
    }
    
    return weekEvents;
  };

  const days = getDaysInMonth();
  const currentWeekEvents = getCurrentWeekEvents();

  return (
    <div className="min-h-screen bg-[#F2F2F2] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-[#1E2A78] mb-8 mt-18">Agenda</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">Week Agenda</h2>
              <div className="space-y-2">
                {WEEKDAYS.map((day) => {
                  const dayEvents = currentWeekEvents[day] || [];
                  const hasEvents = dayEvents.length > 0;
                  
                  return (
                    <div key={day} className="w-full">
                      <button
                        onClick={() => setSelectedWeekday(selectedWeekday === day ? '' : day)}
                        className={`w-full text-left py-2 px-3 rounded transition-colors ${
                          selectedWeekday === day
                            ? 'bg-blue-100 text-blue-900'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {day}
                      </button>
                      
                      {hasEvents && (
                        <div className="mt-1 ml-3 space-y-1">
                          {dayEvents.map((event) => (
                            <div key={event._id} className="text-xs">
                              <div className="font-medium text-blue-900">{event.title}</div>
                              <div className="text-gray-600">{event.description}</div>
                              <div className="text-yellow-600 font-medium">
                                {event.startTime} - {event.endTime}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6 mx-auto max-w-4xl">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <h2 className="text-2xl font-bold text-blue-900">
                  {MONTHS[currentMonth]} {currentYear}
                </h2>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  
                  <button 
                    onClick={goToToday}
                    className="bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    Heden
                  </button>
                </div>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="text-center font-medium text-gray-700 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((dayInfo, index) => {
                  const dayEvents = getEventsForDate(dayInfo.date);
                  const hasEvents = dayEvents.length > 0;
                  const isCurrentDay = isToday(dayInfo.date);
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 transition-colors border border-gray-100 ${
                        !dayInfo.isCurrentMonth
                          ? 'text-gray-400 bg-gray-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isCurrentDay
                          ? 'bg-yellow-400 text-black w-6 h-6 rounded-full flex items-center justify-center'
                          : ''
                      }`}>
                        {dayInfo.day}
                      </div>
                      
                      {hasEvents && (
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event._id}
                              onClick={() => setSelectedEvent(event)}
                              className="text-xs p-1 bg-blue-100 text-blue-900 rounded cursor-pointer hover:bg-blue-200 transition-colors"
                            >
                              <div className="font-medium truncate">{event.title}</div>
                              <div className="text-yellow-600">
                                {event.startTime} - {event.endTime}
                              </div>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-600">
                              +{dayEvents.length - 2} meer
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-blue-900">{selectedEvent.title}</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><strong>Beschrijving:</strong> {selectedEvent.description}</p>
                <p><strong>Tijd:</strong> {selectedEvent.startTime} - {selectedEvent.endTime}</p>
                <p><strong>Organisator:</strong> {selectedEvent.author}</p>
                <p><strong>Locatie:</strong> {selectedEvent.location}</p>
                <p><strong>Zaal:</strong> {selectedEvent.zaal}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}