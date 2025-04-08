"use client"

import { ImagePlus } from 'lucide-react'
import { useState } from 'react'

export default function FotoboekPage() {
  const [preview, setPreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="text-gray-800 px-6 py-4">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ImagePlus size={24} /> Fotoboek
      </h2>

      <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm max-w-xl">
        <input type="file" accept="image/*" onChange={handleImageChange} className="mb-4" />

        {preview && (
          <div className="border border-gray-200 p-2 rounded">
            <img src={preview} alt="Preview" className="max-h-64 object-contain rounded" />
          </div>
        )}

        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
          Upload foto
        </button>
      </div>
    </div>
  )
}
