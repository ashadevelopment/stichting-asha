import { NextResponse } from "next/server"
import connectDB from "../../lib/mongodb"
import Photo from "../../lib/models/Photo"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

// GET all photos
export async function GET() {
  try {
    await connectDB()
    const photos = await Photo.find().sort({ displayOrder: 1, createdAt: -1 })
    return NextResponse.json(photos)
  } catch (err) {
    console.error("Error fetching photos:", err)
    return NextResponse.json({ error: "Fout bij ophalen van foto's" }, { status: 500 })
  }
}

// POST new photo (admin only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated and has appropriate role
    if (!session || !session.user || 
        (session.user.role !== 'beheerder' && session.user.role !== 'developer')) {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen foto's toevoegen." }, 
        { status: 403 }
      )
    }
    
    await connectDB()
    const body = await req.json()
    
    // Validation
    if (!body.title || !body.image) {
      return NextResponse.json(
        { error: "Titel en afbeelding zijn verplicht" }, 
        { status: 400 }
      )
    }
    
    // Add author to the photo
    const photoData = {
      ...body,
      author: session.user.name || "Anoniem"
    }
    
    const photo = await Photo.create(photoData)
    
    return NextResponse.json(photo, { status: 201 })
  } catch (err) {
    console.error("Error creating photo:", err)
    return NextResponse.json({ error: "Fout bij toevoegen van foto" }, { status: 500 })
  }
}