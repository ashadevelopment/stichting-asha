"use client";

import { useState, useEffect } from 'react';
import { FilmIcon } from 'lucide-react';

interface MediaItem {
  _id: string;
  title: string;
  description?: string;
  media: {
    data: string;
    contentType: string;
    type: 'image' | 'video';
  };
}

export default function Fotoboek() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMediaItems = async () => {
      try {
        setLoading(true);
        console.log('Fetching media items...');
        
        const res = await fetch('/api/media', {
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
        
        const responseText = await res.text();
        console.log('Response received:', responseText.substring(0, 100) + '...');
        
        const data = JSON.parse(responseText);
        const mediaArray = Array.isArray(data) ? data : [];
        console.log(`Processed ${mediaArray.length} media items`);
        
        setMediaItems(mediaArray);
      } catch (error) {
        console.error('Error fetching media:', error);
        setError(error instanceof Error ? error.message : 'Fout bij het ophalen van media');
      } finally {
        setLoading(false);
      }
    };

    fetchMediaItems();
  }, []);

  // Get a deterministic size for each media item based on its ID
  const getItemSize = (id: string) => {
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
    
    return (
      <div 
        key={item._id} 
        className={`${sizeClass} overflow-hidden rounded-lg shadow-md cursor-pointer transform transition-transform hover:scale-[1.03] relative`}
        onClick={() => setSelectedItem(item)}
      >
        {item.media.type === 'video' ? (
          <>
            <video 
              src={`data:${item.media.contentType};base64,${item.media.data}`}
              className="w-full h-full object-cover"
              poster="" // You can add a poster image if needed
            />
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 p-1 rounded">
              <FilmIcon size={16} className="text-white" />
            </div>
          </>
        ) : (
          <img 
            src={`data:${item.media.contentType};base64,${item.media.data}`}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  };

  // Render the modal content based on media type
  const renderModalContent = () => {
    if (!selectedItem) return null;
    
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedItem(null)}
      >
        <div 
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {selectedItem.title}
              {selectedItem.media.type === 'video' && (
                <span className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  <FilmIcon size={12} className="mr-1" /> Video
                </span>
              )}
            </h3>
            <button 
              onClick={() => setSelectedItem(null)}
              className="text-gray-500 hover:text-gray-700"
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
          
          <div className="relative h-[50vh] overflow-hidden bg-black">
            {selectedItem.media.type === 'video' ? (
              <video 
                src={`data:${selectedItem.media.contentType};base64,${selectedItem.media.data}`}
                className="w-full h-full object-contain"
                controls
                autoPlay
              />
            ) : (
              <img 
                src={`data:${selectedItem.media.contentType};base64,${selectedItem.media.data}`}
                alt={selectedItem.title}
                className="w-full h-full object-contain"
              />
            )}
          </div>
          
          {selectedItem.description && (
            <div className="p-4 border-t">
              <p className="text-gray-700">{selectedItem.description}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] py-12 pt-24 md:pt-20">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-[#1E2A78] mb-8 text-center">Fotoboek</h1>
        <p className="text-gray-500 text-center mb-8">Bekijk onze mooiste momenten!</p>

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-min">
            {mediaItems.map((item) => {
              const size = getItemSize(item._id);
              return renderMediaItem(item, size);
            })}
          </div>
        )}
      </div>

      {/* Media modal */}
      {renderModalContent()}
    </div>
  );
}