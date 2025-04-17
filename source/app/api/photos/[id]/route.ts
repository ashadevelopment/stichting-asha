// app/api/photos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import dbConnect from "../../../lib/mongodb"
import Photo from "../../../lib/models/Photo"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/authOptions"
import { recordActivity } from "../../../lib/middleware/activityTracking"

// Utility to extract ID from URL
const extractIdFromRequest = (req: NextRequest | Request): string =>
  new URL(req.url).pathname.split('/')[4]

// DELETE a photo
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || 
        (session.user.role !== 'beheerder' && session.user.role !== 'developer')) {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen foto's verwijderen." }, 
        { status: 403 }
      )
    }

    await dbConnect()
    const id = extractIdFromRequest(req)

    const photo = await Photo.findById(id)

    if (!photo) {
      return NextResponse.json({ error: "Foto niet gevonden" }, { status: 404 })
    }

    const photoTitle = photo.title
    await Photo.findByIdAndDelete(id)

    await recordActivity({
      type: 'delete',
      entityType: 'photo',
      entityId: id,
      entityName: photoTitle,
      performedBy: session?.user?.id || 'unknown',
      performedByName: session.user.name || 'Onbekend'
    })

    return NextResponse.json({ message: "Foto succesvol verwijderd" })
  } catch (err) {
    console.error("Error deleting photo:", err)
    return NextResponse.json({ error: "Fout bij verwijderen van foto" }, { status: 500 })
  }
}

// Update photo details
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || 
        (session.user.role !== 'beheerder' && session.user.role !== 'developer')) {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen foto's bijwerken." }, 
        { status: 403 }
      )
    }

    await dbConnect()
    const id = extractIdFromRequest(req)
    const body = await req.json()

    const updatedPhoto = await Photo.findByIdAndUpdate(id, body, { new: true })

    if (!updatedPhoto) {
      return NextResponse.json({ error: "Foto niet gevonden" }, { status: 404 })
    }

    await recordActivity({
      type: 'update',
      entityType: 'photo',
      entityId: id,
      entityName: updatedPhoto.title,
      performedBy: session?.user?.id || 'unknown',
      performedByName: session.user.name || 'Onbekend'
    })

    return NextResponse.json(updatedPhoto)
  } catch (err) {
    console.error("Error updating photo:", err)
    return NextResponse.json({ error: "Fout bij bijwerken van foto" }, { status: 500 })
  }
}

// GET a specific photo
export async function GET(req: Request) {
  try {
    await dbConnect()
    const id = extractIdFromRequest(req)

    const photo = await Photo.findById(id)

    if (!photo) {
      return NextResponse.json({ error: "Foto niet gevonden" }, { status: 404 })
    }

    return NextResponse.json(photo)
  } catch (err) {
    console.error("Error fetching photo:", err)
    return NextResponse.json({ error: "Fout bij ophalen van foto" }, { status: 500 })
  }
}