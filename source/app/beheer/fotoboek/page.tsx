"use client"

import { ImagePlus, Trash2, Save, FilmIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import ConfirmationDialog from '../../../components/ConfirmationDialog'
import { useRouter } from 'next/navigation'

interface MediaItem {
  _id: string
  title: string
  description?: string
  media: {
    data: string
    contentType: string
    type: 'image' | 'video'
  }
}

export default function FotoboekPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showForm, setShowForm] = useState(true)
  
  // Bevestigingsdialoog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMediaItems()
    }
  }, [status])

  const fetchMediaItems = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/media')
      
      // Check if the response is ok
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Fout bij het ophalen van media');
      }
      
      // Try to parse JSON
      const data = await res.json()
      
      // Ensure data is an array
      const mediaArray = Array.isArray(data) ? data : [];
      
      setMediaItems(mediaArray)
    } catch (error) {
      console.error('Error fetching media:', error)
      setError(error instanceof Error ? error.message : 'Fout bij het ophalen van media')
    } finally {
      setLoading(false)
    }
  }

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Determine if it's a video or image based on file type
      const newMediaType = file.type.startsWith('video') ? 'video' : 'image'
      setMediaType(newMediaType)
      
      // Create a preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
        setMediaFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !mediaFile) {
      setError('Titel en media bestand zijn verplicht')
      return
    }

    setLoading(true)
    setError('') // Reset error
    
    try {
      const formData = new FormData()
      formData.append('title', title)
      if (description) {
        formData.append('description', description)
      }
      formData.append('file', mediaFile)
      formData.append('mediaType', mediaType)

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setTitle('')
        setDescription('')
        setPreview(null)
        setMediaFile(null)
        setSuccessMessage(`${mediaType === 'video' ? 'Video' : 'Foto'} succesvol toegevoegd`)
        // Toon het succeesbericht voor 3 seconden
        setTimeout(() => setSuccessMessage(''), 3000)
        
        fetchMediaItems()
        
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
  const initiateDeleteItem = (id: string) => {
    setItemToDelete(id)
    setIsDialogOpen(true)
  }

  // Bevestig verwijderen
  const confirmDelete = async () => {
    if (!itemToDelete) return
    
    try {
      const response = await fetch(`/api/media/${itemToDelete}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const deletedItem = mediaItems.find(item => item._id === itemToDelete)
        const itemType = deletedItem?.media.type === 'video' ? 'Video' : 'Foto'
        
        setSuccessMessage(`${itemType} succesvol verwijderd`)
        // Toon het succeesbericht voor 3 seconden
        setTimeout(() => setSuccessMessage(''), 3000)
        
        // Update de lijst van media items
        setMediaItems(mediaItems.filter(item => item._id !== itemToDelete))
      } else {
        const error = await response.json()
        setError(`Fout: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting media:', error)
      setError('Fout bij verwijderen van media')
    } finally {
      // Sluit de dialoog
      setIsDialogOpen(false)
      setItemToDelete(null)
    }
  }
  
  // Annuleer verwijderen
  const cancelDelete = () => {
    setIsDialogOpen(false)
    setItemToDelete(null)
  }

  // Render preview based on media type
  const renderPreview = (item: MediaItem) => {
    if (item.media.type === 'video') {
      return (
        <div className="relative pb-[75%] w-full mb-2 overflow-hidden rounded bg-black">
          <video 
            src={`data:${item.media.contentType};base64,${item.media.data}`}
            className="absolute top-0 left-0 w-full h-full object-contain"
            controls
          />
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 p-1 rounded">
            <FilmIcon size={16} className="text-white" />
          </div>
        </div>
      )
    } else {
      return (
        <div className="relative pb-[75%] w-full mb-2 overflow-hidden rounded">
          <img
            src={`data:${item.media.contentType};base64,${item.media.data}`}
            alt={item.title}
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        </div>
      )
    }
  }

  // Render file input preview
  const renderFilePreview = () => {
    if (!preview) return null
    
    if (mediaType === 'video') {
      return (
        <div className="border border-gray-200 p-2 rounded">
          <p className="text-xs text-gray-500 mb-2">Video voorbeeld:</p>
          <video src={preview} controls className="max-h-64 object-contain rounded" />
        </div>
      )
    } else {
      return (
        <div className="border border-gray-200 p-2 rounded">
          <p className="text-xs text-gray-500 mb-2">Voorbeeld:</p>
          <img src={preview} alt="Preview" className="max-h-64 object-contain rounded" />
        </div>
      )
    }
  }

  // Render loading or authentication state
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will redirect via useEffect
  }

  return (
    <div className="text-gray-800 p-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
        <ImagePlus size={20} className="sm:w-[24px] sm:h-[24px]" /> Foto's & Video's
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
        {showForm ? 'Verberg formulier' : 'Nieuwe media toevoegen'}
      </button>

      {/* Media Upload Form */}
      {showForm && (
        <div className="bg-white p-4 sm:p-6 border border-gray-200 rounded-xl shadow-sm max-w-xl mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Nieuwe foto of video toevoegen</h3>
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
              <label className="block text-sm font-medium mb-1">Media bestand</label>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded cursor-pointer transition w-fit">
                  <ImagePlus size={18} />
                  <span>Kies een foto of video</span>
                  <input 
                    type="file" 
                    accept="image/*,video/*" 
                    onChange={handleMediaChange} 
                    className="hidden" 
                  />
                </label>
                
                {preview ? (
                  renderFilePreview()
                ) : (
                  <p className="text-sm text-gray-500">Nog geen bestand geselecteerd</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={loading || !mediaFile}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 order-2 sm:order-1"
              >
                <Save size={18} />
                {loading ? 'Bezig met uploaden...' : 'Opslaan'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setDescription('');
                  setPreview(null);
                  setMediaFile(null);
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Media Items */}
      <div className="bg-white p-4 sm:p-6 border border-gray-200 rounded-xl shadow-sm">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">Bestaande media</h3>
        
        {loading && mediaItems.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : mediaItems.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nog geen media toegevoegd.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaItems.map((item) => (
              <div key={item._id} className="border border-gray-200 rounded-lg p-3 transition hover:shadow-md">
                {renderPreview(item)}
                <h4 className="font-medium text-gray-800 line-clamp-1">
                  {item.title}
                  {item.media.type === 'video' && (
                    <span className="inline-flex items-center ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      <FilmIcon size={12} className="mr-1" /> Video
                    </span>
                  )}
                </h4>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                )}
                
                <button
                  onClick={() => initiateDeleteItem(item._id)}
                  className="mt-2 text-red-500 flex items-center gap-1 text-sm hover:text-red-700"
                >
                  <Trash2 size={16} /> Verwijderen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination (optional if needed) */}
      {mediaItems.length > 0 && (
        <div className="mt-6 flex justify-center">
          {/* You can implement pagination here if needed */}
        </div>
      )}
      
      {/* Bevestigingsdialoog voor verwijderen */}
      <ConfirmationDialog 
        isOpen={isDialogOpen}
        title="Item verwijderen"
        message="Weet u zeker dat u dit item wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  )
}