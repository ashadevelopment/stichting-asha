'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  Users, 
  Eye, 
  MousePointer, 
  Clock, 
  TrendingUp, 
  Globe, 
  Calendar,
  ArrowLeft,
  RefreshCw,
  Download
} from 'lucide-react'
import { format, subDays, startOfDay } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  Filler
)

interface StatsData {
  totalUsers: number;
  totalPageViews: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  bounceRate: number;
  dailyStats: {
    date: string;
    pageViews: number;
    uniqueVisitors: number;
    sessions: number;
  }[];
  topPages: {
    path: string;
    views: number;
    uniqueViews: number;
  }[];
  deviceTypes: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  trafficSources: {
    direct: number;
    organic: number;
    social: number;
    referral: number;
  };
  browserStats: {
    chrome: number;
    firefox: number;
    safari: number;
    edge: number;
    other: number;
  };
}

interface SessionUser {
  id?: string;
  role?: string;
}

interface CustomSession {
  user?: SessionUser;
}

export default function StatisticsPage() {
  const { data: session } = useSession() as { data: CustomSession | null }
  const [stats, setStats] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Check if user has access to statistics
  const hasStatsAccess = () => {
    return session?.user?.role === 'beheerder' || session?.user?.role === 'developer'
  }

  // Fetch statistics data from API
  const fetchStats = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/stats?timeRange=${timeRange}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Je bent niet ingelogd')
        } else if (response.status === 403) {
          throw new Error('Je hebt geen toegang tot statistieken')
        } else {
          throw new Error(`Fout bij het ophalen van gegevens: ${response.status}`)
        }
      }

      const data = await response.json()
      setStats(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setIsLoading(false)
    }
  }

  // Load data on mount and when time range changes
  useEffect(() => {
    if (hasStatsAccess()) {
      fetchStats()
    } else {
      setIsLoading(false)
    }
  }, [timeRange, session])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (hasStatsAccess()) {
      const interval = setInterval(fetchStats, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [timeRange, session])

  // Chart configurations
  const getChartOptions = (title: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#1E2A78',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  })

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('nl-NL').format(num)
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (!hasStatsAccess()) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h3 className="font-bold text-red-800 mb-2">Toegang Geweigerd</h3>
          <p className="text-red-700">Je hebt geen toestemming om statistieken te bekijken.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <Link href="/beheer/dashboard" className="text-gray-600 hover:text-[#1E2A78] transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E2A78]">
              Website Statistieken
            </h1>
            <p className="text-gray-600 text-sm">
              Laatste update: {format(lastUpdated, 'dd MMM yyyy, HH:mm', { locale: nl })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E2A78]"
          >
            <option value="7d">Laatste 7 dagen</option>
            <option value="30d">Laatste 30 dagen</option>
            <option value="90d">Laatste 90 dagen</option>
          </select>
          
          {/* Refresh Button */}
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="px-4 py-2 bg-[#1E2A78] text-white rounded-lg hover:bg-[#1a2468] disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Vernieuwen
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-t-[#1E2A78] border-gray-200 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Statistics Dashboard */}
      {stats && !isLoading && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Totaal Paginaweergaven</p>
                  <p className="text-2xl font-bold text-[#1E2A78]">{formatNumber(stats.totalPageViews)}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Eye className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unieke Bezoekers</p>
                  <p className="text-2xl font-bold text-[#1E2A78]">{formatNumber(stats.uniqueVisitors)}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Gem. Sessieduur</p>
                  <p className="text-2xl font-bold text-[#1E2A78]">{formatDuration(stats.averageSessionDuration)}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Clock className="text-purple-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bouncepercentage</p>
                  <p className="text-2xl font-bold text-[#1E2A78]">{stats.bounceRate}%</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <TrendingUp className="text-red-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Page Views Over Time */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-80">
                <Line
                  data={{
                    labels: stats.dailyStats.map(d => format(new Date(d.date), 'dd MMM', { locale: nl })),
                    datasets: [
                      {
                        label: 'Paginaweergaven',
                        data: stats.dailyStats.map(d => d.pageViews),
                        borderColor: '#1E2A78',
                        backgroundColor: 'rgba(30, 42, 120, 0.1)',
                        fill: true,
                        tension: 0.4
                      },
                      {
                        label: 'Unieke Bezoekers',
                        data: stats.dailyStats.map(d => d.uniqueVisitors),
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                      }
                    ]
                  }}
                  options={getChartOptions('Website Verkeer Over Tijd')}
                />
              </div>
            </div>

            {/* Device Types */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-80">
                <Doughnut
                  data={{
                    labels: ['Desktop', 'Mobiel', 'Tablet'],
                    datasets: [
                      {
                        data: [stats.deviceTypes.desktop, stats.deviceTypes.mobile, stats.deviceTypes.tablet],
                        backgroundColor: ['#1E2A78', '#10B981', '#F59E0B'],
                        borderWidth: 0
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                      title: {
                        display: true,
                        text: 'Apparaattypen',
                        font: {
                          size: 16,
                          weight: 'bold' as const
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Sources */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-80">
                <Bar
                  data={{
                    labels: ['Direct', 'Organisch', 'Social Media', 'Referral'],
                    datasets: [
                      {
                        label: 'Bezoekers',
                        data: [stats.trafficSources.direct, stats.trafficSources.organic, stats.trafficSources.social, stats.trafficSources.referral],
                        backgroundColor: ['#1E2A78', '#10B981', '#F59E0B', '#EF4444'],
                        borderWidth: 0
                      }
                    ]
                  }}
                  options={getChartOptions('Verkeersbronnen')}
                />
              </div>
            </div>

            {/* Browser Stats */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-80">
                <Doughnut
                  data={{
                    labels: ['Chrome', 'Firefox', 'Safari', 'Edge', 'Overig'],
                    datasets: [
                      {
                        data: [stats.browserStats.chrome, stats.browserStats.firefox, stats.browserStats.safari, stats.browserStats.edge, stats.browserStats.other],
                        backgroundColor: ['#1E2A78', '#FF7043', '#10B981', '#3B82F6', '#9CA3AF'],
                        borderWidth: 0
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                      title: {
                        display: true,
                        text: 'Browser Statistieken',
                        font: {
                          size: 16,
                          weight: 'bold' as const
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Top Pages Table */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe size={20} />
              Meest Bezochte Pagina's
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold">Pagina</th>
                    <th className="text-right py-3 px-4 font-semibold">Totaal Weergaven</th>
                    <th className="text-right py-3 px-4 font-semibold">Unieke Weergaven</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topPages.map((page, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{page.path}</td>
                      <td className="py-3 px-4 text-right">{formatNumber(page.views)}</td>
                      <td className="py-3 px-4 text-right">{formatNumber(page.uniqueViews)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}