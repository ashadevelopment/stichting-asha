"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfToday } from "date-fns";
import { nl } from "date-fns/locale";

interface Event {
  date: string;
  title: string;
  description: string;
  time: string;
  location: string;
}

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]); // Dynamisch toegevoegde evenementen
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventForm, setShowEventForm] = useState(false); // Hulpvariabele om het formulier te tonen/verbergen

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });

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

  // Event toevoegen
  const handleAddEvent = (event: Event) => {
    setEvents([...events, event]);
    setShowEventForm(false); // Sluit het formulier na toevoegen van evenement
  };

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] flex flex-col items-center py-12">
      {/* Agenda Block */}
      <div className="w-full max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-[#1E2A78] mb-6 text-center">Agenda</h2>

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
                getEventsForDate(selectedDate).map((event, index) => (
                  <div key={index} className="bg-white shadow-lg rounded-lg p-4 mb-2">
                    <h4 className="font-semibold text-[#1E2A78]">{event.title}</h4>
                    <p className="text-gray-700">{event.description}</p>
                    <p className="text-gray-500">
                      Tijd: {event.time} - Locatie: {event.location}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">Geen activiteiten gepland voor deze dag.</p>
              )}
            </div>
          )}
        </div>

        {/* Knop om formulier te tonen */}
        <button
          onClick={() => setShowEventForm(!showEventForm)}
          className="mt-6 inline-block px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-white font-medium text-sm leading-tight uppercase rounded-md shadow-md transition-all"
        >
          Voeg Evenement Toe
        </button>

        {/* Formulier voor het toevoegen van een evenement */}
        {showEventForm && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-[#1E2A78] mb-4">Nieuw Evenement Toevoegen</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const event: Event = {
                  date: format(selectedDate!, "yyyy-MM-dd"),
                  title: (e.target as any).eventTitle.value,
                  description: (e.target as any).eventDescription.value,
                  time: (e.target as any).eventTime.value,
                  location: (e.target as any).eventLocation.value,
                };
                handleAddEvent(event);
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="eventTitle" className="block text-sm font-medium text-gray-700">Titel</label>
                <input
                  type="text"
                  id="eventTitle"
                  name="eventTitle"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-yellow-400 focus:border-yellow-400 text-black"
                />
              </div>
              <div>
                <label htmlFor="eventDescription" className="block text-sm font-medium text-gray-700">Beschrijving</label>
                <textarea
                  id="eventDescription"
                  name="eventDescription"
                  required
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-yellow-400 focus:border-yellow-400 text-black"
                />
              </div>
              <div>
                <label htmlFor="eventTime" className="block text-sm font-medium text-gray-700">Tijd</label>
                <input
                  type="time"
                  id="eventTime"
                  name="eventTime"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-yellow-400 focus:border-yellow-400 text-black"
                />
              </div>
              <div>
                <label htmlFor="eventLocation" className="block text-sm font-medium text-gray-700">Locatie</label>
                <input
                  type="text"
                  id="eventLocation"
                  name="eventLocation"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-yellow-400 focus:border-yellow-400 text-black"
                />
              </div>
              <button
                type="submit"
                className="mt-4 inline-block px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-white font-medium text-sm leading-tight uppercase rounded-md shadow-md transition-all"
              >
                Voeg Evenement Toe
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
