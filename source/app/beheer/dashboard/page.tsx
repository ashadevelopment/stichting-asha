'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import ProfilePictureManager from '../../../components/ProfilePictureManager'
import { User, Home, BarChart2, Activity } from 'lucide-react'
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

interface ActivityItem {
  _id: string;
  type: 'create' | 'update' | 'delete';
  entityType: string;
  entityId: string;
  entityName: string;
  performedBy: string;
  performedByName: string;
  createdAt: string;
}

// Define the session user type to include firstName and lastName properties
interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  firstName?: string | null;
  lastName?: string | null;
}

// Extend the Session type to use our custom user type
interface CustomSession {
  user?: SessionUser;
}

export default function DashboardPage() {
  const { data: session } = useSession() as { data: CustomSession | null }
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add state for storing the user's details
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  });

  // Function to check if user has access to activities
  const hasActivityAccess = () => {
    const userRole = userDetails.role || (session?.user && 'role' in session.user ? session.user.role : '');
    return userRole === 'beheerder' || userRole === 'developer';
  };

  // Fetch user details whenever session changes
  useEffect(() => {
    async function fetchUserData() {
      console.log('Session data:', session); // Debug log
      
      if (session?.user?.id) {
        try {
          console.log('Fetching user details for ID:', session.user.id);
          
          const response = await fetch(`/api/users/details?userId=${session.user.id}`);
          console.log('API Response status:', response.status);
          
          if (response.ok) {
            const userData = await response.json();
            console.log('User data from API:', userData);
            
            setUserDetails({
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              email: userData.email || '',
              role: userData.role || session?.user?.role || ''
            });
          } else {
            console.log('API call failed, using fallback');
            console.log('Session user object:', session.user);
            
            // Fallback to session data
            const nameParts = session.user.name?.split(' ') || ['', ''];
            console.log('Name parts:', nameParts);
            
            setUserDetails({
              firstName: (session.user.firstName as string) || nameParts[0] || '',
              lastName: (session.user.lastName as string) || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''),
              email: session.user.email || '',
              role: session.user.role || ''
            });
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
          console.log('Using session fallback due to error');
          console.log('Session user:', session.user);
          
          // Emergency fallback
          setUserDetails({
            firstName: session.user.name || '',
            lastName: '',
            email: session.user.email || '',
            role: session.user.role || ''
          });
        }
      } else {
        console.log('No session user ID found');
        console.log('Full session:', session);
      }
    }
    
    fetchUserData();
  }, [session]);

  useEffect(() => {
    async function fetchRecentActivities() {
      // Only fetch activities if user has access
      if (!hasActivityAccess()) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/activities?limit=5', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch activities: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Check if data is an array
        if (!Array.isArray(data)) {
          console.error('Unexpected response format, expected an array:', data);
          setActivities([]);
        } else {
          setActivities(data);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError(error instanceof Error ? error.message : 'Failed to load activities');
      } finally {
        setIsLoading(false);
      }
    }
    
    // Only fetch if user details are loaded
    if (userDetails.role || (session?.user && 'role' in session.user)) {
      fetchRecentActivities();
      
      // Set up a polling mechanism to refresh activities every minute (only if user has access)
      if (hasActivityAccess()) {
        const intervalId = setInterval(fetchRecentActivities, 60000);
        return () => clearInterval(intervalId);
      }
    }
  }, [userDetails.role, session?.user]);

  function formatActivityMessage(activity: ActivityItem) {
    try {
      const { type, entityType, entityName, performedByName } = activity;
      let message = '';
      let iconColor = '';

      // Check for undefined values - set fallbacks
      const displayEntityType = entityType || 'item';
      const displayEntityName = entityName || 'Onbekend';
      const displayPerformer = performedByName || 'Iemand';

      switch (type) {
        case 'create':
          message = `${displayPerformer} heeft een nieuwe ${displayEntityType} aangemaakt: ${displayEntityName}`;
          iconColor = 'text-green-500';
          break;
        case 'update':
          message = `${displayPerformer} heeft ${displayEntityType} bijgewerkt: ${displayEntityName}`;
          iconColor = 'text-blue-500';
          break;
        case 'delete':
          message = `${displayPerformer} heeft ${displayEntityType} verwijderd: ${displayEntityName}`;
          iconColor = 'text-red-500';
          break;
        default:
          message = `${displayPerformer} heeft een actie uitgevoerd op ${displayEntityType}: ${displayEntityName}`;
          iconColor = 'text-gray-500';
      }

      // Check if createdAt is valid before formatting
      let timestamp;
      try {
        timestamp = format(new Date(activity.createdAt), 'dd MMMM yyyy HH:mm', { locale: nl });
      } catch (dateError) {
        timestamp = 'Onbekende datum';
      }

      return { message, timestamp, iconColor };
    } catch (err) {
      console.error('Error formatting activity message:', err, activity);
      return {
        message: 'Onbekende activiteit',
        timestamp: 'Onbekende datum',
        iconColor: 'text-gray-500'
      };
    }
  }

  // Updated function to get the user's full name with proper type handling
  const getUserFullName = () => {
    // First try from our fetched userDetails
    if (userDetails.firstName && userDetails.lastName) {
      return `${userDetails.firstName} ${userDetails.lastName}`;
    } 
    else if (userDetails.firstName) {
      return userDetails.firstName;
    }
    // Then try from session, with type assertions
    else if (session?.user && 'firstName' in session.user && 'lastName' in session.user &&
             session.user.firstName && session.user.lastName) {
      return `${session.user.firstName} ${session.user.lastName}`;
    } 
    else if (session?.user && 'firstName' in session.user && session.user.firstName) {
      return session.user.firstName as string;
    }
    else if (session?.user?.name) {
      return session.user.name;
    }
    else {
      return 'Beheerder';
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Welkomstkaart met profielfoto en naam */}
      <div className="bg-white p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Profielfoto sectie */}
          <div className="flex-shrink-0">
            {session?.user?.id ? (
              <ProfilePictureManager 
                userId={session.user.id}
                name={getUserFullName()}
                size={84}
                editable={false}
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold uppercase">
                {getUserFullName().charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Welkomsttekst */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1E2A78] mb-1">
              Welkom, {getUserFullName()}
            </h1>
            <p className="text-sm text-gray-500 italic capitalize">
              {userDetails.role || (session?.user && 'role' in session.user ? session.user.role : 'Onbekend')}
            </p>
          </div>
        </div>
      </div>

      {/* Dashboardtegels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Snelkoppeling: Gebruikers */}
        <div 
          className="bg-white p-4 sm:p-6 rounded-lg shadow-md transition-transform hover:scale-[1.02] hover:bg-[#1E2A78] cursor-pointer group" 
          onClick={() => window.location.href = '/beheer/gebruikers'}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <User size={24} className="text-blue-600 group-hover:text-white" />
            </div>
            <h2 className="text-lg font-semibold group-hover:text-white">Gebruikers</h2>
          </div>
          <p className="text-gray-600 text-sm group-hover:text-white">
            Beheer gebruikers, wijzig rollen, en bekijk gebruikersgegevens.
          </p>
        </div>

        {/* Snelkoppeling: Website */}
        <div 
          className="bg-white p-4 sm:p-6 rounded-lg shadow-md transition-transform hover:scale-[1.02] hover:bg-[#1E2A78] cursor-pointer group"
          onClick={() => window.location.href = '/'}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Home size={24} className="text-green-600 group-hover:text-white" />
            </div>
            <h2 className="text-lg font-semibold group-hover:text-white">Website</h2>
          </div>
          <p className="text-gray-600 text-sm group-hover:text-white">
            Ga naar de voorpagina van je website om te zien hoe het eruitziet voor bezoekers.
          </p>
        </div>

        {/* Snelkoppeling: Statistieken */}
        <div 
          className="bg-white p-4 sm:p-6 rounded-lg shadow-md transition-transform hover:scale-[1.02] hover:bg-[#1E2A78] cursor-pointer group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <BarChart2 size={24} className="text-purple-600 group-hover:text-white" />
            </div>
            <h2 className="text-lg font-semibold group-hover:text-white">Statistieken</h2>
          </div>
          <p className="text-gray-600 text-sm group-hover:text-white">
            Bekijk site-activiteit en bezoekersstatistieken (binnenkort beschikbaar).
          </p>
        </div>
      </div>

      {/* Recente activiteiten - only show for beheerder and developer */}
      {hasActivityAccess() && (
        <div className="bg-white p-4 sm:p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity size={24} /> Recente activiteiten
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-md">
              <p>Fout bij laden van activiteiten: {error}</p>
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-4 cursor-pointer">
              {activities.map((activity, index) => {
                const { message, timestamp, iconColor } = formatActivityMessage(activity);
                return (
                  <div 
                    key={`activity-${activity._id || index}`} 
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`mt-1 ${iconColor}`}>
                      <Activity size={18} />
                    </div>
                    <div>
                      <p className="text-gray-800 text-sm">{message}</p>
                      <p className="text-xs text-gray-500">{timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-4">Geen recente activiteiten gevonden.</p>
          )}
        </div>
      )}
    </div>
  )
}