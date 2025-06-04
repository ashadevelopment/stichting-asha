import { NextResponse } from "next/server"
import dbConnect from "../../lib/mongodb"
import Event from "../../lib/models/Event"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../lib/authOptions" 
import { recordActivity } from "../../lib/middleware/activityTracking"

// GET all events
export async function GET() {
  try {
    await dbConnect()
    const events = await Event.find().sort({ date: 1, startTime: 1 })
    return NextResponse.json(events)
  } catch (err) {
    console.error("Error fetching events:", err)
    return NextResponse.json({ error: "Fout bij ophalen van evenementen" }, { status: 500 })
  }
}

function generateRepeatingEvents(eventData: any) {
  const events = []
  const baseDate = new Date(eventData.date + 'T00:00:00.000Z')
  
  switch (eventData.repeatType) {
    case 'single':
      // Single event - no repetition
      events.push({
        ...eventData,
        isRepeatedEvent: false,
        originalEventId: null
      })
      break
      
    case 'standard':  // Weekly repetition with specific day selection
      const targetDayOfWeek = eventData.selectedDayOfWeek || 1 // Default to Monday
      
      for (let weekOffset = 0; weekOffset < 52; weekOffset++) {
        // Start from the first occurrence of the selected day
        const startOfWeek = new Date(baseDate)
        startOfWeek.setUTCDate(baseDate.getUTCDate() - baseDate.getUTCDay() + (weekOffset * 7))
        
        // Set to the selected day of the week
        const eventDate = new Date(startOfWeek)
        eventDate.setUTCDate(startOfWeek.getUTCDate() + targetDayOfWeek)
        
        // If this is the first event (weekOffset = 0), make sure it's not in the past
        if (weekOffset === 0) {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          if (eventDate < today) {
            continue // Skip this occurrence if it's in the past
          }
        }
        
        events.push({
          ...eventData,
          date: eventDate.toISOString().split('T')[0],
          isRepeatedEvent: weekOffset > 0,
          originalEventId: weekOffset > 0 ? undefined : null
        })
      }
      break
      
    case 'daily':
      for (let dayOffset = 0; dayOffset < (eventData.repeatCount || 30); dayOffset++) {
        const newDate = new Date(baseDate)
        newDate.setUTCDate(baseDate.getUTCDate() + dayOffset)
        events.push({
          ...eventData,
          date: newDate.toISOString().split('T')[0],
          isRepeatedEvent: dayOffset > 0,
          originalEventId: dayOffset > 0 ? undefined : null
        })
      }
      break
      
    case 'weekly':
      for (let weekOffset = 0; weekOffset < (eventData.repeatCount || 12); weekOffset++) {
        const newDate = new Date(baseDate)
        newDate.setUTCDate(baseDate.getUTCDate() + (weekOffset * 7))
        
        events.push({
          ...eventData,
          date: newDate.toISOString().split('T')[0],
          isRepeatedEvent: weekOffset > 0,
          originalEventId: weekOffset > 0 ? undefined : null
        })
      }
      break
      
    case 'monthly':
      for (let monthOffset = 0; monthOffset < (eventData.repeatCount || 12); monthOffset++) {
        const newDate = new Date(baseDate)
        newDate.setUTCMonth(baseDate.getUTCMonth() + monthOffset)
        
        // Handle cases where the day doesn't exist in the target month
        if (newDate.getUTCDate() !== baseDate.getUTCDate()) {
          newDate.setUTCDate(0) // Set to last day of previous month
        }
        
        events.push({
          ...eventData,
          date: newDate.toISOString().split('T')[0],
          isRepeatedEvent: monthOffset > 0,
          originalEventId: monthOffset > 0 ? undefined : null
        })
      }
      break
  }
  
  return events
}

// POST new event (only for admins)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if the user is authenticated and is an admin
    if (!session || !session.user || session.user.role !== 'beheerder') {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen evenementen toevoegen." }, 
        { status: 403 }
      )
    }
    
    await dbConnect()
    const body = await req.json()
    
    // Validation
    if (!body.title || !body.description || !body.date || !body.startTime || !body.endTime || !body.location) {
      return NextResponse.json(
        { error: "Alle velden zijn verplicht" }, 
        { status: 400 }
      )
    }
    
    // Validate time format
    if (body.startTime >= body.endTime) {
      return NextResponse.json(
        { error: "Eindtijd moet na de starttijd zijn" }, 
        { status: 400 }
      )
    }
    
    // Add author to the event data
    const eventData = {
      ...body,
      author: session.user.name || "Anoniem",
      repeatType: body.repeatType || 'single'  // Changed default from 'standard' to 'single'
    }
    
    // Generate events based on repeat type
    const eventsToCreate = generateRepeatingEvents(eventData)
    
    // Create all events
    const createdEvents = []
    for (const eventInfo of eventsToCreate) {
      const event = await Event.create(eventInfo)
      createdEvents.push(event)
      
      // Record activity for each created event
      await recordActivity({
        type: 'create',
        entityType: 'event',
        entityId: event._id.toString(),
        entityName: event.title,
        performedBy: session?.user?.id || 'unknown',
        performedByName: session.user.name || 'Onbekend'
      })
    }
    
    return NextResponse.json(createdEvents, { status: 201 })
  } catch (err) {
    console.error("Error creating event:", err)
    return NextResponse.json({ error: "Fout bij aanmaken van evenement" }, { status: 500 })
  }
}