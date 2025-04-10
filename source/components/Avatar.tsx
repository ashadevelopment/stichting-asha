interface AvatarProps {
    userId?: string;
    name?: string;
    src?: string | null;
    initial?: string;
    size?: number;
    onError?: () => void;
  }
  
  export default function Avatar({ userId, name, src, initial, size = 40, onError }: AvatarProps) {
    // If we have a userId, we'll try to load from the API
    const apiSrc = userId ? `/api/users/profile-picture?userId=${userId}` : undefined;
    
    // Get initial from name if not provided
    const displayInitial = initial || (name && name.charAt(0).toUpperCase()) || 'U';
    
    // Generate a deterministic color based on the initial
    const getColorClass = (char: string) => {
      const colors = [
        "from-blue-400 to-blue-600",
        "from-green-400 to-green-600",
        "from-yellow-400 to-yellow-600",
        "from-red-400 to-red-600", 
        "from-purple-400 to-purple-600",
        "from-pink-400 to-pink-600",
        "from-indigo-400 to-indigo-600",
        "from-teal-400 to-teal-600"
      ];
      const index = char.charCodeAt(0) % colors.length;
      return colors[index];
    };
    
    const colorClass = getColorClass(displayInitial);
  
    return (
      <>
        {(src || apiSrc) ? (
          <img
            src={src || apiSrc}
            alt="Profile"
            className="rounded-full object-cover"
            style={{ width: size, height: size }}
            onError={(e) => {
              // Hide the image on error and show the fallback
              e.currentTarget.style.display = 'none';
              onError && onError();
            }}
          />
        ) : (
          <div
            className={`rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white font-bold uppercase`}
            style={{ width: size, height: size, fontSize: size / 2 }}
          >
            {displayInitial}
          </div>
        )}
      </>
    );
  }