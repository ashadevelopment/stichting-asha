// app/api/projects/[id]/file/route.ts
import { NextResponse } from "next/server"
import connectDB from "../../../../lib/mongodb"
import Project from "../../../../lib/models/Project"

// GET bestandsinhoud voor een specifiek project
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    // Bepaal of het om een afbeelding of document gaat
    const url = new URL(req.url)
    const fileType = url.searchParams.get('type')
    
    if (!['image', 'document'].includes(fileType || '')) {
      return NextResponse.json({ error: "Ongeldig bestandstype" }, { status: 400 })
    }
    
    const project = await Project.findById(params.id)
    
    if (!project) {
      return NextResponse.json({ error: "Project niet gevonden" }, { status: 404 })
    }
    
    const file = fileType === 'image' ? project.image : project.document
    
    if (!file || !file.data) {
      return NextResponse.json({ error: "Bestand niet gevonden" }, { status: 404 })
    }
    
    // Retourneer bestandsgegevens
    return NextResponse.json({
      filename: file.filename,
      contentType: file.contentType,
      data: file.data
    })
  } catch (err) {
    console.error("Error fetching project file:", err)
    return NextResponse.json({ error: "Fout bij ophalen van bestand" }, { status: 500 })
  }
}