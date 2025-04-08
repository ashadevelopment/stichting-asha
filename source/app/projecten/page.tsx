"use client";

import { useState } from "react";

interface Event {
  date: string;
  title: string;
  description: string;
  time: string;
  location: string;
}

export default function Projecten() {
  const [events, setEvents] = useState<Event[]>([
    {
      date: "2025-04-12",
      title: "Hindostaanse Cultuurfestival",
      description: "Een dag vol met Hindostaanse muziek, dans en eten.",
      time: "14:00",
      location: "Centraal Park, Utrecht",
    },
    {
      date: "2025-04-15",
      title: "Inburgeringsworkshop",
      description: "Workshop voor nieuwkomers in Nederland.",
      time: "10:00",
      location: "Stichting Asha, Utrecht",
    },
    // Voeg hier meer evenementen toe
  ]);

  const [openEvent, setOpenEvent] = useState<string | null>(null); // Event dat opengeklapt is

  const toggleEvent = (title: string) => {
    // Als het event al open is, sluit het dan
    if (openEvent === title) {
      setOpenEvent(null);
    } else {
      setOpenEvent(title); // Anders open het geselecteerde event
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-[#1E2A78] mb-8 text-center">Onze Projecten</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {events.map((event) => (
            <div
              key={event.title}
              className="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-105"
              onClick={() => toggleEvent(event.title)} // Open/Sluit het event
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#1E2A78]">{event.title}</h3>
                <p className="text-gray-500">{event.date}</p>
              </div>

              {/* Laat alleen de beschrijving zien wanneer het event open is */}
              <div
                className={`transition-all duration-500 ease-in-out max-h-0 overflow-hidden ${
                  openEvent === event.title ? "max-h-[500px]" : ""
                }`}
              >
                <div className="bg-gray-100 p-6">
                  <p className="text-sm text-gray-700">{event.description}</p>
                  <p className="text-sm text-gray-700 mt-4">Tijd: {event.time}</p>
                  <p className="text-sm text-gray-700">Locatie: {event.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
