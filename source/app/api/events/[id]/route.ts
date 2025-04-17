// app/api/events/[id]/route.ts
import { NextResponse } from "next/server"
import dbConnect from "../../../lib/mongodb"
import Event from "../../../lib/models/Event"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/authOptions"
import { recordActivity } from "../../../lib/middleware/activityTracking"

// GET een specifiek evenement op ID
export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    await dbConnect();
    const event = await Event.findById(context.params.id);

    if (!event) {
      return NextResponse.json({ error: "Evenement niet gevonden" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (err) {
    console.error("Error fetching event:", err);
    return NextResponse.json({ error: "Fout bij ophalen van evenement" }, { status: 500 });
  }
}

// PUT (update) een evenement
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Controleer of de gebruiker is ingelogd en beheerder is
    if (!session || !session.user || session.user.role !== 'beheerder') {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen evenementen bijwerken." }, 
        { status: 403 }
      )
    }
    
    await dbConnect()
    const body = await req.json()
    
    // Validatie
    if (!body.title || !body.description || !body.date || !body.time || !body.location) {
      return NextResponse.json(
        { error: "Alle velden zijn verplicht" }, 
        { status: 400 }
      )
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    )
    
    if (!updatedEvent) {
      return NextResponse.json({ error: "Evenement niet gevonden" }, { status: 404 })
    }
    
    // Record activity
    await recordActivity({
      type: 'update',
      entityType: 'event',
      entityId: params.id,
      entityName: updatedEvent.title,
      performedBy: session?.user?.id || 'unknown',
      performedByName: session.user.name || 'Onbekend'
    })
    
    return NextResponse.json(updatedEvent)
  } catch (err) {
    console.error("Error updating event:", err)
    return NextResponse.json({ error: "Fout bij bijwerken van evenement" }, { status: 500 })
  }
}

// DELETE een evenement
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Controleer of de gebruiker is ingelogd en beheerder is
    if (!session || !session.user || session.user.role !== 'beheerder') {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen evenementen verwijderen." }, 
        { status: 403 }
      )
    }
    
    await dbConnect()
    
    // Get event before deletion to use name in activity log
    const event = await Event.findById(params.id)
    
    if (!event) {
      return NextResponse.json({ error: "Evenement niet gevonden" }, { status: 404 })
    }
    
    // Store event details before deletion
    const eventTitle = event.title
    
    // Delete the event
    await Event.findByIdAndDelete(params.id)
    
    // Record activity
    await recordActivity({
      type: 'delete',
      entityType: 'event',
      entityId: params.id,
      entityName: eventTitle,
      performedBy: session?.user?.id || 'unknown',
      performedByName: session.user.name || 'Onbekend'
    })
    
    return NextResponse.json({ success: true, message: "Evenement verwijderd" })
  } catch (err) {
    console.error("Error deleting event:", err)
    return NextResponse.json({ error: "Fout bij verwijderen van evenement" }, { status: 500 })
  }
}