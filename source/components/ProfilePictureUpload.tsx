import { useState, useRef } from 'react';
import { Camera, Trash, Upload } from 'lucide-react';
import Avatar from './Avatar';

interface ProfilePictureUploadProps {
  userId: string;
  name?: string;
  initial?: string;
  onSuccess?: () => void;
  className?: string;
}

export default function ProfilePictureUpload({ 
  userId, 
  name, 
  initial, 
  onSuccess, 
  className = '' 
}: ProfilePictureUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      setError(null);
      
      const file = e.target.files[0];
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
        if (onSuccess) onSuccess();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/users/profile-picture/delete', {
        method: 'POST',
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
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <Avatar 
          userId={userId} 
          name={name} 
          initial={initial} 
          size={120} 
          onError={() => setHasImage(false)}
        />
        
        {/* Camera icon to trigger file upload */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
          disabled={loading}
        >
          <Camera size={16} />
        </button>
      </div>
      
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
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-blue-300"
          disabled={loading}
        >
          <Upload size={16} />
          {hasImage ? 'Change' : 'Upload'}
        </button>
        
        {hasImage && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:bg-red-300"
            disabled={loading}
          >
            <Trash size={16} />
            Delete
          </button>
        )}
      </div>
      
      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
      
      {loading && (
        <p className="text-blue-600 text-sm mt-2">Please wait...</p>
      )}
    </div>
  );
}