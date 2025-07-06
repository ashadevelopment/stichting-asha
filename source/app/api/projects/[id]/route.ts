import { NextRequest, NextResponse } from "next/server"
import dbConnect from "../../../lib/mongodb"
import Project from "../../../lib/models/Project"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/authOptions"

// DELETE project (alleen voor beheerders)
export async function DELETE(req: NextRequest) {
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
    
    await dbConnect()
    
    // Wacht tot de parameters zijn opgehaald voordat je ze gebruikt
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    
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
export async function PUT(req: NextRequest) {
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
    
    await dbConnect()
    
    // Wacht tot de parameters zijn opgehaald voordat je ze gebruikt
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    const body = await req.json()
    
    // Validatie
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "Titel en beschrijving zijn verplicht" }, 
        { status: 400 }
      )
    }
    
    // Validate documents array doesn't exceed 3
    if (body.documents && body.documents.length > 3) {
      return NextResponse.json(
        { error: "Maximaal 3 documenten per project toegestaan" },
        { status: 400 }
      );
    }
    
    // Check if trying to pin and if pin limit is reached
    if (body.pinned) {
      const pinnedCount = await Project.countDocuments({ 
        pinned: true, 
        _id: { $ne: id } // Exclude current project from count
      });
      if (pinnedCount >= 3) {
        return NextResponse.json(
          { error: "Je kunt maximaal 3 projecten vastpinnen" },
          { status: 400 }
        );
      }
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