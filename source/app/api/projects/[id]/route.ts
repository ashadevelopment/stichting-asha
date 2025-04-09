import { NextRequest, NextResponse } from "next/server"
import connectDB from "../../../lib/mongodb"
import Project from "../../../lib/models/Project"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"

// DELETE project (alleen voor beheerders)
export async function DELETE(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    // Controleer of de gebruiker is ingelogd en beheerder is
    if (!session || !session.user || 
        (session.user.role !== 'beheerder' && session.user.role !== 'developer')) {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen projecten verwijderen." }, 
        { status: 403 }
      )
    }
    
    await connectDB()
    
    // Wacht tot de parameters zijn opgehaald voordat je ze gebruikt
    const { id } = await context.params
    
    const deletedProject = await Project.findByIdAndDelete(id)
    
    if (!deletedProject) {
      return NextResponse.json({ error: "Project niet gevonden" }, { status: 404 })
    }
    
    return NextResponse.json({ message: "Project succesvol verwijderd" })
  } catch (err) {
    console.error("Error deleting project:", err)
    return NextResponse.json({ error: "Fout bij verwijderen van project" }, { status: 500 })
  }
}

// PUT project bijwerken (alleen voor beheerders)
export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    // Controleer of de gebruiker is ingelogd en beheerder is
    if (!session || !session.user || 
        (session.user.role !== 'beheerder' && session.user.role !== 'developer')) {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen projecten bijwerken." }, 
        { status: 403 }
      )
    }
    
    await connectDB()
    
    // Wacht tot de parameters zijn opgehaald voordat je ze gebruikt
    const { id } = await context.params
    const body = await req.json()
    
    // Validatie
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "Titel en beschrijving zijn verplicht" }, 
        { status: 400 }
      )
    }
    
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      body,
      { new: true }
    )
    
    if (!updatedProject) {
      return NextResponse.json({ error: "Project niet gevonden" }, { status: 404 })
    }
    
    return NextResponse.json(updatedProject)
  } catch (err) {
    console.error("Error updating project:", err)
    return NextResponse.json({ error: "Fout bij bijwerken van project" }, { status: 500 })
  }
}