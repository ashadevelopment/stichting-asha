// app/api/projects/route.ts
import { NextResponse } from "next/server"
import connectDB from "../../lib/mongodb"
import Project from "../../lib/models/Project"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

// GET alle projecten
export async function GET() {
  try {
    await connectDB()
    // Verwijder de select() om alle data inclusief image.data en document.data te sturen
    const projects = await Project.find().sort({ projectDate: -1 })
    return NextResponse.json(projects)
  } catch (err) {
    console.error("Error fetching projects:", err)
    return NextResponse.json({ error: "Fout bij ophalen van projecten" }, { status: 500 })
  }
}

// POST nieuw project (alleen voor beheerders)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Controleer of de gebruiker is ingelogd en beheerder is
    if (!session || !session.user || 
        (session.user.role !== 'beheerder' && session.user.role !== 'developer')) {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen projecten toevoegen." }, 
        { status: 403 }
      )
    }
    
    await connectDB()
    const body = await req.json()
    
    // Validatie
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "Titel en beschrijving zijn verplicht" }, 
        { status: 400 }
      )
    }
    
    // Voeg auteur toe aan het project
    const projectData = {
      ...body,
      author: session.user.name || "Anoniem",
      projectDate: body.projectDate || new Date()
    }
    
    const project = await Project.create(projectData)
    
    return NextResponse.json(project, { status: 201 })
  } catch (err) {
    console.error("Error creating project:", err)
    return NextResponse.json({ error: "Fout bij aanmaken van project" }, { status: 500 })
  }
}