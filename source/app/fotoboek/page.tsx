"use client";

import { useState, useEffect } from 'react';

interface Photo {
  _id: string;
  title: string;
  description?: string;
  image: {
    data: string;
    contentType: string;
  };
}

export default function Fotoboek() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch('/api/photos');
        const data = await res.json();
        setPhotos(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching photos:', error);
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  // Function to get a random size for each photo to create abstract grid
  const getRandomSize = () => {
    const sizes = ['small', 'medium', 'large'];
    const randomIndex = Math.floor(Math.random() * sizes.length);
    return sizes[randomIndex];
  };

  // Assign a consistent size to each photo based on its ID
  const getPhotoSize = (id: string) => {
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

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-[#1E2A78] mb-8 text-center">Fotoboek</h1>
        <p className="text-gray-500 text-center mb-8">Bekijk onze mooiste momenten!</p>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1E2A78]"></div>
            <p className="mt-2 text-[#1E2A78]">Foto's laden...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nog geen foto's beschikbaar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-min">
            {photos.map((photo) => {
              const size = getPhotoSize(photo._id);
              return (
                <div 
                  key={photo._id} 
                  className={`${getSizeClass(size)} overflow-hidden rounded-lg shadow-md cursor-pointer transform transition-transform hover:scale-[1.03]`}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img 
                    src={`data:${photo.image.contentType};base64,${photo.image.data}`}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Photo modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">{selectedPhoto.title}</h3>
              <button 
                onClick={() => setSelectedPhoto(null)}
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
            <div className="relative h-[50vh] overflow-hidden">
              <img 
                src={`data:${selectedPhoto.image.contentType};base64,${selectedPhoto.image.data}`}
                alt={selectedPhoto.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}