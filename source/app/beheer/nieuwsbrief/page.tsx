'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Edit, Trash2, Save, X, ExternalLink, Video, Newspaper, ChevronDown, ChevronUp } from 'lucide-react'

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
  const [isLoading, setIsLoading] = useState(true)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallbackSrc)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Only set imgSrc if src is not empty
    if (src && src.trim() !== '') {
      setImgSrc(src)
      setHasError(false)
      setIsLoading(true)
    } else {
      // If src is empty, immediately show fallback
      setImgSrc(fallbackSrc)
      setHasError(true)
      setIsLoading(false)
    }
  }, [src, fallbackSrc])

  // Don't render img if imgSrc is empty
  if (!imgSrc || imgSrc.trim() === '') {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center rounded`}>
        <ExternalLink className="text-gray-400" size={16} />
      </div>
    )
  }

  return (
    <div className="relative">
      <img 
        src={imgSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={handleLoad}
        onError={handleError}
        style={{ transition: 'opacity 0.3s ease-in-out' }}
      />
      {isLoading && (
        <div className={`${className} bg-gray-100 flex items-center justify-center animate-pulse absolute inset-0 rounded`}>
          <ExternalLink className="text-gray-400" size={16} />
        </div>
      )}
    </div>
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
  const [imageSrc, setImageSrc] = useState('')

  const fallbackIcon = (
    <div className={`${className} bg-red-100 flex items-center justify-center border-2 border-red-200 rounded`}>
      <div className="text-center">
        <Video className="text-red-500 mx-auto mb-1" size={16} />
        <span className="text-xs text-red-600 font-medium">YouTube</span>
      </div>
    </div>
  )

  useEffect(() => {
    if (!videoId || videoId.trim() === '') {
      setShowFallback(true)
      return
    }

    // Reset states when videoId changes
    setShowFallback(false)
    setImageLoaded(false)
    
    // Try multiple thumbnail qualities in order of preference
    const thumbnailQualities = [
      'maxresdefault', // 1280x720
      'hqdefault',     // 480x360
      'mqdefault',     // 320x180
      'default'        // 120x90
    ]
    
    // Start with the highest quality
    setImageSrc(`https://img.youtube.com/vi/${videoId}/${thumbnailQualities[0]}.jpg`)
  }, [videoId])

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    
    // Check if this is a valid thumbnail (not the default gray placeholder)
    // YouTube returns a 120x90 gray image for invalid videos
    if (img.naturalWidth === 120 && img.naturalHeight === 90) {
      // This might be the default placeholder, try next quality
      const currentSrc = img.src
      const currentQuality = currentSrc.split('/').pop()?.split('.')[0]
      
      const thumbnailQualities = ['maxresdefault', 'hqdefault', 'mqdefault', 'default']
      const currentIndex = thumbnailQualities.indexOf(currentQuality || '')
      
      if (currentIndex < thumbnailQualities.length - 1) {
        // Try next quality
        setImageSrc(`https://img.youtube.com/vi/${videoId}/${thumbnailQualities[currentIndex + 1]}.jpg`)
        return
      } else {
        // This is the last option and it's still a placeholder
        setShowFallback(true)
        return
      }
    }
    
    // Valid image loaded
    setImageLoaded(true)
  }

  const handleImageError = () => {
    const currentSrc = imageSrc
    const currentQuality = currentSrc.split('/').pop()?.split('.')[0]
    
    const thumbnailQualities = ['maxresdefault', 'hqdefault', 'mqdefault', 'default']
    const currentIndex = thumbnailQualities.indexOf(currentQuality || '')
    
    if (currentIndex < thumbnailQualities.length - 1) {
      // Try next quality
      setImageSrc(`https://img.youtube.com/vi/${videoId}/${thumbnailQualities[currentIndex + 1]}.jpg`)
    } else {
      // All options failed, show fallback
      setShowFallback(true)
    }
  }

  if (showFallback || !imageSrc || imageSrc.trim() === '') {
    return fallbackIcon
  }

  return (
    <div className="relative">
      <img 
        src={imageSrc}
        alt={alt}
        className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ transition: 'opacity 0.3s ease-in-out' }}
      />
      {!imageLoaded && (
        <div className={`${className} bg-gray-100 flex items-center justify-center animate-pulse absolute inset-0 rounded`}>
          <Video className="text-gray-400" size={16} />
        </div>
      )}
    </div>
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
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())

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
    if (!url || url.trim() === '') return null
    
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

  // Toggle post expansion
  const togglePostExpansion = (postId: string) => {
    const newExpanded = new Set(expandedPosts)
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId)
    } else {
      newExpanded.add(postId)
    }
    setExpandedPosts(newExpanded)
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
    if (!url || url.trim() === '') return

    setIsPreviewLoading(true)
    try {
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
      if (formData.link && formData.link.trim() !== '' && formData.link.startsWith('http')) {
        generateLinkPreview(formData.link)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [formData.link])

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Laden...</div>
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-6xl">
        {/* Header - Mobile optimized */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Newspaper size={20} className="sm:hidden" />
            <Newspaper size={24} className="hidden sm:block" />
            <span className="hidden sm:inline">Nieuwsbrief</span>
            <span className="sm:hidden">Nieuws</span>
          </h1>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 font-medium shadow-sm w-full sm:w-auto"
          >
            <Plus size={18} />
            <span className="sm:hidden">Nieuwe Post</span>
            <span className="hidden sm:inline">Nieuwe Post</span>
          </button>
        </div>

        {/* Create/Edit Form - Mobile optimized */}
        {isCreating && (
          <div className="bg-white rounded-lg shadow-lg mb-6 sm:mb-8 overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold">
                  {editingPost ? 'Post Bewerken' : 'Nieuwe Post'}
                </h2>
                <button 
                  onClick={resetForm} 
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Link/URL</label>
                  <input
                    type="url"
                    value={formData.link || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="https://example.com or https://youtube.com/watch?v=..."
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                  {isPreviewLoading && <p className="text-sm text-gray-500 mt-1">Preview genereren...</p>}
                </div>

                {/* Link Preview - Mobile optimized */}
                {linkPreview && (
                  <div className="border rounded-lg p-3 sm:p-4 bg-gray-50">
                    <h3 className="font-medium mb-2 text-sm sm:text-base">Preview:</h3>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      {linkPreview.image && linkPreview.image.trim() !== '' && (
                        <div className="w-full sm:w-20 h-20 sm:h-16 flex-shrink-0 relative">
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
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm sm:text-base truncate">{linkPreview.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{linkPreview.description}</p>
                        <p className="text-xs text-blue-600 truncate mt-1">{linkPreview.url}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Titel</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'article' | 'video' }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-y"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content (optioneel)</label>
                  <textarea
                    value={formData.content || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-y"
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
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 font-medium order-2 sm:order-1"
                  >
                    <Save size={18} />
                    {editingPost ? 'Bijwerken' : 'Opslaan'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-medium order-1 sm:order-2"
                  >
                    Annuleren
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Posts List - Mobile optimized */}
        <div className="space-y-3 sm:space-y-4">
          {posts.map((post) => {
            const isExpanded = expandedPosts.has(post._id!)
            
            return (
              <div key={post._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Mobile Card Layout */}
                <div className="sm:hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      {/* Mobile Thumbnail */}
                      {(post.link || post.image) && (
                        <div className="w-16 h-16 flex-shrink-0 relative">
                          {post.type === 'video' && post.link && extractYouTubeId(post.link) ? (
                            <YouTubeThumbnail
                              videoId={extractYouTubeId(post.link)!}
                              alt={post.title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : post.image && post.image.data && post.image.data.trim() !== '' ? (
                            <img
                              src={`data:${post.image.contentType};base64,${post.image.data}`}
                              alt={post.title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                              {post.type === 'video' ? (
                                <Video className="text-gray-400" size={16} />
                              ) : (
                                <ExternalLink className="text-gray-400" size={16} />
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {post.type === 'video' ? (
                            <Video className="text-red-500 flex-shrink-0" size={16} />
                          ) : (
                            <ExternalLink className="text-blue-500 flex-shrink-0" size={16} />
                          )}
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            {post.type}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold line-clamp-2 mb-1">{post.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{post.description}</p>
                      </div>
                    </div>

                    {/* Mobile Meta Info */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>Door: {post.author}</span>
                      <span>{new Date(post.createdAt!).toLocaleDateString('nl-NL')}</span>
                    </div>

                    {/* Mobile Link - Collapsible */}
                    {post.link && post.link.trim() !== '' && (
                      <div className="mb-3">
                        <button
                          onClick={() => togglePostExpansion(post._id!)}
                          className="flex items-center gap-1 text-blue-600 text-sm font-medium"
                        >
                          <span>Link tonen</span>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {isExpanded && (
                          <a
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-blue-600 hover:underline text-sm mt-2 break-all"
                          >
                            {post.link}
                          </a>
                        )}
                      </div>
                    )}

                    {/* Mobile Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(post)}
                        className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-100 text-sm font-medium"
                      >
                        <Edit size={16} />
                        Bewerken
                      </button>
                      <button
                        onClick={() => handleDelete(post._id!)}
                        className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg flex items-center justify-center gap-2 hover:bg-red-100 text-sm font-medium"
                      >
                        <Trash2 size={16} />
                        Verwijderen
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop Card Layout */}
                <div className="hidden sm:block p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 flex-1">
                      {/* Desktop Thumbnail */}
                      {(post.link || post.image) && (
                        <div className="w-20 h-20 flex-shrink-0 relative">
                          {post.type === 'video' && post.link && extractYouTubeId(post.link) ? (
                            <YouTubeThumbnail
                              videoId={extractYouTubeId(post.link)!}
                              alt={post.title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : post.image && post.image.data && post.image.data.trim() !== '' ? (
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

                      <div className="flex-1 min-w-0">
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
                        {post.link && post.link.trim() !== '' && (
                          <a
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm break-all"
                          >
                            {post.link}
                          </a>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                          Door: {post.author} • {new Date(post.createdAt!).toLocaleDateString('nl-NL')}
                        </p>
                      </div>
                    </div>

                    {/* Desktop Actions */}
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => startEdit(post)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(post._id!)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
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
    </div>
  )
}