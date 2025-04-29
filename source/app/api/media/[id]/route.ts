// app/api/media/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import dbConnect from "../../../lib/mongodb"
import Media from "../../../lib/models/Media"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/authOptions"
import { recordActivity } from "../../../lib/middleware/activityTracking"

// Utility to extract ID from URL
const extractIdFromRequest = (req: NextRequest | Request): string =>
  new URL(req.url).pathname.split('/')[4]

// DELETE a media item
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || 
        (session.user.role !== 'beheerder' && session.user.role !== 'developer')) {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen media verwijderen." }, 
        { status: 403 }
      )
    }

    await dbConnect()
    const id = extractIdFromRequest(req)

    const mediaItem = await Media.findById(id)

    if (!mediaItem) {
      return NextResponse.json({ error: "Media niet gevonden" }, { status: 404 })
    }

    const mediaTitle = mediaItem.title
    const mediaType = mediaItem.media.type || 'image'
    await Media.findByIdAndDelete(id)

    await recordActivity({
      type: 'delete',
      entityType: 'media',
      entityId: id,
      entityName: mediaTitle,
      performedBy: session?.user?.id || 'unknown',
      performedByName: session.user.name || 'Onbekend',
      details: `${mediaType === 'video' ? 'Video' : 'Foto'} verwijderd door ${session.user.name || 'Onbekend'}`
    })

    return NextResponse.json({ message: `${mediaType === 'video' ? 'Video' : 'Foto'} succesvol verwijderd` })
  } catch (err) {
    console.error("Error deleting media:", err)
    return NextResponse.json({ error: "Fout bij verwijderen van media" }, { status: 500 })
  }
}

// Update media details
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || 
        (session.user.role !== 'beheerder' && session.user.role !== 'developer')) {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen media bijwerken." }, 
        { status: 403 }
      )
    }

    await dbConnect()
    const id = extractIdFromRequest(req)
    const body = await req.json()

    const updatedMedia = await Media.findByIdAndUpdate(id, body, { new: true })

    if (!updatedMedia) {
      return NextResponse.json({ error: "Media niet gevonden" }, { status: 404 })
    }

    const mediaType = updatedMedia.media.type || 'image'
    
    await recordActivity({
      type: 'update',
      entityType: 'media',
      entityId: id,
      entityName: updatedMedia.title,
      performedBy: session?.user?.id || 'unknown',
      performedByName: session.user.name || 'Onbekend',
      details: `${mediaType === 'video' ? 'Video' : 'Foto'} bijgewerkt door ${session.user.name || 'Onbekend'}`
    })

    return NextResponse.json(updatedMedia)
  } catch (err) {
    console.error("Error updating media:", err)
    return NextResponse.json({ error: "Fout bij bijwerken van media" }, { status: 500 })
  }
}

// GET a specific media item
export async function GET(req: Request) {
  try {
    await dbConnect()
    const id = extractIdFromRequest(req)

    const mediaItem = await Media.findById(id)

    if (!mediaItem) {
      return NextResponse.json({ error: "Media niet gevonden" }, { status: 404 })
    }

    return NextResponse.json(mediaItem)
  } catch (err) {
    console.error("Error fetching media:", err)
    return NextResponse.json({ error: "Fout bij ophalen van media" }, { status: 500 })
  }
}