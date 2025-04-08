"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from "date-fns";
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

  const goToCurrentDate = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => event.date === format(date, "yyyy-MM-dd"));
  };

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] flex flex-col items-center py-12">
      {/* Agenda Block */}
      <div className="w-full max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-[#1E2A78] mb-6 text-center">Agenda</h2>

        {/* Foutmelding weergeven indien nodig */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Buttons voor navigatie en naar huidige datum */}
        <div className="flex justify-between items-center mb-6 space-x-8">
          <button
            onClick={previousMonth}
            className="text-yellow-400 hover:text-yellow-500 font-semibold"
          >
            ← Vorige maand
          </button>
          <div className="text-xl font-semibold text-[#1E2A78]">
            {format(currentDate, "MMMM yyyy", { locale: nl })}
          </div>
          <button
            onClick={nextMonth}
            className="text-yellow-400 hover:text-yellow-500 font-semibold"
          >
            Volgende maand →
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={goToCurrentDate}
            className="text-yellow-400 hover:text-yellow-500 font-semibold px-6 py-2 border border-yellow-400 rounded-md"
          >
            Naar Heden
          </button>
        </div>

        {/* Laad indicator */}
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            Evenementen laden...
          </div>
        ) : (
          <>
            {/* Kalender Grid */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((day) => (
                <div key={day} className="font-semibold text-center text-[#1E2A78]">
                  {day}
                </div>
              ))}
              {days.map((day) => (
                <div
                  key={day.toString()}
                  className={`p-4 text-center cursor-pointer rounded-lg hover:bg-yellow-100 ${
                    !isSameMonth(day, currentDate) ? "text-gray-400" : "text-[#1E2A78]"
                  } ${isToday(day) ? "bg-yellow-400 text-white" : ""} ${
                    selectedDate && format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd") ? "ring-2 ring-yellow-400" : ""
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  <span>{format(day, "d")}</span>
                  {getEventsForDate(day).length > 0 && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mx-auto mt-2" />
                  )}
                </div>
              ))}
            </div>

            {/* Event List for the Selected Date */}
            <div className="mt-6">
              {selectedDate && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-[#1E2A78]">
                    Activiteiten op {format(selectedDate, "d MMMM yyyy", { locale: nl })}
                  </h3>
                  {getEventsForDate(selectedDate).length > 0 ? (
                    getEventsForDate(selectedDate).map((event) => (
                      <div key={event._id} className="bg-white shadow-lg rounded-lg p-4 mb-2">
                        <h4 className="font-semibold text-[#1E2A78]">{event.title}</h4>
                        <p className="text-gray-700">{event.description}</p>
                        <p className="text-gray-500">
                          Tijd: {event.time} uur - Locatie: {event.location}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">Geen activiteiten gepland voor deze dag.</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}