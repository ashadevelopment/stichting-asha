'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Edit, Trash2, Save, X, ExternalLink, Video, Newspaper } from 'lucide-react'

interface NewsletterPost {
  _id?: string
  title: string
  description: string
  content?: string
  type: 'article' | 'video'
  link?: string
  videoUrl?: string
  image?: {
    filename: string
    contentType: string
    data: string
  }
  author: string
  createdAt?: string
  updatedAt?: string
}

interface LinkPreview {
  title: string
  description: string
  image: string
  url: string
}

// Component for handling image with fallback
const ImageWithFallback = ({ 
  src, 
  alt, 
  className, 
  fallbackSrc = '/images/video-placeholder.jpg' 
}: {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
}) => {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallbackSrc)
    }
  }

  useEffect(() => {
    setImgSrc(src)
    setHasError(false)
  }, [src])

  return (
    <img 
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  )
}

// Component for YouTube thumbnail with fallback
const YouTubeThumbnail = ({ 
  videoId, 
  alt, 
  className 
}: {
  videoId: string
  alt: string
  className?: string
}) => {
  const [showFallback, setShowFallback] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const fallbackIcon = (
    <div className={`${className} bg-red-100 flex items-center justify-center border-2 border-red-200 rounded`}>
      <div className="text-center">
        <Video className="text-red-500 mx-auto mb-1" size={20} />
        <span className="text-xs text-red-600 font-medium">YouTube</span>
      </div>
    </div>
  )

  // Try hqdefault first as it's more reliable than maxresdefault
  const thumbnailSrc = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    
    // Check if the image is likely a placeholder by checking dimensions
    // YouTube's placeholder images are typically 480x360 but appear as gray boxes
    // We can detect this by checking if the image is too small or has specific dimensions
    if (img.naturalWidth === 120 && img.naturalHeight === 90) {
      // This is likely the default placeholder
      setShowFallback(true)
    } else if (img.naturalWidth < 120 || img.naturalHeight < 90) {
      // Image too small, likely an error
      setShowFallback(true)
    } else {
      setImageLoaded(true)
    }
  }

  const handleImageError = () => {
    setShowFallback(true)
  }

  useEffect(() => {
    // Reset states when videoId changes
    setShowFallback(false)
    setImageLoaded(false)
  }, [videoId])

  if (showFallback) {
    return fallbackIcon
  }

  return (
    <>
      <img 
        src={thumbnailSrc}
        alt={alt}
        className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ transition: 'opacity 0.2s' }}
      />
      {!imageLoaded && !showFallback && (
        <div className={`${className} bg-gray-100 flex items-center justify-center animate-pulse absolute inset-0`}>
          <Video className="text-gray-400" size={16} />
        </div>
      )}
    </>
  )
}

export default function NewsletterManagementPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<NewsletterPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingPost, setEditingPost] = useState<NewsletterPost | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  const [formData, setFormData] = useState<NewsletterPost>({
    title: '',
    description: '',
    content: '',
    type: 'article',
    link: '',
    videoUrl: '',
    author: session?.user?.name || 'Admin'
  })

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string | null => {
    const regexPatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ]
    
    for (const pattern of regexPatterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  // Fetch all newsletter posts
  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/newsletter')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate link preview with better fallback handling
  const generateLinkPreview = async (url: string) => {
    if (!url) return

    setIsPreviewLoading(true)
    try {
      // Check if it's a YouTube URL
      const videoId = extractYouTubeId(url)
      
      if (videoId) {
        setFormData(prev => ({ 
          ...prev, 
          type: 'video', 
          videoUrl: `https://www.youtube.com/embed/${videoId}`,
          title: prev.title || 'Stiching Asha YouTube Video',
          description: prev.description || 'Video vanuit YouTube'
        }))
        setLinkPreview({
          title: `Stichting Asha YouTube Video`,
          description: 'Video vanuit YouTube',
          image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          url: url
        })
        return
      }

      // For other URLs, try to fetch preview data
      const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      if (response.ok) {
        const preview = await response.json()
        setLinkPreview(preview)
        setFormData(prev => ({
          ...prev,
          title: prev.title || preview.title,
          description: prev.description || preview.description
        }))
      }
    } catch (error) {
      console.error('Error generating preview:', error)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formDataToSend = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formDataToSend.append(key, value.toString())
      }
    })

    try {
      const url = editingPost ? `/api/newsletter/${editingPost._id}` : '/api/newsletter'
      const method = editingPost ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        body: formDataToSend
      })

      if (response.ok) {
        await fetchPosts()
        resetForm()
      }
    } catch (error) {
      console.error('Error saving post:', error)
    }
  }

  // Handle delete
  const handleDelete = async (postId: string) => {
    if (!confirm('Weet u zeker dat u deze post wilt verwijderen?')) return

    try {
      const response = await fetch(`/api/newsletter/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchPosts()
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      type: 'article',
      link: '',
      videoUrl: '',
      author: session?.user?.name || 'Admin'
    })
    setEditingPost(null)
    setIsCreating(false)
    setLinkPreview(null)
  }

  // Start editing
  const startEdit = (post: NewsletterPost) => {
    setFormData(post)
    setEditingPost(post)
    setIsCreating(true)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  // Handle link input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.link && formData.link.startsWith('http')) {
        generateLinkPreview(formData.link)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [formData.link])

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Laden...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Newspaper size={24} />Nieuwsbrief
        </h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Nieuwe Post
        </button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingPost ? 'Post Bewerken' : 'Nieuwe Post'}
            </h2>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Link/URL</label>
              <input
                type="url"
                value={formData.link || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                placeholder="https://example.com or https://youtube.com/watch?v=..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {isPreviewLoading && <p className="text-sm text-gray-500 mt-1">Generating preview...</p>}
            </div>

            {/* Link Preview with fallback handling */}
            {linkPreview && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Preview:</h3>
                <div className="flex gap-4">
                  {linkPreview.image && (
                    <div className="w-24 h-24 flex-shrink-0 relative">
                      {extractYouTubeId(linkPreview.url) ? (
                        <YouTubeThumbnail
                          videoId={extractYouTubeId(linkPreview.url)!}
                          alt="YouTube Preview"
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <ImageWithFallback
                          src={linkPreview.image}
                          alt="Preview"
                          className="w-full h-full object-cover rounded"
                          fallbackSrc="/images/article-placeholder.jpg"
                        />
                      )}
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium">{linkPreview.title}</h4>
                    <p className="text-sm text-gray-600">{linkPreview.description}</p>
                    <p className="text-xs text-blue-600">{linkPreview.url}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Titel</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'article' | 'video' }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="article">Artikel</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Beschrijving</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={3}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Content (optioneel)</label>
              <textarea
                value={formData.content || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {formData.type === 'video' && (
              <div>
                <label className="block text-sm font-medium mb-2">Video URL (embed)</label>
                <input
                  type="url"
                  value={formData.videoUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
              >
                <Save size={18} />
                {editingPost ? 'Bijwerken' : 'Opslaan'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Annuleren
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List with fallback images */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div className="flex gap-4 flex-1">
                {/* Thumbnail with fallback */}
                {(post.link || post.image) && (
                  <div className="w-20 h-20 flex-shrink-0 relative">
                    {post.type === 'video' && post.link && extractYouTubeId(post.link) ? (
                      <YouTubeThumbnail
                        videoId={extractYouTubeId(post.link)!}
                        alt={post.title}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : post.image ? (
                      <img
                        src={`data:${post.image.contentType};base64,${post.image.data}`}
                        alt={post.title}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                        {post.type === 'video' ? (
                          <Video className="text-gray-400" size={24} />
                        ) : (
                          <ExternalLink className="text-gray-400" size={24} />
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {post.type === 'video' ? (
                      <Video className="text-red-500" size={20} />
                    ) : (
                      <ExternalLink className="text-blue-500" size={20} />
                    )}
                    <span className="text-sm font-medium text-gray-500 uppercase">
                      {post.type}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-2">{post.description}</p>
                  {post.link && (
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {post.link}
                    </a>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Door: {post.author} • {new Date(post.createdAt!).toLocaleDateString('nl-NL')}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => startEdit(post)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(post._id!)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nog geen nieuwsbrief posts.</p>
          <button
            onClick={() => setIsCreating(true)}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Maak je eerste post
          </button>
        </div>
      )}
    </div>
  )
}