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

// Helper function to generate repeating events
function generateRepeatingEvents(eventData: any) {
  const events = []
  const baseDate = new Date(eventData.date)
  
  switch (eventData.repeatType) {
    case 'daily':
      for (let i = 0; i < (eventData.repeatCount || 30); i++) {
        const newDate = new Date(baseDate)
        newDate.setDate(baseDate.getDate() + i)
        events.push({
          ...eventData,
          date: newDate.toISOString().split('T')[0],
          isRepeatedEvent: i > 0,
          originalEventId: i > 0 ? undefined : null
        })
      }
      break
      
    case 'weekly':
      for (let i = 0; i < (eventData.repeatCount || 12); i++) {
        const newDate = new Date(baseDate)
        newDate.setDate(baseDate.getDate() + (i * 7))
        events.push({
          ...eventData,
          date: newDate.toISOString().split('T')[0],
          isRepeatedEvent: i > 0,
          originalEventId: i > 0 ? undefined : null
        })
      }
      break
      
    case 'monthly':
      for (let i = 0; i < (eventData.repeatCount || 12); i++) {
        const newDate = new Date(baseDate)
        newDate.setMonth(baseDate.getMonth() + i)
        events.push({
          ...eventData,
          date: newDate.toISOString().split('T')[0],
          isRepeatedEvent: i > 0,
          originalEventId: i > 0 ? undefined : null
        })
      }
      break
      
    default:
      // Standard - single event
      events.push({
        ...eventData,
        isRepeatedEvent: false,
        originalEventId: null
      })
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
      repeatType: body.repeatType || 'standard'
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