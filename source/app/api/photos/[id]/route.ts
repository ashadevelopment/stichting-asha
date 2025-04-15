// app/api/photos/[id]/route.ts
import { NextResponse } from "next/server"
import dbConnect from "../../../lib/mongodb"
import Photo from "../../../lib/models/Photo"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { recordActivity } from "../../../lib/middleware/activityTracking"

// DELETE a photo
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated and has appropriate role
    if (!session || !session.user || 
        (session.user.role !== 'beheerder' && session.user.role !== 'developer')) {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen foto's verwijderen." }, 
        { status: 403 }
      )
    }
    
    await dbConnect()
    
    // Get photo before deletion to use title in activity
    const photo = await Photo.findById(params.id)
    
    if (!photo) {
      return NextResponse.json({ error: "Foto niet gevonden" }, { status: 404 })
    }
    
    // Store photo title before deletion
    const photoTitle = photo.title
    
    // Delete the photo
    await Photo.findByIdAndDelete(params.id)
    
    // Record activity
    await recordActivity({
      type: 'delete',
      entityType: 'photo',
      entityId: params.id,
      entityName: photoTitle,
      performedBy: session.user.id,
      performedByName: session.user.name || 'Onbekend'
    })
    
    return NextResponse.json({ message: "Foto succesvol verwijderd" })
  } catch (err) {
    console.error("Error deleting photo:", err)
    return NextResponse.json({ error: "Fout bij verwijderen van foto" }, { status: 500 })
  }
}

// Update photo details
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated and has appropriate role
    if (!session || !session.user || 
        (session.user.role !== 'beheerder' && session.user.role !== 'developer')) {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen foto's bijwerken." }, 
        { status: 403 }
      )
    }
    
    await dbConnect()
    const body = await req.json()
    
    const updatedPhoto = await Photo.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    )
    
    if (!updatedPhoto) {
      return NextResponse.json({ error: "Foto niet gevonden" }, { status: 404 })
    }
    
    // Record activity
    await recordActivity({
      type: 'update',
      entityType: 'photo',
      entityId: params.id,
      entityName: updatedPhoto.title,
      performedBy: session.user.id,
      performedByName: session.user.name || 'Onbekend'
    })
    
    return NextResponse.json(updatedPhoto)
  } catch (err) {
    console.error("Error updating photo:", err)
    return NextResponse.json({ error: "Fout bij bijwerken van foto" }, { status: 500 })
  }
}

// GET a specific photo
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    const photo = await Photo.findById(params.id)
    
    if (!photo) {
      return NextResponse.json({ error: "Foto niet gevonden" }, { status: 404 })
    }
    
    return NextResponse.json(photo)
  } catch (err) {
    console.error("Error fetching photo:", err)
    return NextResponse.json({ error: "Fout bij ophalen van foto" }, { status: 500 })
  }
}