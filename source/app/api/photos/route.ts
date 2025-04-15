// source/app/api/photos/route.ts
import { NextRequest, NextResponse } from "next/server"
import dbConnect from '../../lib/mongodb'
import Photo from '../../lib/models/Photo'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { recordActivity } from "../../lib/middleware/activityTracking"

// GET all photos
export async function GET() {
  try {
    await dbConnect()
    
    // Find all photos, sorted by creation date
    const photos = await Photo.find().sort({ createdAt: -1 })
    
    // Convert to plain objects and ensure base64 data
    const plainPhotos = photos.map(photo => {
      const plainObj = photo.toObject();
      
      // Ensure image data is present
      if (!plainObj.image || !plainObj.image.data) {
        plainObj.image = {
          data: '',
          contentType: 'image/png' // Default fallback
        }
      }
      
      return plainObj;
    });
    
    // Return photos or an empty array
    return NextResponse.json(plainPhotos || []);
  } catch (err) {
    console.error("Error fetching photos:", err)
    return NextResponse.json(
      { error: "Fout bij ophalen van foto's", details: err instanceof Error ? err.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}

// POST new photo (admin only)
export async function POST(req: NextRequest) {
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
    
    // Parse the request body
    const formData = await req.formData()
    
    // Extract photo details
    const title = formData.get('title') as string
    const description = formData.get('description') as string | null
    const file = formData.get('file') as File

    // Validation
    if (!title) {
      return NextResponse.json(
        { error: "Titel is verplicht" }, 
        { status: 400 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { error: "Afbeelding is verplicht" }, 
        { status: 400 }
      )
    }

    // Connect to database
    await dbConnect()
    
    // Read file data
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Create photo document
    const photo = await Photo.create({
      title,
      description: description || '',
      image: {
        filename: file.name,
        contentType: file.type,
        data: buffer.toString('base64')
      },
      author: session.user.name || 'Anoniem'
    })
    
    // Record activity
    await recordActivity({
      type: 'create',
      entityType: 'photo',
      entityId: photo._id.toString(),
      entityName: photo.title,
      performedBy: session?.user?.id || 'unknown',
      performedByName: session.user.name || 'Onbekend'
    })
    
    // Convert to plain object and return
    const plainPhoto = photo.toObject();
    return NextResponse.json(plainPhoto, { status: 201 })
  } catch (err) {
    console.error("Error creating photo:", err)
    
    // Handle specific error types
    if (err instanceof Error) {
      return NextResponse.json(
        { 
          error: "Fout bij toevoegen van foto", 
          details: err.message 
        }, 
        { status: 500 }
      )
    }
    
    // Fallback error
    return NextResponse.json(
      { error: "Onverwachte fout bij toevoegen van foto" }, 
      { status: 500 }
    )
  }
}