// app/api/events/route.ts
import { NextResponse } from "next/server"
import dbConnect from "../../lib/mongodb"
import Event from "../../lib/models/Event"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

// GET alle evenementen
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

// POST nieuw evenement (alleen voor beheerders)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Controleer of de gebruiker is ingelogd en beheerder is
    if (!session || !session.user || session.user.role !== 'beheerder') {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen evenementen toevoegen." }, 
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
    
    // Voeg auteur toe aan het evenement
    const eventData = {
      ...body,
      author: session.user.name || "Anoniem"
    }
    
    const event = await Event.create(eventData)
    return NextResponse.json(event, { status: 201 })
  } catch (err) {
    console.error("Error creating event:", err)
    return NextResponse.json({ error: "Fout bij aanmaken van evenement" }, { status: 500 })
  }
}