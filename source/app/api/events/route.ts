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
    const events = await Event.find().sort({ date: 1, time: 1 })
    return NextResponse.json(events)
  } catch (err) {
    console.error("Error fetching events:", err)
    return NextResponse.json({ error: "Fout bij ophalen van evenementen" }, { status: 500 })
  }
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
    if (!body.title || !body.description || !body.date || !body.time || !body.location) {
      return NextResponse.json(
        { error: "Alle velden zijn verplicht" }, 
        { status: 400 }
      )
    }
    
    // Add author to the event
    const eventData = {
      ...body,
      author: session.user.name || "Anoniem"
    }
    
    const event = await Event.create(eventData)
    
    // Record activity
    await recordActivity({
      type: 'create',
      entityType: 'event',
      entityId: event._id.toString(),
      entityName: event.title,
      performedBy: session?.user?.id || 'unknown',
      performedByName: session.user.name || 'Onbekend'
    })
    
    return NextResponse.json(event, { status: 201 })
  } catch (err) {
    console.error("Error creating event:", err)
    return NextResponse.json({ error: "Fout bij aanmaken van evenement" }, { status: 500 })
  }
}