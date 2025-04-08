"use client"

import { CalendarPlus } from 'lucide-react'

export default function AgendaPage() {
  return (
    <div className="text-gray-800 px-6 py-4">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <CalendarPlus size={24} /> Agenda Beheer
      </h2>
      <p className="text-sm text-gray-600">Hier komt later het evenementenbeheer.</p>
    </div>
  )
}