"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  FileText, 
  ExternalLink, 
  PlayCircle, 
  Trash2, 
  PlusCircle, 
  Upload, 
  XCircle 
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { nl } from 'date-fns/locale'
import ConfirmationDialog from '../../../components/ConfirmationDialog'

interface NewsletterPost {
  _id: string
  title: string
  description: string
  content: string
  type: 'article' | 'video'
  link?: string
  videoUrl?: string
  author: string
  createdAt: string
  image?: {
    filename: string
    contentType: string
    data: string
  }
}

export default function NieuwsbriefBeheer() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<NewsletterPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  // Form states
  const [showForm, setShowForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentPost, setCurrentPost] = useState<NewsletterPost | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<'article' | 'video'>('article')
  const [link, setLink] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  
  // File states
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  // Confirmation dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)

  // Render check for administrators
  if (session?.user?.role !== 'beheerder' && session?.user?.role !== 'developer') {
    return (
      <div className="text-gray-800 p-4">
        <h2 className="text-xl sm:text-3xl font-bold mb-4 flex items-center gap-2">
          <FileText size={24} /> Nieuwsbrief
        </h2>
        <p className="text-red-500">Je hebt geen toegang tot deze pagina.</p>
      </div>
    )
  }

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/newsletter')
      
      if (!res.ok) {
        throw new Error('Fout bij ophalen nieuwsberichten')
      }
      
      const data = await res.json()
      setPosts(data)
    } catch (err: any) {
      setError(err.message || 'Er is een fout opgetreden')
      console.error('Fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Image file handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Afbeelding mag maximaal 5MB zijn')
        return
      }

      setImageFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Reset form
  const resetForm = () => {
    setTitle('')
    setDescription('')
    setContent('')
    setType('article')
    setLink('')
    setVideoUrl('')
    setImageFile(null)
    setImagePreview(null)
    setIsEditing(false)
    setCurrentPost(null)
  }

  // Edit post
  const handleEditPost = (post: NewsletterPost) => {
    setCurrentPost(post)
    setTitle(post.title)
    setDescription(post.description)
    setContent(post.content || '')
    setType(post.type)
    setLink(post.link || '')
    setVideoUrl(post.videoUrl || '')
    
    // Set image preview if exists
    if (post.image && post.image.data) {
      setImagePreview(`data:${post.image.contentType};base64,${post.image.data}`)
    }
    
    setIsEditing(true)
    setShowForm(true)
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!title || !description) {
      setError('Titel en beschrijving zijn verplicht')
      return
    }
    
    try {
      // Prepare form data
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('content', content)
      formData.append('type', type)
      
      // Optional fields
      if (link) formData.append('link', link)
      if (videoUrl) formData.append('videoUrl', videoUrl)
      
      // Add image if present
      if (imageFile) {
        formData.append('image', imageFile)
      }
      
      // Determine API endpoint and method
      const url = isEditing && currentPost?._id 
        ? `/api/newsletter/${currentPost._id}` 
        : '/api/newsletter'
      const method = isEditing ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        body: formData
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Fout bij opslaan nieuwsbericht')
      }
      
      const savedPost = await res.json()
      
      // Update posts list
      if (isEditing) {
        setPosts(posts.map(p => 
          p._id === savedPost._id ? savedPost : p
        ))
        setSuccessMessage('Nieuwsbericht succesvol bijgewerkt')
      } else {
        setPosts([savedPost, ...posts])
        setSuccessMessage('Nieuwsbericht succesvol toegevoegd')
      }
      
      // Reset form
      resetForm()
      setShowForm(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
      
      // If on mobile, hide the form
      if (window.innerWidth < 768) {
        setShowForm(false)
      }
    } catch (err: any) {
      console.error('Error saving post:', err)
      setError(err.message || 'Er is een fout opgetreden')
    }
  }

  // Delete post
  const handleDeleteClick = (id: string) => {
    setPostToDelete(id)
    setIsDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!postToDelete) return
    
    try {
      const res = await fetch(`/api/newsletter/${postToDelete}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Fout bij verwijderen nieuwsbericht')
      }
      
      // Remove post from local state
      setPosts(posts.filter(p => p._id !== postToDelete))
      
      setSuccessMessage('Nieuwsbericht succesvol verwijderd')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: any) {
      console.error('Error deleting post:', err)
      setError(err.message || 'Er is een fout opgetreden')
    } finally {
      setIsDialogOpen(false)
      setPostToDelete(null)
    }
  }

  const cancelDelete = () => {
    setIsDialogOpen(false)
    setPostToDelete(null)
  }

  return (
    <div className="text-gray-800 p-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
        <FileText size={20} className="sm:w-[24px] sm:h-[24px]" /> Nieuwsbrief Beheer
      </h2>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-4">
          {successMessage}
        </div>
      )}

      {/* Toggle Form Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 mb-4"
      >
        <PlusCircle size={18} />
        {showForm ? 'Verberg formulier' : isEditing ? 'Bewerk nieuwsbericht' : 'Nieuw nieuwsbericht'}
      </button>

      {/* Newsletter Post Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 max-w-3xl space-y-4 sm:space-y-6 mb-6 sm:mb-10">
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">
            {isEditing ? 'Nieuwsbericht bewerken' : 'Nieuw nieuwsbericht toevoegen'}
          </h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Titel</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Typ de titel van het nieuwsbericht"
              className="w-full border border-gray-200 px-3 py-2 rounded text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Beschrijving</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Korte beschrijving van het nieuwsbericht"
              className="w-full border border-gray-200 px-3 py-2 rounded text-sm h-28 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Uitgebreide Beschrijving (Optioneel)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Meer details over het nieuwsbericht..."
              className="w-full border border-gray-200 px-3 py-2 rounded text-sm h-28 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'article' | 'video')}
                className="w-full border border-gray-200 px-3 py-2 rounded text-sm"
              >
                <option value="article">Artikel</option>
                <option value="video">Video</option>
              </select>
            </div>

            {type === 'article' ? (
              <div>
                <label className="block text-sm font-medium mb-1">Link naar artikel</label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Optionele link naar het volledige artikel"
                  className="w-full border border-gray-200 px-3 py-2 rounded text-sm"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1">Video URL</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Plak de YouTube of Vimeo URL"
                  className="w-full border border-gray-200 px-3 py-2 rounded text-sm"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Afbeelding (Optioneel)</label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded cursor-pointer transition w-fit">
                <Upload size={18} />
                <span>Kies een afbeelding</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              
              {imagePreview ? (
                <div className="border border-gray-200 p-2 rounded">
                  <p className="text-xs text-gray-500 mb-2">Voorbeeld:</p>
                  <img 
                    src={imagePreview} 
                    alt="Afbeelding voorbeeld" 
                    className="max-h-48 object-contain rounded" 
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                    className="mt-2 text-red-500 flex items-center gap-1 text-sm"
                  >
                    <XCircle size={16} /> Verwijderen
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nog geen afbeelding geselecteerd</p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="submit"
              className="order-2 sm:order-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              {isEditing ? 'Nieuwsbericht Bijwerken' : 'Nieuwsbericht Toevoegen'}
            </button>
            
            <button
              type="button"
              onClick={() => {
                resetForm()
                if (window.innerWidth < 768) {
                  setShowForm(false)
                }
              }}
              className="order-1 sm:order-2 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm"
            >
              {isEditing ? 'Annuleren' : 'Reset'}
            </button>
          </div>
        </form>
      )}

      {/* Nieuwsberichten Lijst */}
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold mb-2">Bestaande Nieuwsberichten</h3>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : posts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Geen nieuwsberichten gevonden.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <div 
                key={post._id} 
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition hover:shadow-md"
              >
                {/* Post image thumbnail with responsive aspect ratio */}
                {post.image && (
                  <div className="relative pb-[56.25%] mb-3 overflow-hidden rounded-md">
                    <img 
                      src={`data:${post.image.contentType};base64,${post.image.data}`}
                      alt={post.title} 
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                    {post.type === 'video' && (
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <PlayCircle size={48} className="text-white" />
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg break-words pr-8">{post.title}</h3>
                  
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditPost(post)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Bewerk nieuwsbericht"
                    >
                      <FileText size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(post._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Verwijder nieuwsbericht"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-2 line-clamp-2">{post.description}</p>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <ExternalLink size={14} />
                  <span>
                    {format(new Date(post.createdAt), 'd MMM yyyy', { locale: nl })}
                  </span>
                  <span className="capitalize ml-2">
                    {post.type === 'article' ? 'Artikel' : 'Video'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Bevestigingsdialoog voor verwijderen */}
      <ConfirmationDialog 
        isOpen={isDialogOpen}
        title="Nieuwsbericht verwijderen"
        message="Weet u zeker dat u dit nieuwsbericht wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  )
}