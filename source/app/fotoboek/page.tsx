"use client";

import { useState, useEffect } from 'react';
import { FilmIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaItem {
  _id: string;
  title: string;
  description?: string;
  media: {
    data?: string;
    contentType: string;
    type: 'image' | 'video';
  };
  thumbnail?: {
    data: string;
    contentType: string;
  };
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function Fotoboek() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [selectedItemFull, setSelectedItemFull] = useState<MediaItem | null>(null);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false
  });

  const fetchMediaItems = async (page: number = 1) => {
    try {
      setLoading(true);
      console.log(`Fetching media items for page ${page}...`);
      
      const res = await fetch(`/api/media?page=${page}&limit=20&includeData=false`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API error response:', errorText);
        throw new Error(`API Error: ${res.status} ${res.statusText || 'Unknown error'}`);
      }
      
      const data = await res.json();
      console.log(`Processed ${data.items.length} media items`);
      
      setMediaItems(data.items || []);
      setPagination(data.pagination || {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        limit: 20,
        hasNextPage: false,
        hasPrevPage: false
      });
    } catch (error) {
      console.error('Error fetching media:', error);
      setError(error instanceof Error ? error.message : 'Fout bij het ophalen van media');
    } finally {
      setLoading(false);
    }
  };

  const fetchFullMediaItem = async (id: string) => {
    try {
      const res = await fetch(`/api/media/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch full media item');
      }
      const fullItem = await res.json();
      setSelectedItemFull(fullItem);
    } catch (error) {
      console.error('Error fetching full media item:', error);
      setError('Fout bij het laden van media');
    }
  };

  useEffect(() => {
    fetchMediaItems(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchMediaItems(newPage);
    }
  };

  const handleItemClick = (item: MediaItem) => {
    setSelectedItem(item);
    setSelectedItemFull(null);
    fetchFullMediaItem(item._id);
  };

  // Get a deterministic size for each media item based on its ID
  const getItemSize = (id: string, isVideo: boolean = false) => {
    if (isVideo) return 'medium';
    
    const charCode = id.charCodeAt(0) + id.charCodeAt(id.length - 1);
    if (charCode % 3 === 0) return 'small';
    if (charCode % 3 === 1) return 'medium';
    return 'large';
  };

  // Get the appropriate CSS class based on size
  const getSizeClass = (size: string) => {
    switch (size) {
      case 'small':
        return 'col-span-1 row-span-1 h-32';
      case 'medium':
        return 'col-span-1 row-span-2 h-64';
      case 'large':
        return 'col-span-2 row-span-2 h-64';
      default:
        return 'col-span-1 row-span-1 h-32';
    }
  };

  // Render media items based on type (image or video)
  const renderMediaItem = (item: MediaItem, size: string) => {
    const sizeClass = getSizeClass(size);
    
    // Use thumbnail if available, otherwise use full data
    const imageData = item.thumbnail?.data || item.media.data;
    const imageContentType = item.thumbnail?.contentType || item.media.contentType;
    
    return (
      <div 
        key={item._id} 
        className={`${sizeClass} overflow-hidden rounded-lg shadow-md cursor-pointer transform transition-transform hover:scale-[1.03] relative`}
        onClick={() => handleItemClick(item)}
      >
        {item.media.type === 'video' ? (
          <>
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <FilmIcon size={48} className="text-white" />
            </div>
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 p-1 rounded">
              <FilmIcon size={16} className="text-white" />
            </div>
          </>
        ) : (
          imageData && (
            <img 
              src={`data:${imageContentType};base64,${imageData}`}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )
        )}
      </div>
    );
  };

  // Render the modal content based on media type
  const renderModalContent = () => {
    if (!selectedItem) return null;
    
    const fullItem = selectedItemFull || selectedItem;
    
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 overflow-y-auto pt-18"
        onClick={() => {
          setSelectedItem(null);
          setSelectedItemFull(null);
        }}
      >
        <div 
          className="bg-white rounded-lg max-w-4xl w-full mx-auto my-auto overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="p-4 flex justify-between items-center bg-white border-b sticky top-0 z-10">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
              {selectedItem.title}
              {selectedItem.media.type === 'video' && (
                <span className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  <FilmIcon size={12} className="mr-1" /> Video
                </span>
              )}
            </h3>
            <button 
              onClick={() => {
                setSelectedItem(null);
                setSelectedItemFull(null);
              }}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Media container */}
          <div className="relative flex-grow bg-black">
            {!selectedItemFull ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : selectedItem.media.type === 'video' ? (
              <video 
                src={`data:${fullItem.media.contentType};base64,${fullItem.media.data}`}
                className="w-full object-contain max-h-[50vh]"
                controls
                autoPlay
              />
            ) : (
              <img 
                src={`data:${fullItem.media.contentType};base64,${fullItem.media.data}`}
                alt={selectedItem.title}
                className="w-full object-contain max-h-[50vh]"
              />
            )}
          </div>
          
          {/* Description section */}
          {selectedItem.description && (
            <div className="p-4 border-t bg-white">
              <p className="text-gray-700">{selectedItem.description}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Separate media items into images and videos
  const imageItems = mediaItems.filter(item => item.media.type === 'image');
  const videoItems = mediaItems.filter(item => item.media.type === 'video');

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] py-12 pt-24 md:pt-20">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-[#1E2A78] mb-8 text-center">Fotoboek</h1>
        <p className="text-gray-500 text-center mb-8">
          Bekijk onze mooiste momenten! Klik op een foto/video voor meer informatie!
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4 text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1E2A78]"></div>
            <p className="mt-2 text-[#1E2A78]">Media laden...</p>
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nog geen foto's of video's beschikbaar.</p>
          </div>
        ) : (
          <>
            <div>
              {/* Images section */}
              {imageItems.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-min mb-8">
                  {imageItems.map((item) => {
                    const size = getItemSize(item._id);
                    return renderMediaItem(item, size);
                  })}
                </div>
              )}
              
              {/* Videos section */}
              {videoItems.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-min mt-4">
                  {videoItems.map((item) => {
                    const size = getItemSize(item._id, true);
                    return renderMediaItem(item, size);
                  })}
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Vorige
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === pagination.currentPage
                          ? 'bg-[#1E2A78] text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Volgende
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            )}
            
            {/* Media count info */}
            <div className="text-center mt-4 text-gray-500 text-sm">
              Toont {mediaItems.length} van {pagination.totalItems} items
            </div>
          </>
        )}
      </div>

      {/* Media modal */}
      {renderModalContent()}
    </div>
  );
}