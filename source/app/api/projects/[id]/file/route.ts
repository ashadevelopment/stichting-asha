// app/api/projects/[id]/file/route.ts
import { NextResponse, NextRequest } from "next/server"
import dbConnect from "../../../../lib/mongodb"
import Project from "../../../../lib/models/Project"

// GET bestandsinhoud voor een specifiek project
export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const url = req.nextUrl
    const id = url.pathname.split("/")[4]
    

    const fileType = url.searchParams.get('type')
    
    if (!['image', 'document'].includes(fileType || '')) {
      return NextResponse.json({ error: "Ongeldig bestandstype" }, { status: 400 })
    }
    
    const project = await Project.findById(id)
    
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