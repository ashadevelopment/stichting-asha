import { NextRequest, NextResponse } from "next/server"
import dbConnect from "../../lib/mongodb"
import Media from "../../lib/models/Media" // Changed from Photo to Media
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../lib/authOptions"
import { recordActivity } from "../../lib/middleware/activityTracking"

// File size limits in bytes
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];

// Validation function for uploads
function validateMediaUpload(file: File, mediaType: string) {
  // Check if file exists
  if (!file) {
    return { valid: false, error: "Geen bestand geüpload" };
  }

  // Check file size
  const maxSize = mediaType === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return { 
      valid: false, 
      error: `Bestandsgrootte overschrijdt de limiet van ${maxSizeMB}MB` 
    };
  }

  // Check file type
  const allowedTypes = mediaType === 'video' ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Bestandstype ${file.type} wordt niet ondersteund. Toegestane types: ${allowedTypes.join(', ')}` 
    };
  }

  // Check dimensions for videos (would require additional processing)
  // For now, we'll just return valid
  return { valid: true };
}

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

    // Basic validation
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

    // Extended validation for file type and size
    const validation = validateMediaUpload(file, mediaType);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Connect to database
    await dbConnect()
    
    try {
      // Read file data
      const bytes = await file.arrayBuffer()
      
      // Check if file data is valid
      if (!bytes || bytes.byteLength === 0) {
        return NextResponse.json(
          { error: "Ongeldig bestand of leeg bestand" },
          { status: 400 }
        )
      }
      
      const buffer = Buffer.from(bytes)
      
      // Check final buffer size for MongoDB limit (16MB)
      const base64Size = Math.ceil(buffer.length * 4 / 3);
      if (base64Size > 15 * 1024 * 1024) { // Leave some margin below 16MB
        return NextResponse.json(
          { error: "Bestand is te groot voor opslag na encoding (max 15MB na encoding)" },
          { status: 400 }
        )
      }
      
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
      console.error("Error processing file:", err)
      
      // Check for specific MongoDB errors related to document size
      if (err instanceof Error && err.message && 
          (err.message.includes('document size') || err.message.includes('16777216'))) {
        return NextResponse.json(
          { error: "Bestand is te groot voor de database (maximum 16MB)" },
          { status: 400 }
        )
      }
      
      throw err; // Re-throw for general error handling
    }
  } catch (err) {
    console.error("Error creating media item:", err)
    
    if (err instanceof Error) {
      // Detailed error logging
      console.error(`Error stack: ${err.stack}`);
      
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