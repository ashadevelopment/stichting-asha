"use client";

import { useState, useEffect, useRef } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
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

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

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
    setSelectedDate(new Date());
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => event.date === format(date, "yyyy-MM-dd"));
  };

  const sortEventsByTime = (events: Event[]) => {
    return [...events].sort((a, b) => a.time.localeCompare(b.time));
  };

  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && detailsRef.current && !detailsRef.current.open) {
        detailsRef.current.open = true;
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] px-4 pt-28 md:pt-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-3xl font-bold text-[#1E2A78] text-center mb-20">Agenda</h1>
        <div className="flex flex-col md:flex-row md:items-start gap-4 max-w-7xl w-full">
          {/* Weekly Agenda: Collapsible on mobile, sidebar on desktop */}
          <div className="w-full md:w-[320px] bg-white rounded-lg shadow-lg p-4 md:sticky md:top-6 self-start">
            <details ref={detailsRef} className="md:open" open>
              <summary className="md:hidden cursor-pointer text-lg font-semibold text-[#1E2A78] mb-2">Agenda van deze Week</summary>

              <div className="space-y-4 capitalize">
                <h3 className="text-lg font-bold text-[#1E2A78] hidden md:block">Agenda van deze Week</h3>

                {isLoading ? (
                  <div className="text-center py-2 text-gray-500 text-sm">Laden...</div>
                ) : (
                  weekDays.map((day) => {
                    const dayEvents = getEventsForDate(day);
                    const sortedEvents = sortEventsByTime(dayEvents);
                    const isTodayDate = isToday(day);
                    const hasEvents = dayEvents.length > 0;

                    return (
                      <div key={day.toString()} className="text-sm mt-8">
                        <div
                          className={`font-medium mb-1 cursor-pointer transition-colors ${
                            hasEvents ? "text-yellow-600" : "text-gray-400"
                          } ${isTodayDate ? "text-yellow-500" : ""}`}
                          onClick={() => setSelectedDate(day)}
                        >
                          {format(day, "EEEE – d MMMM", { locale: nl })}
                        </div>

                        {hasEvents && (
                          <div className="space-y-1.5 mt-7">
                            {sortedEvents.map((event) => (
                              <div
                                key={event._id}
                                className="bg-white rounded-md p-2 shadow-md hover:bg-yellow-50 cursor-pointer capitalize"
                                onClick={() => setSelectedDate(day)}
                              >
                                <div className="font-bold text-[#1E2A78] text-sm capitalize">{event.title}</div>
                                <div className="text-xs text-gray-500 capitalize">{event.description}</div>
                                <div className="text-yellow-500 font-semibold text-sm mt-1 capitalize">{event.time}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </details>
          </div>

          {/* Calendar */}
          <div className="flex-1 md:w-[240px] bg-white rounded-lg shadow-lg p-6 flex flex-col h-auto">
            <h2 className="text-2xl font-bold text-[#1E2A78] mb-4 text-center">Agenda</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md mb-3 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center mb-2">
              <button onClick={previousMonth} className="text-yellow-500 hover:text-yellow-600 font-medium text-sm">
                ← Vorige
              </button>
              <div className="text-lg font-medium text-[#1E2A78]">
                {format(currentDate, "MMMM yyyy", { locale: nl })}
              </div>
              <button onClick={nextMonth} className="text-yellow-500 hover:text-yellow-600 font-medium text-sm">
                Volgende →
              </button>
            </div>

            <div className="flex justify-center mb-4">
              <button
                onClick={goToCurrentDate}
                className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-md px-3 py-1"
              >
                Naar Heden
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-4 text-gray-500 text-sm">Evenementen laden...</div>
            ) : (
              <>
                <div className="overflow-y-auto">
                  <div className="grid grid-cols-7 gap-2 mb-5 p-1">
                    {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((day) => (
                      <div key={day} className="font-medium text-center text-[#1E2A78] text-xs py-1">
                        {day}
                      </div>
                    ))}
                    {days.map((day) => {
                      const hasEvent = getEventsForDate(day).length > 0;

                      return (
                        <div
                          key={day.toString()}
                          className={`p-2 text-center cursor-pointer rounded-md hover:bg-yellow-100 transition-colors
                            ${!isSameMonth(day, currentDate) ? "text-gray-400" : "text-[#1E2A78]"} 
                            ${isToday(day) ? "bg-yellow-400 text-white" : ""} 
                            ${selectedDate && isSameDay(day, selectedDate) ? "ring-2 ring-yellow-300" : ""}`}
                          onClick={() => setSelectedDate(day)}
                        >
                          <span className="text-sm">{format(day, "d")}</span>
                          {hasEvent && (
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mx-auto mt-1"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {selectedDate && (
                    <div className="mt-2 border-t pt-2">
                      <h3 className="text-md font-semibold mb-3 text-[#1E2A78]">
                        Activiteiten op {format(selectedDate, "d MMMM yyyy", { locale: nl })}
                      </h3>

                      {getEventsForDate(selectedDate).length > 0 ? (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {sortEventsByTime(getEventsForDate(selectedDate)).map((event) => (
                            <div key={event._id} className="bg-gray-50 rounded-md p-3 shadow-sm">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-[#1E2A78] capitalize">{event.title}</h4>
                                <span className="text-yellow-600 font-medium whitespace-nowrap ml-2 capitalize">{event.time}</span>
                              </div>
                              <p className="text-gray-700 text-sm mt-1 capitalize">{event.description}</p>
                              <p className="text-gray-500 text-xs mt-1 capitalize">
                                Locatie: {event.location}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Geen activiteiten gepland voor deze dag.</p>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
