"use client"

import { ImagePlus, Trash2, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Photo {
  _id: string
  title: string
  description?: string
  image: {
    data: string
    contentType: string
  }
}

export default function FotoboekPage() {
  const { data: session } = useSession()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [imageData, setImageData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/photos')
      const data = await res.json()
      setPhotos(data)
    } catch (error) {
      console.error('Error fetching photos:', error)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
        // Upload the file
        handleUpload(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const uploadData = await uploadRes.json()
      if (uploadData.error) {
        setMessage(`Upload fout: ${uploadData.error}`)
        return
      }

      setImageData(uploadData)
    } catch (error) {
      console.error('Upload error:', error)
      setMessage('Fout bij uploaden')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !imageData) {
      setMessage('Titel en afbeelding zijn verplicht')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          description,
          image: imageData
        })
      })

      if (response.ok) {
        setTitle('')
        setDescription('')
        setPreview(null)
        setImageData(null)
        setMessage('Foto succesvol toegevoegd')
        fetchPhotos()
      } else {
        const error = await response.json()
        setMessage(`Fout: ${error.error}`)
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage('Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  const deletePhoto = async (id: string) => {
    if (confirm('Weet je zeker dat je deze foto wilt verwijderen?')) {
      try {
        const response = await fetch(`/api/photos/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          setMessage('Foto succesvol verwijderd')
          fetchPhotos()
        } else {
          const error = await response.json()
          setMessage(`Fout: ${error.error}`)
        }
      } catch (error) {
        console.error('Error deleting photo:', error)
        setMessage('Fout bij verwijderen van foto')
      }
    }
  }

  return (
    <div className="text-gray-800 px-6 py-4">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ImagePlus size={24} /> Fotoboek beheer
      </h2>

      {message && (
        <div className="bg-blue-50 text-blue-700 p-4 mb-4 rounded border border-blue-200">
          {message}
        </div>
      )}

      <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm max-w-xl mb-8">
        <h3 className="text-xl font-semibold mb-4">Nieuwe foto toevoegen</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Titel</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Afbeelding</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />

            {preview && (
              <div className="border border-gray-200 p-2 rounded mt-2">
                <img src={preview} alt="Preview" className="max-h-64 object-contain rounded" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !imageData}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            <Save size={18} />
            {loading ? 'Bezig met uploaden...' : 'Foto opslaan'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Bestaande foto's</h3>
        
        {photos.length === 0 ? (
          <p className="text-gray-500">Nog geen foto's toegevoegd.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo._id} className="border border-gray-200 rounded p-3">
                <img
                  src={`data:${photo.image.contentType};base64,${photo.image.data}`}
                  alt={photo.title}
                  className="w-full h-48 object-cover rounded mb-2"
                />
                <h4 className="font-medium">{photo.title}</h4>
                {photo.description && <p className="text-sm text-gray-600">{photo.description}</p>}
                
                <button
                  onClick={() => deletePhoto(photo._id)}
                  className="mt-2 text-red-500 flex items-center gap-1 text-sm hover:text-red-700"
                >
                  <Trash2 size={16} /> Verwijderen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}