// app/agenda/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Menu, X } from 'lucide-react';

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

const WEEKDAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const WEEKDAYS_FULL = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
const MONTHS = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
];

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedWeekday, setSelectedWeekday] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [isMobile, setIsMobile] = useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  useEffect(() => {
    fetchEvents();
  }, [currentMonth, currentYear]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const days = [];
    
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
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(currentYear, currentMonth, day)
      });
    }
    
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

  const getCurrentWeekEvents = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const weekEvents: { [key: string]: Event[] } = {};
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const dayNum = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${dayNum}`;
      const dayName = WEEKDAYS_FULL[i];
      
      weekEvents[dayName] = events.filter(event => event.date === dateString);
    }
    
    return weekEvents;
  };

  const days = getDaysInMonth();
  const currentWeekEvents = getCurrentWeekEvents();

  const WeekSidebar = () => (
    <div className="bg-white rounded-lg shadow-md p-4 mt-18">
      <h2 className="text-lg font-semibold text-blue-900 mb-4">Week Agenda</h2>
      <div className="space-y-2">
        {WEEKDAYS_FULL.map((day) => {
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
                      <div className="text-gray-600 truncate">{event.description}</div>
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
  );

  const CalendarGrid = () => (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        <h2 className="text-lg sm:text-2xl font-bold text-blue-900">
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <button 
            onClick={goToToday}
            className="bg-blue-900 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-800 transition-colors text-xs sm:text-sm"
          >
            Heden
          </button>
        </div>
      </div>

      {/* View Mode Toggle - Small screens only */}
      {!isMobile && window?.innerWidth && window.innerWidth < 1024 && (
        <div className="flex justify-center mb-4">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'month'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Maand
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                viewMode === 'week'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Week
            </button>
          </div>
        </div>
      )}

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {(isMobile ? WEEKDAYS : WEEKDAYS_FULL).map((day) => (
          <div key={day} className="text-center font-medium text-gray-700 py-2 text-xs sm:text-sm">
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
              className={`min-h-[60px] sm:min-h-[100px] p-1 sm:p-2 transition-colors border border-gray-100 ${
                !dayInfo.isCurrentMonth
                  ? 'text-gray-400 bg-gray-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className={`text-xs sm:text-sm font-medium mb-1 ${
                isCurrentDay
                  ? 'bg-yellow-400 text-black w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs'
                  : ''
              }`}>
                {dayInfo.day}
              </div>
              
              {hasEvents && (
                <div className="space-y-1">
                  {dayEvents.slice(0, isMobile ? 1 : 2).map((event) => (
                    <div
                      key={event._id}
                      onClick={() => setSelectedEvent(event)}
                      className="text-xs p-1 bg-blue-100 text-blue-900 rounded cursor-pointer hover:bg-blue-200 transition-colors"
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {!isMobile && (
                        <div className="text-yellow-600 text-xs">
                          {event.startTime} - {event.endTime}
                        </div>
                      )}
                    </div>
                  ))}
                  {dayEvents.length > (isMobile ? 1 : 2) && (
                    <div className="text-xs text-gray-600">
                      +{dayEvents.length - (isMobile ? 1 : 2)} meer
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const WeekView = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-bold text-blue-900 mb-4">Deze Week</h2>
        <div className="space-y-4">
          {WEEKDAYS_FULL.map((dayName, index) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + index);
            const dayEvents = getEventsForDate(date);
            const isCurrentDay = isToday(date);
            
            return (
              <div key={dayName} className={`p-3 rounded-lg border ${
                isCurrentDay ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-blue-900">{dayName}</h3>
                  <span className="text-sm text-gray-600">{date.getDate()}</span>
                </div>
                
                {dayEvents.length > 0 ? (
                  <div className="space-y-2">
                    {dayEvents.map((event) => (
                      <div
                        key={event._id}
                        onClick={() => setSelectedEvent(event)}
                        className="p-2 bg-blue-100 rounded cursor-pointer hover:bg-blue-200 transition-colors"
                      >
                        <div className="font-medium text-blue-900">{event.title}</div>
                        <div className="text-sm text-gray-600">{event.description}</div>
                        <div className="text-sm text-yellow-600 font-medium">
                          {event.startTime} - {event.endTime}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Geen evenementen</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] p-3 sm:p-6 pt-20 sm:pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            {/* Empty div for spacing */}
            <div className="lg:hidden"></div>
            
            <h1 className="text-3xl font-bold text-[#1E2A78] mx-auto">Agenda</h1>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-white shadow-md"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop Sidebar - Always visible on large screens */}
          <div className="lg:col-span-1 hidden lg:block">
            <WeekSidebar />
          </div>
          
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
              <div className="fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 translate-x-0 lg:hidden">
                <div className="h-full bg-[#F2F2F2] p-4 overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-[#1E2A78]">Menu</h2>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-2 rounded-lg bg-white shadow-md"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <WeekSidebar />
                </div>
              </div>
            </>
          )}
          
          {/* Main Calendar */}
          <div className="lg:col-span-3">
            {isMobile && viewMode === 'week' ? <WeekView /> : <CalendarGrid />}
          </div>
        </div>

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-blue-900 pr-4">{selectedEvent.title}</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl flex-shrink-0"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <strong className="text-blue-900">Beschrijving:</strong>
                  <p className="mt-1">{selectedEvent.description}</p>
                </div>
                <div>
                  <strong className="text-blue-900">Tijd:</strong>
                  <p className="mt-1">{selectedEvent.startTime} - {selectedEvent.endTime}</p>
                </div>
                <div>
                  <strong className="text-blue-900">Organisator:</strong>
                  <p className="mt-1">{selectedEvent.author}</p>
                </div>
                <div>
                  <strong className="text-blue-900">Locatie:</strong>
                  <p className="mt-1">{selectedEvent.location}</p>
                </div>
                <div>
                  <strong className="text-blue-900">Zaal:</strong>
                  <p className="mt-1">{selectedEvent.zaal}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}