"use client"

import { Mail } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="text-gray-800 px-6 py-4">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Mail size={24} /> Contactverzoeken
      </h2>
      <p className="text-sm text-gray-600">Hier kan je toekomstige contactformulieren beheren.</p>
    </div>
  )
}