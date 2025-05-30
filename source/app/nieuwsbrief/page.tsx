'use client'

import { useState, useEffect } from 'react'
import { Grid, List, Video, ExternalLink, Calendar, User, Settings } from 'lucide-react'

interface NewsletterPost {
  _id: string
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
  createdAt: string
  updatedAt: string
}

type LayoutType = 'template1' | 'template2' | 'template3'

export default function NewsletterPage() {
  const [posts, setPosts] = useState<NewsletterPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [layout, setLayout] = useState<LayoutType>('template1')
  const [showLayoutSelector, setShowLayoutSelector] = useState(false)

  // Load layout preference from localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem('newsletter-layout') as LayoutType
    if (savedLayout) {
      setLayout(savedLayout)
    }
  }, [])

  // Save layout preference
  const changeLayout = (newLayout: LayoutType) => {
    setLayout(newLayout)
    localStorage.setItem('newsletter-layout', newLayout)
    setShowLayoutSelector(false)
  }

  // Fetch newsletter posts
  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/newsletter?sort=createdAt&order=desc')
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

  useEffect(() => {
    fetchPosts()
  }, [])

  // Get image URL for display
  const getImageUrl = (post: NewsletterPost) => {
    if (post.image?.data) {
      return `data:${post.image.contentType};base64,${post.image.data}`
    }
    
    // Extract YouTube thumbnail if it's a YouTube video
    if (post.type === 'video' && post.videoUrl) {
      const videoIdMatch = post.videoUrl.match(/embed\/([^?]+)/)
      if (videoIdMatch) {
        return `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`
      }
    }
    
    return null
  }

  // Render video component
  const renderVideo = (post: NewsletterPost) => {
    if (!post.videoUrl) return null
    
    return (
      <div className="aspect-video w-full">
        <iframe
          src={post.videoUrl}
          title={post.title}
          className="w-full h-full rounded-lg"
          allowFullScreen
        />
      </div>
    )
  }

  // Render article card
  const renderArticleCard = (post: NewsletterPost, className = '') => {
    const imageUrl = getImageUrl(post)
    
    return (
      <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={post.title}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            {post.type === 'video' ? (
              <Video className="text-red-500" size={18} />
            ) : (
              <ExternalLink className="text-blue-500" size={18} />
            )}
            <span className="text-sm font-medium text-gray-500 uppercase">
              {post.type === 'video' ? 'Video' : 'Artikel'}
            </span>
          </div>
          
          <h3 className="text-xl font-bold mb-3">{post.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-3">{post.description}</p>
          
          {post.content && (
            <div className="text-gray-700 mb-4 line-clamp-4">
              {post.content}
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{new Date(post.createdAt).toLocaleDateString('nl-NL')}</span>
            </div>
          </div>
          
          {post.link && (
            <a
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded font-medium hover:bg-yellow-500 transition-colors"
            >
              Lees Meer
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>
    )
  }

  // Template 1: Mixed layout with sidebar
  const renderTemplate1 = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main content area */}
      <div className="lg:col-span-2 space-y-8">
        {posts.slice(0, 2).map((post) => (
          <div key={post._id}>
            {post.type === 'video' ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Video className="text-red-500" size={20} />
                  <h3 className="text-xl font-bold">{post.title}</h3>
                </div>
                {renderVideo(post)}
                <p className="text-gray-600 mt-4">{post.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                  <span>{post.author}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString('nl-NL')}</span>
                </div>
              </div>
            ) : (
              renderArticleCard(post)
            )}
          </div>
        ))}
      </div>
      
      {/* Sidebar - Show remaining posts */}
      <div className="space-y-6">
        {posts.slice(2).map((post) => (
          <div key={post._id} className="bg-white rounded-lg shadow p-4">
            <div className="flex gap-3">
              {getImageUrl(post) && (
                <img 
                  src={getImageUrl(post)!} 
                  alt={post.title}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{post.title}</h4>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{post.description}</p>
                {post.link && (
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-yellow-400 text-black px-2 py-1 rounded text-xs font-medium hover:bg-yellow-500"
                  >
                    Lees Meer
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Template 2: Grid layout - show all posts
  const renderTemplate2 = () => (
    <div className="space-y-8">
      {/* Show all posts in responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {posts.map((post) => (
          <div key={post._id}>
            {renderArticleCard(post, 'h-full')}
          </div>
        ))}
      </div>
    </div>
  )

  // Template 3: Single column layout - show all posts
  const renderTemplate3 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-8">
        {posts.map((post) => (
          <div key={post._id}>
            {post.type === 'video' ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Video className="text-red-500" size={20} />
                  <h3 className="text-xl font-bold">{post.title}</h3>
                </div>
                {renderVideo(post)}
                <p className="text-gray-600 mt-4">{post.description}</p>
                {post.content && (
                  <div className="text-gray-700 mt-4">{post.content}</div>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                  <span>{post.author}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString('nl-NL')}</span>
                </div>
                {post.link && (
                  <div className="mt-4">
                    <a
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded font-medium hover:bg-yellow-500 transition-colors"
                    >
                      Bekijk op YouTube
                      <ExternalLink size={16} />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="md:flex">
                  {getImageUrl(post) && (
                    <div className="md:w-1/3">
                      <img 
                        src={getImageUrl(post)!} 
                        alt={post.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                  )}
                  <div className={`p-6 ${getImageUrl(post) ? 'md:w-2/3' : 'w-full'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <ExternalLink className="text-blue-500" size={18} />
                      <span className="text-sm font-medium text-gray-500 uppercase">Artikel</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.description}</p>
                    
                    {post.content && (
                      <div className="text-gray-700 mb-4">{post.content}</div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(post.createdAt).toLocaleDateString('nl-NL')}</span>
                      </div>
                    </div>
                    
                    {post.link && (
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded font-medium hover:bg-yellow-500 transition-colors"
                      >
                        Lees Meer
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Nieuwsbrief laden...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
        {/* Header */}
        <div className="w-full pt-24 md:pt-20 pb-8">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-center items-center gap-4">
            <h1 className="text-3xl font-bold text-[#1E2A78] text-center md:text-left">
                Nieuwsbrief
            </h1>

            {/* Layout Switch Button */}
            <div className="relative left-22">
                <button
                onClick={() => setShowLayoutSelector(!showLayoutSelector)}
                className="bg-yellow-400 text-white px-3 py-1 rounded flex items-center gap-2 hover:bg-yellow-500"
                >
                Template {layout.slice(-1)}
                <Settings size={16} />
                </button>

                {showLayoutSelector && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border p-2 z-10">
                    {['template1', 'template2', 'template3'].map((tpl) => (
                    <button
                        key={tpl}
                        onClick={() => changeLayout(tpl as LayoutType)}
                        className={`block w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                        layout === tpl ? 'bg-yellow-100' : ''
                        }`}
                    >
                        Template {tpl.slice(-1)}
                    </button>
                    ))}
                </div>
                )}
            </div>
            </div>
        </div>

        {/* Main content */}
        <div className="container mx-auto px-4 pt-4 pb-12">
            {layout === 'template1' && renderTemplate1()}
            {layout === 'template2' && renderTemplate2()}
            {layout === 'template3' && renderTemplate3()}

            {posts.length === 0 && (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                Nog geen nieuwsbrief content beschikbaar.
                </p>
            </div>
            )}
        </div>
    </div>
  )
}