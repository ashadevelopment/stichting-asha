import { NextResponse, NextRequest } from "next/server"
import dbConnect from "../../../../lib/mongodb"
import Project from "../../../../lib/models/Project"

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
  }
  catch (err) {
    console.error("Error fetching project file:", err)
    return NextResponse.json({ error: "Fout bij ophalen van bestandsinhoud" }, { status: 500 })
  }
}