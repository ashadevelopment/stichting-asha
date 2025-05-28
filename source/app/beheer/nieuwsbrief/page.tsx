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

  // Generate link preview
  const generateLinkPreview = async (url: string) => {
    if (!url) return

    setIsPreviewLoading(true)
    try {
      // Check if it's a YouTube URL
      const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
      const youtubeMatch = url.match(youtubeRegex)
      
      if (youtubeMatch) {
        const videoId = youtubeMatch[1]
        setFormData(prev => ({ 
          ...prev, 
          type: 'video', 
          videoUrl: `https://www.youtube.com/embed/${videoId}`,
          title: prev.title || 'YouTube Video',
          description: prev.description || 'Video vanuit YouTube'
        }))
        setLinkPreview({
          title: 'YouTube Video',
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
    if (!confirm('Are you sure you want to delete this post?')) return

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
    return <div className="flex justify-center items-center h-64">Loading...</div>
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

            {/* Link Preview */}
            {linkPreview && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-2">Preview:</h3>
                <div className="flex gap-4">
                  {linkPreview.image && (
                    <img 
                      src={linkPreview.image} 
                      alt="Preview" 
                      className="w-24 h-24 object-cover rounded"
                    />
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

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
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