import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../lib/mongodb";
import Project from "../../lib/models/Project";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/authOptions";
import { recordActivity } from "../../lib/utils/activityUtils";

// GET all projects
export async function GET() {
  try {
    await dbConnect();
    const projects = await Project.find().sort({ projectDate: -1 });
    return NextResponse.json(projects);
  } catch (err: any) {
    console.error("Error fetching projects:", err);
    return NextResponse.json(
      { error: "Fout bij ophalen van projecten", details: err.message },
      { status: 500 }
    );
  }
}

// POST new project (admins only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if session exists and the user has the required role
    if (!session?.user || !session.user.role || !["beheerder", "developer"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen projecten toevoegen." },
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await req.json();

    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "Titel en beschrijving zijn verplicht" },
        { status: 400 }
      );
    }

    // Check if trying to pin and if pin limit is reached
    if (body.pinned) {
      const pinnedCount = await Project.countDocuments({ pinned: true });
      if (pinnedCount >= 3) {
        return NextResponse.json(
          { error: "Je kunt maximaal 3 projecten vastpinnen" },
          { status: 400 }
        );
      }
    }

    const projectData = {
      ...body,
      author: session.user.name || "Anoniem",
      projectDate: body.projectDate || new Date(),
      pinned: body.pinned || false,
    };

    const project = await Project.create(projectData);

    await recordActivity({
      type: "create",
      entityType: "project",
      entityId: project._id.toString(),
      entityName: project.title,
      performedBy: session.user.id || "unknown",
      performedByName: session.user.name || "Onbekend",
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err: any) {
    console.error("Error creating project:", err);
    return NextResponse.json(
      { error: "Fout bij aanmaken van project", details: err.message },
      { status: 500 }
    );
  }
}

// PUT update project (admins only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || 
        (session.user.role !== 'beheerder' && session.user.role !== 'developer')) {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen projecten bijwerken." }, 
        { status: 403 }
      )
    }
    
    await dbConnect()
    
    // Parse FormData instead of JSON
    const formData = await req.formData()
    
    // Extract form fields
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const longDescription = formData.get('longDescription') as string
    const tags = formData.get('tags') as string
    const projectDate = formData.get('projectDate') as string
    
    // Extract files
    const imageFile = formData.get('image') as File | null
    const documentFiles = formData.getAll('documents') as File[]
    
    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json({ error: "Titel is verplicht" }, { status: 400 })
    }
    
    if (!description?.trim()) {
      return NextResponse.json({ error: "Beschrijving is verplicht" }, { status: 400 })
    }
    
    if (!projectDate) {
      return NextResponse.json({ error: "Projectdatum is verplicht" }, { status: 400 })
    }
    
    // Find the project
    const project = await Project.findById(params.id)
    
    if (!project) {
      return NextResponse.json({ error: "Project niet gevonden" }, { status: 404 })
    }
    
    // Update basic fields
    project.title = title.trim()
    project.description = description.trim()
    project.longDescription = longDescription?.trim() || ''
    project.projectDate = new Date(projectDate)
    
    // Handle tags
    if (tags) {
      project.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    } else {
      project.tags = []
    }
    
    // Handle image upload
    if (imageFile && imageFile.size > 0) {
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
      project.image = {
        filename: imageFile.name,
        contentType: imageFile.type,
        data: imageBuffer
      }
    }
    
    // Handle document uploads
    if (documentFiles && documentFiles.length > 0) {
      const documents = []
      
      for (const file of documentFiles) {
        if (file.size > 0) {
          const buffer = Buffer.from(await file.arrayBuffer())
          documents.push({
            filename: file.name,
            contentType: file.type,
            data: buffer
          })
        }
      }
      
      // Add new documents to existing ones (or replace if you prefer)
      if (documents.length > 0) {
        if (project.documents) {
          project.documents.push(...documents)
        } else {
          project.documents = documents
        }
      }
    }
    
    // Save the updated project
    await project.save()
    
    return NextResponse.json({
      _id: project._id,
      title: project.title,
      description: project.description,
      longDescription: project.longDescription,
      tags: project.tags,
      projectDate: project.projectDate,
      image: project.image ? {
        filename: project.image.filename,
        contentType: project.image.contentType,
        data: project.image.data.toString('base64')
      } : undefined,
      documents: project.documents?.map((doc: any ) => ({
        filename: doc.filename,
        contentType: doc.contentType,
        data: doc.data.toString('base64')
      })),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    })
    
  } catch (err) {
    console.error("Error updating project:", err)
    return NextResponse.json({ error: "Fout bij bijwerken van project" }, { status: 500 })
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Ensure session exists and role is defined
    if (!session?.user || !session.user.role || !["beheerder", "developer"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen projecten verwijderen." },
        { status: 403 }
      );
    }

    await dbConnect();

    // Allow id from query or body
    const url = new URL(req.url);
    let projectId = url.searchParams.get("id");
    if (!projectId) {
      const body = await req.json();
      projectId = body.id;
    }

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is verplicht" }, { status: 400 });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project niet gevonden" }, { status: 404 });
    }

    const projectName = project.title;
    await Project.findByIdAndDelete(projectId);

    await recordActivity({
      type: "delete",
      entityType: "project",
      entityId: projectId,
      entityName: projectName,
      performedBy: session.user.id || "unknown",
      performedByName: session.user.name || "Onbekend",
    });

    return NextResponse.json({ success: true, message: "Project succesvol verwijderd" });
  } catch (err: any) {
    console.error("Error deleting project:", err);
    return NextResponse.json(
      { error: "Fout bij verwijderen van project", details: err.message },
      { status: 500 }
    );
  }
}