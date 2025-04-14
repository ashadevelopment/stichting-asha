"use client"

import { ImagePlus, Trash2, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import ConfirmationDialog from '../../../components/ConfirmationDialog'

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
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showForm, setShowForm] = useState(true)
  
  // Bevestigingsdialoog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/photos')
      const data = await res.json()
      setPhotos(data)
    } catch (error) {
      console.error('Error fetching photos:', error)
      setError('Fout bij het ophalen van foto\'s')
    } finally {
      setLoading(false)
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
        setError(`Upload fout: ${uploadData.error}`)
        return
      }

      setImageData(uploadData)
    } catch (error) {
      console.error('Upload error:', error)
      setError('Fout bij uploaden')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !imageData) {
      setError('Titel en afbeelding zijn verplicht')
      return
    }

    setLoading(true)
    setError('') // Reset error
    
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
        setSuccessMessage('Foto succesvol toegevoegd')
        // Toon het succeesbericht voor 3 seconden
        setTimeout(() => setSuccessMessage(''), 3000)
        
        fetchPhotos()
        
        // Op mobiel, sluit het formulier na toevoegen
        if (window.innerWidth < 768) {
          setShowForm(false)
        }
      } else {
        const error = await response.json()
        setError(`Fout: ${error.error}`)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  // Initieer verwijderen - open de bevestigingsdialoog
  const initiateDeletePhoto = (id: string) => {
    setPhotoToDelete(id)
    setIsDialogOpen(true)
  }

  // Bevestig verwijderen
  const confirmDelete = async () => {
    if (!photoToDelete) return
    
    try {
      const response = await fetch(`/api/photos/${photoToDelete}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccessMessage('Foto succesvol verwijderd')
        // Toon het succeesbericht voor 3 seconden
        setTimeout(() => setSuccessMessage(''), 3000)
        
        // Update de lijst van foto's
        setPhotos(photos.filter(photo => photo._id !== photoToDelete))
      } else {
        const error = await response.json()
        setError(`Fout: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
      setError('Fout bij verwijderen van foto')
    } finally {
      // Sluit de dialoog
      setIsDialogOpen(false)
      setPhotoToDelete(null)
    }
  }
  
  // Annuleer verwijderen
  const cancelDelete = () => {
    setIsDialogOpen(false)
    setPhotoToDelete(null)
  }

  return (
    <div className="text-gray-800 p-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
        <ImagePlus size={20} className="sm:w-[24px] sm:h-[24px]" /> Fotoboek beheer
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-4 transition-opacity duration-300">
          {successMessage}
        </div>
      )}

      {/* Toggle Form Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 mb-4"
      >
        <ImagePlus size={18} />
        {showForm ? 'Verberg formulier' : 'Nieuwe foto toevoegen'}
      </button>

      {/* Photo Upload Form */}
      {showForm && (
        <div className="bg-white p-4 sm:p-6 border border-gray-200 rounded-xl shadow-sm max-w-xl mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Nieuwe foto toevoegen</h3>
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
              <label className="block text-sm font-medium mb-1">Beschrijving (optioneel)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded h-24 resize-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Afbeelding</label>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded cursor-pointer transition w-fit">
                  <ImagePlus size={18} />
                  <span>Kies een afbeelding</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="hidden" 
                  />
                </label>
                
                {preview ? (
                  <div className="border border-gray-200 p-2 rounded">
                    <p className="text-xs text-gray-500 mb-2">Voorbeeld:</p>
                    <img src={preview} alt="Preview" className="max-h-64 object-contain rounded" />
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nog geen afbeelding geselecteerd</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={loading || !imageData}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 order-2 sm:order-1"
              >
                <Save size={18} />
                {loading ? 'Bezig met uploaden...' : 'Foto opslaan'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setDescription('');
                  setPreview(null);
                  setImageData(null);
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Photos Gallery */}
      <div className="bg-white p-4 sm:p-6 border border-gray-200 rounded-xl shadow-sm">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">Bestaande foto's</h3>
        
        {loading && photos.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : photos.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nog geen foto's toegevoegd.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo._id} className="border border-gray-200 rounded-lg p-3 transition hover:shadow-md">
                <div className="relative pb-[75%] w-full mb-2 overflow-hidden rounded">
                  <img
                    src={`data:${photo.image.contentType};base64,${photo.image.data}`}
                    alt={photo.title}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-medium text-gray-800 line-clamp-1">{photo.title}</h4>
                {photo.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{photo.description}</p>
                )}
                
                <button
                  onClick={() => initiateDeletePhoto(photo._id)}
                  className="mt-2 text-red-500 flex items-center gap-1 text-sm hover:text-red-700"
                >
                  <Trash2 size={16} /> Verwijderen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Bevestigingsdialoog voor verwijderen */}
      <ConfirmationDialog 
        isOpen={isDialogOpen}
        title="Foto verwijderen"
        message="Weet u zeker dat u deze foto wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  )
}