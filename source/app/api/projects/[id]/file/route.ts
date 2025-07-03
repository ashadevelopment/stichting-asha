// app/api/projects/[id]/file/route.ts
import { NextResponse, NextRequest } from "next/server"
import dbConnect from "../../../../lib/mongodb"
import Project from "../../../../lib/models/Project"

// Define the document type
interface DocumentData {
  filename: string;
  contentType: string;
  data: string;
}

// GET bestandsinhoud voor een specifiek project
export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const url = req.nextUrl
    const id = url.pathname.split("/")[4]
    
    const fileType = url.searchParams.get('type')
    const documentIndex = url.searchParams.get('index') // For multiple documents
    
    if (!['image', 'document'].includes(fileType || '')) {
      return NextResponse.json({ error: "Ongeldig bestandstype" }, { status: 400 })
    }
    
    const project = await Project.findById(id)
    
    if (!project) {
      return NextResponse.json({ error: "Project niet gevonden" }, { status: 404 })
    }
    
    let file;
    
    if (fileType === 'image') {
      file = project.image
    } else if (fileType === 'document') {
      // Handle multiple documents
      if (project.documents && project.documents.length > 0) {
        if (documentIndex !== null) {
          const index = parseInt(documentIndex, 10)
          if (index >= 0 && index < project.documents.length) {
            file = project.documents[index]
          } else {
            return NextResponse.json({ error: "Document index buiten bereik" }, { status: 400 })
          }
        } else {
          // Return all documents if no index specified
          return NextResponse.json({
            documents: project.documents.map((doc: DocumentData) => ({
              filename: doc.filename,
              contentType: doc.contentType,
              data: doc.data
            }))
          })
        }
      }
    }
    
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