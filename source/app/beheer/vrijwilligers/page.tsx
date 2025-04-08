"use client"

import { UserCheck, FileText } from 'lucide-react'

export default function VrijwilligersPage() {
  return (
    <div className="text-gray-800 px-6 py-4">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <UserCheck size={24} /> Vrijwilligers
      </h2>

      <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-4">
        <p className="text-sm text-gray-700">Overzicht van aanmeldingen en actieve vrijwilligers.</p>

        {/* Voorbeeld */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-lg">Jan Jansen</h3>
          <p className="text-sm text-gray-600">CV & motivatie beschikbaar</p>
          <div className="mt-2 space-x-3">
            <button className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Goedkeuren</button>
            <button className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Afkeuren</button>
            <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Bekijk CV</button>
            <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Bekijk Motivatie</button>
          </div>
        </div>
      </div>
    </div>
  )
}