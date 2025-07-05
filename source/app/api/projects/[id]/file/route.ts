import { NextRequest, NextResponse } from "next/server"
import dbConnect from "../../../../lib/mongodb"
import Project from "../../../../lib/models/Project"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/authOptions"

// DELETE specific file from project
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || 
        (session.user.role !== 'beheerder' && session.user.role !== 'developer')) {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen bestanden verwijderen." }, 
        { status: 403 }
      )
    }
    
    await dbConnect()
    
    const url = new URL(req.url)
    const id = url.pathname.split("/")[4] // project id
    const fileType = url.searchParams.get('type') // 'image' or 'document'
    const documentIndex = url.searchParams.get('index') // for documents array
    
    if (!['image', 'document'].includes(fileType || '')) {
      return NextResponse.json({ error: "Ongeldig bestandstype" }, { status: 400 })
    }
    
    const project = await Project.findById(id)
    
    if (!project) {
      return NextResponse.json({ error: "Project niet gevonden" }, { status: 404 })
    }
    
    // Handle image deletion
    if (fileType === 'image') {
      if (!project.image) {
        return NextResponse.json({ error: "Geen afbeelding om te verwijderen" }, { status: 404 })
      }
      
      project.image = undefined
      await project.save()
      
      return NextResponse.json({ message: "Afbeelding succesvol verwijderd" })
    }
    
    // Handle document deletion
    if (fileType === 'document') {
      if (!project.documents || project.documents.length === 0) {
        return NextResponse.json({ error: "Geen documenten om te verwijderen" }, { status: 404 })
      }
      
      const index = parseInt(documentIndex || '0')
      if (isNaN(index) || index < 0 || index >= project.documents.length) {
        return NextResponse.json({ error: "Ongeldig document index" }, { status: 400 })
      }
      
      // Remove specific document
      project.documents.splice(index, 1)
      
      // If no documents left, remove the array
      if (project.documents.length === 0) {
        project.documents = undefined
      }
      
      await project.save()
      
      return NextResponse.json({ message: "Document succesvol verwijderd" })
    }
    
  } catch (err) {
    console.error("Error deleting file:", err)
    return NextResponse.json({ error: "Fout bij verwijderen van bestand" }, { status: 500 })
  }
}