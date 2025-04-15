// app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server"
import dbConnect from "../../lib/mongodb"
import Project from "../../lib/models/Project"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { recordActivity } from "../../lib/middleware/activityTracking"

// GET alle projecten
export async function GET() {
  try {
    await dbConnect()
    // Verwijder de select() om alle data inclusief image.data en document.data te sturen
    const projects = await Project.find().sort({ projectDate: -1 })
    return NextResponse.json(projects)
  } catch (err) {
    console.error("Error fetching projects:", err)
    return NextResponse.json({ error: "Fout bij ophalen van projecten" }, { status: 500 })
  }
}

// POST nieuw project (alleen voor beheerders)
export async function POST(req: NextRequest) {
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
    
    await dbConnect()
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
    
    // Record activity after successful project creation
    await recordActivity({
      type: 'create',
      entityType: 'project',
      entityId: project._id.toString(),
      entityName: project.title,
      performedBy: session.user.id || 'unknown',
      performedByName: session.user.name || 'Onbekend'
    })
    
    return NextResponse.json(project, { status: 201 })
  } catch (err) {
    console.error("Error creating project:", err)
    return NextResponse.json({ error: "Fout bij aanmaken van project" }, { status: 500 })
  }
}

// PUT project update (alleen voor beheerders)
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
    const body = await req.json()
    
    // Validatie
    if (!body.id || !body.title || !body.description) {
      return NextResponse.json(
        { error: "Project ID, titel en beschrijving zijn verplicht" }, 
        { status: 400 }
      )
    }
    
    const project = await Project.findByIdAndUpdate(
      body.id,
      { $set: body },
      { new: true }
    )
    
    if (!project) {
      return NextResponse.json({ error: "Project niet gevonden" }, { status: 404 })
    }
    
    // Record activity after successful project update
    await recordActivity({
      type: 'update',
      entityType: 'project',
      entityId: project._id.toString(),
      entityName: project.title,
      performedBy: session.user.id || 'unknown',
      performedByName: session.user.name || 'Onbekend'
    })
    
    return NextResponse.json(project)
  } catch (err) {
    console.error("Error updating project:", err)
    return NextResponse.json({ error: "Fout bij bijwerken van project" }, { status: 500 })
  }
}

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
    
    // Get project ID from URL or request body
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    // If ID is not in URL params, try to get it from request body
    let projectId = id
    if (!projectId) {
      const body = await req.json()
      projectId = body.id
    }
    
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is verplicht" }, { status: 400 })
    }
    
    // Get project before deleting it (to record the name in activity)
    const project = await Project.findById(projectId)
    
    if (!project) {
      return NextResponse.json({ error: "Project niet gevonden" }, { status: 404 })
    }
    
    const projectName = project.title
    
    // Delete the project
    await Project.findByIdAndDelete(projectId)
    
    // Record activity after successful project deletion
    await recordActivity({
      type: 'delete',
      entityType: 'project',
      entityId: projectId,
      entityName: projectName,
      performedBy: session.user.id || 'unknown',
      performedByName: session.user.name || 'Onbekend'
    })
    
    return NextResponse.json({ success: true, message: "Project succesvol verwijderd" })
  } catch (err) {
    console.error("Error deleting project:", err)
    return NextResponse.json({ error: "Fout bij verwijderen van project" }, { status: 500 })
  }
}