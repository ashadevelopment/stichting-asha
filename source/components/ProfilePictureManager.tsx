import { useState, useRef, useEffect } from 'react';
import { Upload, Trash, Camera } from 'lucide-react';

interface ProfilePictureManagerProps {
  userId: string;
  name?: string;
  email?: string;
  initial?: string;
  size?: number;
  editable?: boolean;
  onSuccess?: () => void;
  className?: string;
  showButtons?: boolean;
}

export default function ProfilePictureManager({
  userId,
  name,
  email,
  initial,
  size = 64,
  editable = true,
  onSuccess,
  className = '',
  showButtons = true
}: ProfilePictureManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState(Date.now());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get initial from name if not provided
  const displayInitial = initial || (name && name.charAt(0).toUpperCase()) || (email && email.charAt(0).toUpperCase()) || 'U';
  
  // Check if user has an image on component mount
  useEffect(() => {
    const checkUserImage = async () => {
      try {
        const response = await fetch(`/api/users/profile-picture?userId=${userId}&t=${refreshTrigger}`);
        
        if (response.ok) {
          const imageData = await response.json();
          setHasImage(!!imageData.data); // Ensure data exists
          setPreviewUrl(`data:${imageData.contentType};base64,${imageData.data}`);
        } else {
          setHasImage(false);
          setPreviewUrl(null);
        }
      } catch (error) {
        console.error("Error checking profile picture:", error);
        setHasImage(false);
        setPreviewUrl(null);
      }
    };
    
    if (userId) {
      checkUserImage();
    }
  }, [userId, refreshTrigger]);

  // Generate a deterministic color based on the initial (but with brand color base)
  const getBackgroundStyle = (char: string) => {
    // Base color is #2E376E
    const baseHue = 232; // Approximate hue of #2E376E
    
    // Generate a slight variation based on the character code
    const hueVariation = char.charCodeAt(0) % 20 - 10; // -10 to +10 variation
    const hue = baseHue + hueVariation;
    
    // Generate two slightly different saturations and lightnesses for gradient
    const sat1 = 50 + (char.charCodeAt(0) % 15);
    const sat2 = sat1 - 5;
    const light1 = 25 + (char.charCodeAt(0) % 10);
    const light2 = light1 - 8;

    return {
      background: `linear-gradient(135deg, hsl(${hue}, ${sat1}%, ${light1}%), hsl(${hue}, ${sat2}%, ${light2}%))`
    };
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('profilePicture', file);
      
      try {
        const response = await fetch('/api/users/profile-picture', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to upload profile picture');
        }
        
        setHasImage(true);
        setRefreshTrigger(Date.now()); // Force refresh of image
        if (onSuccess) onSuccess();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        // Reset preview on error
        setPreviewUrl(null);
      } finally {
        setLoading(false);
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Revoke object URL to avoid memory leaks
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      }
    }
  };
  
  const handleDelete = async () => {
    if (!confirm('Weet je zeker dat je deze profielfoto wilt verwijderen?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Fixed: Use the correct DELETE method and endpoint
      const response = await fetch('/api/users/profile-picture', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete profile picture');
      }
      
      setHasImage(false);
      setPreviewUrl(null);
      setRefreshTrigger(Date.now());
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div 
        className={`relative rounded-full overflow-hidden ${editable ? 'cursor-pointer' : ''}`}
        style={{ width: size, height: size }}
        onClick={() => editable && fileInputRef.current?.click()}
      >
        {(previewUrl && hasImage) ? (
          <img 
            src={previewUrl}
            alt={name || "Profiel"} 
            className="w-full h-full object-cover"
            onError={() => {
              console.error("Image failed to load");
              setHasImage(false);
            }}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center text-white font-bold uppercase"
            style={getBackgroundStyle(displayInitial)}
          >
            <span style={{ fontSize: size * 0.4 }}>{displayInitial}</span>
          </div>
        )}
        
        {editable && (
          <div className="absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center transition-all duration-200 hover:bg-opacity-40">
            <Camera 
              size={size * 0.3} 
              className="text-transparent hover:text-white opacity-0 hover:opacity-100 transition-all duration-200"
            />
          </div>
        )}
      </div>
      
      {editable && showButtons && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleUpload}
          />
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-blue-300 text-sm"
              disabled={loading}
              type="button"
            >
              <Upload size={16} />
              {hasImage ? 'Wijzigen' : 'Uploaden'}
            </button>
            
            {hasImage && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:bg-red-300 text-sm"
                disabled={loading}
                type="button"
              >
                <Trash size={16} />
                Verwijderen
              </button>
            )}
          </div>
          
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
          
          {loading && (
            <div className="flex items-center mt-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
              <p className="text-blue-600 text-sm">Verwerken...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}