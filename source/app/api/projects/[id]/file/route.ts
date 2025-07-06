import { NextResponse, NextRequest } from "next/server"
import dbConnect from "../../../../lib/mongodb"
import Project from "../../../../lib/models/Project"

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const url = req.nextUrl
    const id = url.pathname.split("/")[4]
    
    const fileType = url.searchParams.get('type')
    const fileIndex = url.searchParams.get('index') // For document index (0, 1, or 2)

    if (!['image', 'document'].includes(fileType || '')) {
      return NextResponse.json({ error: "Ongeldig bestandstype" }, { status: 400 })
    }
    
    const project = await Project.findById(id)
    
    if (!project) {
      return NextResponse.json({ error: "Project niet gevonden" }, { status: 404 })
    }

    if (fileType === 'image') {
      if (!project.image) {
        return NextResponse.json({ error: "Geen afbeelding gevonden" }, { status: 404 })
      }
      
      const buffer = Buffer.from(project.image.data, 'base64')
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': project.image.contentType,
          'Content-Disposition': `attachment; filename="${project.image.filename}"`
        }
      })
    }

    if (fileType === 'document') {
      if (!project.documents || project.documents.length === 0) {
        return NextResponse.json({ error: "Geen documenten gevonden" }, { status: 404 })
      }

      const docIndex = parseInt(fileIndex || '0')
      
      if (docIndex < 0 || docIndex >= project.documents.length) {
        return NextResponse.json({ error: "Ongeldig document index" }, { status: 400 })
      }

      const document = project.documents[docIndex]
      
      if (!document) {
        return NextResponse.json({ error: "Document niet gevonden" }, { status: 404 })
      }

      const buffer = Buffer.from(document.data, 'base64')
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': document.contentType,
          'Content-Disposition': `attachment; filename="${document.filename}"`
        }
      })
    }

  } catch (err) {
    console.error("Error fetching project file:", err)
    return NextResponse.json({ error: "Fout bij ophalen van bestandsinhoud" }, { status: 500 })
  }
}