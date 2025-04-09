import { NextResponse } from "next/server"
import connectDB from "../../../lib/mongodb"
import Photo from "../../../lib/models/Photo"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"

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
    
    await connectDB()
    const deletedPhoto = await Photo.findByIdAndDelete(params.id)
    
    if (!deletedPhoto) {
      return NextResponse.json({ error: "Foto niet gevonden" }, { status: 404 })
    }
    
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
    
    await connectDB()
    const body = await req.json()
    
    const updatedPhoto = await Photo.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    )
    
    if (!updatedPhoto) {
      return NextResponse.json({ error: "Foto niet gevonden" }, { status: 404 })
    }
    
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
    await connectDB()
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