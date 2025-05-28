"use client"

import { ImagePlus, Trash2, Save, FilmIcon, AlertCircle } from 'lucide-react'
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

// File size limits in bytes
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

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
  const [validationError, setValidationError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showForm, setShowForm] = useState(true)
  const [uploadProgress, setUploadProgress] = useState(0)
  
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

  // Validate file before preview
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Determine if it's a video or image based on file type
    const isVideo = file.type.startsWith('video');
    
    // Check file size
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return { 
        valid: false, 
        error: `Bestandsgrootte (${(file.size / (1024 * 1024)).toFixed(2)}MB) overschrijdt de limiet van ${maxSizeMB}MB` 
      };
    }
    
    // Check file type
    const allowedTypes = isVideo ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `Bestandstype ${file.type} wordt niet ondersteund. Toegestane types: ${
          isVideo ? 'MP4, WebM, Ogg' : 'JPEG, PNG, GIF, WebP'}`
      };
    }
    
    return { valid: true };
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset previous errors
    setValidationError('');
    
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setValidationError(validation.error || 'Ongeldig bestand');
      e.target.value = ''; // Reset file input
      return;
    }
    
    // Determine if it's a video or image based on file type
    const newMediaType = file.type.startsWith('video') ? 'video' : 'image';
    setMediaType(newMediaType);
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setMediaFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('Titel is verplicht');
      return;
    }
    
    if (!mediaFile) {
      setError('Media bestand is verplicht');
      return;
    }
    
    // Validate file again before submission
    const validation = validateFile(mediaFile);
    if (!validation.valid) {
      setValidationError(validation.error || 'Ongeldig bestand');
      return;
    }

    setLoading(true);
    setError(''); // Reset error
    setUploadProgress(10); // Start progress indicator
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      if (description) {
        formData.append('description', description);
      }
      formData.append('file', mediaFile);
      formData.append('mediaType', mediaType);

      setUploadProgress(30); // Indicate form preparation
      
      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData
      });

      setUploadProgress(90); // Indicate server processing
      
      if (response.ok) {
        setUploadProgress(100); // Complete
        const data = await response.json();
        setTitle('');
        setDescription('');
        setPreview(null);
        setMediaFile(null);
        setSuccessMessage(`${mediaType === 'video' ? 'Video' : 'Foto'} succesvol toegevoegd`);
        // Toon het succeesbericht voor 3 seconden
        setTimeout(() => {
          setSuccessMessage('');
          setUploadProgress(0);
        }, 3000);
        
        fetchMediaItems();
        
        // Op mobiel, sluit het formulier na toevoegen
        if (window.innerWidth < 768) {
          setShowForm(false);
        }
      } else {
        setUploadProgress(0);
        const errorData = await response.json();
        setError(`Fout: ${errorData.error || 'Onbekende fout'}`);
        if (errorData.details) {
          console.error('Error details:', errorData.details);
        }
      }
    } catch (error) {
      setUploadProgress(0);
      console.error('Error:', error);
      setError('Er is een fout opgetreden bij het uploaden');
    } finally {
      setLoading(false);
    }
  };

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
        <ImagePlus size={24} className="sm:w-[24px] sm:h-[24px]" /> Foto's & Video's
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
          
          {/* File Size Information */}
          <div className="bg-blue-50 p-3 rounded mb-4 text-sm text-blue-700">
            <p className="font-medium mb-1">Bestandslimieten:</p>
            <ul className="list-disc pl-5">
              <li>Afbeeldingen: max. {MAX_IMAGE_SIZE / (1024 * 1024)}MB (JPEG, PNG, GIF, WebP)</li>
              <li>Video's: max. {MAX_VIDEO_SIZE / (1024 * 1024)}MB (MP4, WebM, Ogg)</li>
            </ul>
          </div>
          
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
                    accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg" 
                    onChange={handleMediaChange} 
                    className="hidden" 
                  />
                </label>
                
                {validationError && (
                  <div className="flex items-start gap-2 text-red-600 bg-red-50 p-2 rounded text-sm">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}
                
                {preview ? (
                  renderFilePreview()
                ) : (
                  <p className="text-sm text-gray-500">Nog geen bestand geselecteerd</p>
                )}
              </div>
            </div>

            {/* Upload Progress Bar (shown when uploading) */}
            {uploadProgress > 0 && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {uploadProgress < 100 ? 'Bezig met uploaden...' : 'Upload voltooid!'}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={loading || !mediaFile || !!validationError}
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
                  setValidationError('');
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