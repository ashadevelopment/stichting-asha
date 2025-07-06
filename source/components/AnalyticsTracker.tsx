// components/AnalyticsTracker.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

interface AnalyticsTrackerProps {
  trackPageViews?: boolean
  trackUserInteractions?: boolean
  trackSessionDuration?: boolean
}

interface SessionUser {
  id?: string
  role?: string
}

interface CustomSession {
  user?: SessionUser
}

export default function AnalyticsTracker({ 
  trackPageViews = true, 
  trackUserInteractions = false,
  trackSessionDuration = true 
}: AnalyticsTrackerProps) {
  const { data: session } = useSession() as { data: CustomSession | null }
  const pathname = usePathname()
  const sessionStartRef = useRef<number>(Date.now())
  const lastActivityRef = useRef<number>(Date.now())
  const sessionIdRef = useRef<string>('')
  const isTrackingRef = useRef<boolean>(false)

  // Generate or retrieve session ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('analytics_session_id')
      if (!sessionId) {
        sessionId = generateSessionId()
        sessionStorage.setItem('analytics_session_id', sessionId)
      }
      sessionIdRef.current = sessionId
      isTrackingRef.current = true
    }
  }, [])

  // Track page views
  useEffect(() => {
    if (trackPageViews && sessionIdRef.current && isTrackingRef.current) {
      trackPageView(pathname)
    }
  }, [pathname, trackPageViews])

  // Track user activity for session duration
  useEffect(() => {
    if (!trackSessionDuration) return

    const handleActivity = () => {
      lastActivityRef.current = Date.now()
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
    }
  }, [trackSessionDuration])

  // Track user interactions
  useEffect(() => {
    if (!trackUserInteractions) return

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target) {
        trackInteraction('click', {
          element: target.tagName,
          id: target.id || null,
          className: target.className || null,
          text: target.textContent?.substring(0, 100) || null,
          x: event.clientX,
          y: event.clientY
        })
      }
    }

    const handleScroll = () => {
      const scrollPercentage = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )
      
      // Only track significant scroll milestones
      if (scrollPercentage % 25 === 0 && scrollPercentage > 0) {
        trackInteraction('scroll', { percentage: scrollPercentage })
      }
    }

    document.addEventListener('click', handleClick)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      document.removeEventListener('click', handleClick)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [trackUserInteractions])

  // Track session end
  useEffect(() => {
    if (!trackSessionDuration) return

    const handleBeforeUnload = () => {
      const sessionDuration = Math.floor((lastActivityRef.current - sessionStartRef.current) / 1000)
      trackSessionEnd(sessionDuration)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const sessionDuration = Math.floor((lastActivityRef.current - sessionStartRef.current) / 1000)
        trackSessionEnd(sessionDuration)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [trackSessionDuration])

  const generateSessionId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const detectDevice = (): string => {
    const userAgent = navigator.userAgent
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet'
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile'
    }
    return 'desktop'
  }

  const detectBrowser = (): string => {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      return 'chrome'
    }
    if (userAgent.includes('Firefox')) {
      return 'firefox'
    }
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return 'safari'
    }
    if (userAgent.includes('Edg')) {
      return 'edge'
    }
    return 'other'
  }

  const getTrafficSource = (): string => {
    const referrer = document.referrer
    if (!referrer) {
      return 'direct'
    }
    
    const socialDomains = ['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com', 'youtube.com']
    const searchDomains = ['google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com']
    
    const referrerDomain = new URL(referrer).hostname
    
    if (socialDomains.some(domain => referrerDomain.includes(domain))) {
      return 'social'
    }
    if (searchDomains.some(domain => referrerDomain.includes(domain))) {
      return 'organic'
    }
    
    return 'referral'
  }

  const trackPageView = async (page: string) => {
    try {
      const data = {
        type: 'pageview',
        page,
        userId: session?.user?.id || null,
        sessionId: sessionIdRef.current,
        userAgent: navigator.userAgent,
        referrer: document.referrer || null,
        timestamp: new Date().toISOString(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        screen: {
          width: window.screen.width,
          height: window.screen.height
        },
        device: detectDevice(),
        browser: detectBrowser(),
        trafficSource: getTrafficSource(),
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }

      await fetch('/api/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error('Error tracking page view:', error)
    }
  }

  const trackInteraction = async (type: string, data: any) => {
    try {
      const interactionData = {
        type: 'interaction',
        interactionType: type,
        page: pathname,
        userId: session?.user?.id || null,
        sessionId: sessionIdRef.current,
        timestamp: new Date().toISOString(),
        data
      }

      await fetch('/api/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interactionData),
      })
    } catch (error) {
      console.error('Error tracking interaction:', error)
    }
  }

  const trackSessionEnd = async (duration: number) => {
    try {
      const data = {
        type: 'session_end',
        sessionId: sessionIdRef.current,
        duration,
        userId: session?.user?.id || null,
        timestamp: new Date().toISOString(),
        pages: [pathname] // In a real implementation, you'd track all pages visited
      }

      // Use sendBeacon for more reliable tracking on page unload
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
        navigator.sendBeacon('/api/stats', blob)
      } else {
        await fetch('/api/stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          keepalive: true
        })
      }
    } catch (error) {
      console.error('Error tracking session end:', error)
    }
  }

  // Custom event tracking function (can be called from other components)
  const trackCustomEvent = async (eventName: string, eventData: any = {}) => {
    try {
      const data = {
        type: 'custom_event',
        eventName,
        page: pathname,
        userId: session?.user?.id || null,
        sessionId: sessionIdRef.current,
        timestamp: new Date().toISOString(),
        data: eventData
      }

      await fetch('/api/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error('Error tracking custom event:', error)
    }
  }

  // Expose tracking functions globally for use in other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).analytics = {
        trackEvent: trackCustomEvent,
        trackInteraction
      }
    }
  }, [])

  // This component doesn't render anything
  return null
}