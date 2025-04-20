"use client";

import { useState, useEffect } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  parseISO,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay
} from "date-fns";
import { nl } from "date-fns/locale";

interface Event {
  _id: string;
  date: string;
  title: string;
  description: string;
  time: string;
  location: string;
  author: string;
}

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]); 
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Beschikbare tijdsopties op 15-minuten intervallen
  const timeOptions = generateTimeOptions();
  
  function generateTimeOptions() {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        options.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return options;
  }
  
  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });

  // Get current week dates
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start week on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Evenementen ophalen van de API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/events');
        
        if (!res.ok) {
          throw new Error('Er is een fout opgetreden bij het ophalen van de evenementen');
        }
        
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error('Fout bij ophalen evenementen:', err);
        setError('Er is een fout opgetreden bij het ophalen van de evenementen');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const previousWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const nextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const goToCurrentDate = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => event.date === format(date, "yyyy-MM-dd"));
  };

  // Helper function to sort events by time
  const sortEventsByTime = (events: Event[]) => {
    return [...events].sort((a, b) => a.time.localeCompare(b.time));
  };

  // Get days with events for the current week
  const getDaysWithEvents = () => {
    return weekDays.filter(day => getEventsForDate(day).length > 0);
  };

  // Check if there are any events this week
  const hasEventsThisWeek = getDaysWithEvents().length > 0;

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[70vh]">
  {/* Calendar */}
  <div className="flex-1 bg-white rounded-xl shadow p-6 flex flex-col justify-between">
    {/* Navigation + Header */}
    <div className="flex justify-between items-center text-yellow-500 text-sm font-semibold mb-4">
      <button onClick={previousMonth}>← Vorige maand</button>
      <div className="text-center">
        <h2 className="text-xl font-bold text-[#1E2A78] mb-1">Agenda</h2>
        <div className="text-[#1E2A78] font-semibold text-md mb-2">
          {format(currentDate, "LLLL yyyy", { locale: nl })}
        </div>
        <button
          onClick={goToCurrentDate}
          className="px-4 py-1 border border-yellow-400 text-yellow-500 text-sm font-semibold rounded-md hover:bg-yellow-100"
        >
          Naar Heden
        </button>
      </div>
      <button onClick={nextMonth}>Volgende maand →</button>
    </div>

    {/* Weekday Labels */}
    <div className="hidden sm:grid grid-cols-7 text-center text-xs font-semibold text-[#1E2A78] mb-2 px-2">
      {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((day) => (
        <div key={day} className="uppercase">{day}</div>
      ))}
    </div>

    {/* Calendar Days - Responsive, with compact spacing and consistent height */}
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-y-1 sm:gap-y-2 text-sm px-2 sm:px-0">
      {days.map((day) => {
        const hasEvent = getEventsForDate(day).length > 0;
        const isCurrent = isToday(day);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isOutside = !isSameMonth(day, currentDate);

        return (
          <div
            key={day.toString()}
            onClick={() => setSelectedDate(day)}
            className={`text-center py-2 sm:py-3 rounded-lg cursor-pointer transition text-sm sm:text-base h-[48px] sm:h-[56px] flex flex-col items-center justify-center
              ${isSelected
                ? "border-2 border-yellow-400 text-yellow-600 font-bold"
                : isCurrent
                ? "border border-yellow-400 text-yellow-500 font-bold"
                : isOutside
                ? "text-gray-300"
                : "text-[#1E2A78]"
              }
              hover:bg-yellow-100`}
          >
            <span>{format(day, "d")}</span>
            {hasEvent && (
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-1"></span>
            )}
          </div>
        );
      })}
    </div>
  </div>

  {/* Week Agenda Sidebar */}
  <div className="w-full md:w-80 bg-white rounded-xl shadow p-6 flex flex-col">
    <h3 className="text-xl font-bold text-[#1E2A78] mb-4">Week Agenda</h3>

    {eachDayOfInterval({
      start: startOfWeek(currentDate, { locale: nl }),
      end: endOfWeek(currentDate, { locale: nl }),
    }).map((day) => {
      const eventsForDay = getEventsForDate(day);
      const isEmpty = eventsForDay.length === 0;

      return (
        <div key={day.toString()} className="mb-3">
          <div className={`font-semibold ${isEmpty ? "text-gray-400" : "text-yellow-500"}`}>
            {format(day, "eeee", { locale: nl })} – {format(day, "d MMMM yyyy", { locale: nl })}
          </div>

          {eventsForDay.map((event) => (
            <div
              key={event._id}
              className="bg-white shadow-md rounded-md px-4 py-2 mt-2 flex justify-between items-start"
            >
              <div>
                <div className="text-sm font-semibold text-[#1E2A78]">{event.title}</div>
                <div className="text-xs text-gray-500">{event.description}</div>
              </div>
              <div className="text-yellow-500 text-sm font-bold whitespace-nowrap">{event.time}</div>
            </div>
          ))}
        </div>
      );
    })}
  </div>
</div>
  );
}