import { NextRequest, NextResponse } from "next/server"
import dbConnect from "../../lib/mongodb"
import Media from "../../lib/models/Media" // Changed from Photo to Media
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../lib/authOptions"
import { recordActivity } from "../../lib/middleware/activityTracking"

// GET all media items
export async function GET() {
  try {
    await dbConnect()
    
    // Find all media items, sorted by creation date
    const mediaItems = await Media.find().sort({ createdAt: -1 })
    
    // Convert to plain objects and ensure base64 data
    const plainMediaItems = mediaItems.map(item => {
      const plainObj = item.toObject()
      
      // Ensure media data is present
      if (!plainObj.media || !plainObj.media.data) {
        plainObj.media = {
          data: '',
          contentType: plainObj.media?.type === 'video' ? 'video/mp4' : 'image/png', // Default fallback
          type: plainObj.media?.type || 'image'
        }
      }
      
      return plainObj
    })
    
    // Return media items or an empty array
    return NextResponse.json(plainMediaItems)
  } catch (err) {
    console.error("Error fetching media items:", err)
    return NextResponse.json(
      { 
        error: "Fout bij ophalen van media", 
        details: err instanceof Error ? err.message : 'Unknown error' 
      }, 
      { status: 500 }
    )
  }
}

// POST new media item (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated and has appropriate role
    if (!session || !session.user || 
        (session.user.role !== 'beheerder' && session.user.role !== 'developer')) {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen media toevoegen." }, 
        { status: 403 }
      )
    }
    
    // Parse the request body
    const formData = await req.formData()
    
    // Extract media details
    const title = formData.get('title') as string
    const description = formData.get('description') as string | null
    const file = formData.get('file') as File
    const mediaType = formData.get('mediaType') as 'image' | 'video'

    // Validation
    if (!title) {
      return NextResponse.json(
        { error: "Titel is verplicht" }, 
        { status: 400 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { error: "Media bestand is verplicht" }, 
        { status: 400 }
      )
    }

    // Connect to database
    await dbConnect()
    
    // Read file data
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Create media document
    const mediaItem = await Media.create({
      title,
      description: description || '',
      media: {
        filename: file.name,
        contentType: file.type,
        data: buffer.toString('base64'),
        type: mediaType || (file.type.startsWith('video') ? 'video' : 'image')
      },
      author: session.user.name || 'Anoniem'
    })
    
    // Record activity
    await recordActivity({
      type: 'create',
      entityType: 'media',
      entityId: mediaItem._id.toString(),
      entityName: mediaItem.title,
      performedBy: session.user.id || 'Onbekend',
      performedByName: session.user.name || 'Onbekend',
      details: `${mediaItem.media.type === 'video' ? 'Video' : 'Foto'} geplaatst door ${session.user.name || 'Onbekend'}`
    })
    
    // Convert to plain object and return
    return NextResponse.json(mediaItem.toObject(), { status: 201 })
  } catch (err) {
    console.error("Error creating media item:", err)
    
    if (err instanceof Error) {
      return NextResponse.json(
        { 
          error: "Fout bij toevoegen van media", 
          details: err.message 
        }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: "Onverwachte fout bij toevoegen van media" }, 
      { status: 500 }
    )
  }
}