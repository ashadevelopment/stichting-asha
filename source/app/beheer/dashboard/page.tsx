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

export default function DashboardPage() {
  const { data: session } = useSession()
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecentActivities() {
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
    
    fetchRecentActivities();
    
    // Set up a polling mechanism to refresh activities every minute
    const intervalId = setInterval(fetchRecentActivities, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

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

  return (
    <div className="p-4 sm:p-6">
      {/* Welkomstkaart met profielfoto en naam */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Profielfoto sectie */}
          <div className="flex-shrink-0">
            {session?.user?.id ? (
              <ProfilePictureManager 
                userId={session.user.id}
                name={session.user.name || undefined}
                size={84}
                editable={false}
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold uppercase">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>

          {/* Welkomsttekst */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1E2A78] mb-1">
              Welkom, {session?.user?.name || 'Beheerder'}
            </h1>
            <p className="text-sm text-gray-500 italic capitalize">
              {session?.user?.role || 'Onbekend'}
            </p>
          </div>
        </div>
      </div>

      {/* Dashboardtegels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Snelkoppeling: Gebruikers */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md transition-transform hover:scale-[1.02] cursor-pointer" 
             onClick={() => window.location.href = '/beheer/gebruikers'}>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <User size={24} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold">Gebruikers</h2>
          </div>
          <p className="text-gray-600 text-sm">
            Beheer gebruikers, wijzig rollen, en bekijk gebruikersgegevens.
          </p>
        </div>

        {/* Snelkoppeling: Website */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md transition-transform hover:scale-[1.02] cursor-pointer"
             onClick={() => window.location.href = '/'}>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Home size={24} className="text-green-600" />
            </div>
            <h2 className="text-lg font-semibold">Website</h2>
          </div>
          <p className="text-gray-600 text-sm">
            Ga naar de voorpagina van je website om te zien hoe het eruitziet voor bezoekers.
          </p>
        </div>

        {/* Snelkoppeling: Statistieken */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md transition-transform hover:scale-[1.02] cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <BarChart2 size={24} className="text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold">Statistieken</h2>
          </div>
          <p className="text-gray-600 text-sm">
            Bekijk site-activiteit en bezoekersstatistieken (binnenkort beschikbaar).
          </p>
        </div>
      </div>

      {/* Statusoverzicht */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">Systeemstatus</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">CMS versie</span>
            <span className="font-medium">1.5.2</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Server status</span>
            <span className="text-green-500 font-medium flex items-center">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Online
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Laatste update</span>
            <span className="font-medium">14 april 2025</span>
          </div>
        </div>
      </div>

      {/* Recente activiteiten */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity size={20} /> Recente activiteiten
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
          <div className="space-y-4">
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
    </div>
  )
}