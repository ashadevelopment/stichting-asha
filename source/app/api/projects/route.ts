// app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../lib/mongodb";
import Project from "../../lib/models/Project";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/authOptions";

// GET all projects
export async function GET() {
  try {
    await dbConnect();
    const projects = await Project.find().sort({ createdAt: -1 });
    
    // Convert Buffer data to base64 for sending to client
    const projectsWithBase64 = projects.map(project => ({
      ...project.toObject(),
      image: project.image ? {
        filename: project.image.filename,
        contentType: project.image.contentType,
        data: project.image.data.toString('base64')
      } : undefined,
      documents: project.documents?.map((doc: any) => ({
        filename: doc.filename,
        contentType: doc.contentType,
        data: doc.data.toString('base64')
      }))
    }));
    
    return NextResponse.json(projectsWithBase64);
  } catch (err: any) {
    console.error("Error fetching projects:", err);
    return NextResponse.json(
      { error: "Fout bij ophalen van projecten" },
      { status: 500 }
    );
  }
}

// POST new project
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.role || !["beheerder", "developer"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen projecten toevoegen." },
        { status: 403 }
      );
    }

    await dbConnect();
    const formData = await req.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const pinned = formData.get('pinned') === 'true';
    const imageFile = formData.get('image') as File | null;
    const documentFiles = formData.getAll('documents') as File[];

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "Titel en beschrijving zijn verplicht" },
        { status: 400 }
      );
    }

    // Check document limit
    if (documentFiles.length > 3) {
      return NextResponse.json(
        { error: "Maximaal 3 documenten toegestaan" },
        { status: 400 }
      );
    }

    // Check pin limit
    if (pinned) {
      const pinnedCount = await Project.countDocuments({ pinned: true });
      if (pinnedCount >= 3) {
        return NextResponse.json(
          { error: "Maximaal 3 projecten kunnen vastgepind worden" },
          { status: 400 }
        );
      }
    }

    const projectData: any = {
      title: title.trim(),
      description: description.trim(),
      author: session.user.name || "Anoniem",
      pinned
    };

    // Handle image upload
    if (imageFile && imageFile.size > 0) {
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      projectData.image = {
        filename: imageFile.name,
        contentType: imageFile.type,
        data: imageBuffer
      };
    }

    // Handle document uploads
    if (documentFiles.length > 0) {
      const documents = [];
      for (const file of documentFiles) {
        if (file.size > 0) {
          const buffer = Buffer.from(await file.arrayBuffer());
          documents.push({
            filename: file.name,
            contentType: file.type,
            data: buffer
          });
        }
      }
      if (documents.length > 0) {
        projectData.documents = documents;
      }
    }

    const project = await Project.create(projectData);
    
    // Return with base64 encoded data
    const response = {
      ...project.toObject(),
      image: project.image ? {
        filename: project.image.filename,
        contentType: project.image.contentType,
        data: project.image.data.toString('base64')
      } : undefined,
      documents: project.documents?.map((doc: any) => ({
        filename: doc.filename,
        contentType: doc.contentType,
        data: doc.data.toString('base64')
      }))
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err: any) {
    console.error("Error creating project:", err);
    return NextResponse.json(
      { error: "Fout bij aanmaken van project" },
      { status: 500 }
    );
  }
}

// DELETE project
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.role || !["beheerder", "developer"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen projecten verwijderen." },
        { status: 403 }
      );
    }

    await dbConnect();
    
    const url = new URL(req.url);
    const projectId = url.searchParams.get("id");

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is verplicht" }, { status: 400 });
    }

    const deletedProject = await Project.findByIdAndDelete(projectId);
    
    if (!deletedProject) {
      return NextResponse.json({ error: "Project niet gevonden" }, { status: 404 });
    }

    return NextResponse.json({ message: "Project succesvol verwijderd" });
  } catch (err: any) {
    console.error("Error deleting project:", err);
    return NextResponse.json(
      { error: "Fout bij verwijderen van project" },
      { status: 500 }
    );
  }
}