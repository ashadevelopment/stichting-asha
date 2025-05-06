"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { FileText, ExternalLink, PlayCircle } from 'lucide-react';

interface Newsletter {
  _id: string;
  title: string;
  description: string;
  content: string;
  type: 'article' | 'video';
  link?: string;
  videoUrl?: string;
  author: string;
  createdAt: string;
  image?: {
    filename: string;
    contentType: string;
    data: string;
  };
}

export default function Nieuwsbrief() {
  const [posts, setPosts] = useState<Newsletter[]>([]);
  const [selectedPost, setSelectedPost] = useState<Newsletter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/newsletter');
        
        if (!res.ok) {
          throw new Error('Er is een fout opgetreden bij het ophalen van de nieuwsberichten');
        }
        
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error('Fout bij ophalen nieuwsberichten:', err);
        setError('Er is een fout opgetreden bij het ophalen van de nieuwsberichten');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);**/

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F2F2F2] flex items-center justify-center pt-24 md:pt-20">
        <p className="text-gray-500">Nieuwsberichten aan het laden...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full min-h-screen bg-[#F2F2F2] flex items-center justify-center pt-24 md:pt-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Open post modal
  const openPostModal = (post: Newsletter) => {
    setSelectedPost(post);
  };

  // Close post modal
  const closePostModal = () => {
    setSelectedPost(null);
  };

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] py-12 pt-24 md:pt-20">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-[#1E2A78] mb-8 text-center">Nieuwsbrief</h1>

        {posts.length === 0 ? (
          <p className="text-center text-gray-500">Momenteel geen nieuwsberichten beschikbaar.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-105"
                onClick={() => openPostModal(post)}
              >
                {post.image && post.image.data && (
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={`data:${post.image.contentType};base64,${post.image.data}`} 
                      alt={post.title} 
                      className="w-full h-full object-cover"
                    />
                    {post.type === 'video' && (
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <PlayCircle size={48} className="text-white" />
                      </div>
                    )}
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#1E2A78] break-words min-h-[3.5rem]">
                    {post.title}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm mt-2">
                    <FileText size={16} className="mr-2 shrink-0" />
                    <span className="truncate">
                      {format(new Date(post.createdAt), 'd MMMM yyyy', { locale: nl })}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2 line-clamp-3">{post.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Details Modal */}
      {selectedPost && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={closePostModal}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={closePostModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Post Image/Video */}
            {selectedPost.image && selectedPost.image.data && (
              <div className="w-full h-64 md:h-96 overflow-hidden">
                <img 
                  src={`data:${selectedPost.image.contentType};base64,${selectedPost.image.data}`}
                  alt={selectedPost.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Embedded Video */}
            {selectedPost.type === 'video' && selectedPost.videoUrl && (
              <div className="w-full aspect-video">
                <iframe
                  src={selectedPost.videoUrl}
                  title={selectedPost.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}

            {/* Post Details */}
            <div className="p-8">
              <h2 className="text-3xl font-bold text-[#1E2A78] mb-4 break-words">{selectedPost.title}</h2>
              
              {/* Date and Type */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-gray-600">
                  <FileText size={20} className="mr-2" />
                  {format(new Date(selectedPost.createdAt), 'd MMMM yyyy', { locale: nl })}
                </div>
                
                <div className="text-sm text-gray-600 capitalize">
                  {selectedPost.type === 'article' ? 'Artikel' : 'Video'}
                </div>
              </div>

              {/* Short Description */}
              <p className="text-gray-700 mb-6">{selectedPost.description}</p>

              {/* Full Content */}
              {selectedPost.content && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-[#1E2A78] mb-2">Details</h3>
                  <p className="text-gray-700 whitespace-pre-line">{selectedPost.content}</p>
                </div>
              )}

              {/* External Link */}
              {selectedPost.link && (
                <div className="mt-6">
                  <a
                    href={selectedPost.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-md"
                  >
                    <ExternalLink size={20} className="mr-2" />
                    Lees meer
                  </a>
                </div>
              )}

              {/* Author */}
              <div className="mt-4 text-sm text-gray-500">
                Gepubliceerd door: {selectedPost.author}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}