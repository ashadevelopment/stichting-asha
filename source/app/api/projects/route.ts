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

    // Validate documents array doesn't exceed 3
    if (body.documents && body.documents.length > 3) {
      return NextResponse.json(
        { error: "Maximaal 3 documenten per project toegestaan" },
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
      documents: body.documents || []
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
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Ensure session exists and role is defined
    if (!session?.user || !session.user.role || !["beheerder", "developer"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen projecten bijwerken." },
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await req.json();

    if (!body.id || !body.title || !body.description) {
      return NextResponse.json(
        { error: "Project ID, titel en beschrijving zijn verplicht" },
        { status: 400 }
      );
    }

    // Validate documents array doesn't exceed 3
    if (body.documents && body.documents.length > 3) {
      return NextResponse.json(
        { error: "Maximaal 3 documenten per project toegestaan" },
        { status: 400 }
      );
    }

    // Check if trying to pin and if pin limit is reached
    if (body.pinned) {
      const pinnedCount = await Project.countDocuments({ 
        pinned: true, 
        _id: { $ne: body.id } // Exclude current project from count
      });
      if (pinnedCount >= 3) {
        return NextResponse.json(
          { error: "Je kunt maximaal 3 projecten vastpinnen" },
          { status: 400 }
        );
      }
    }

    const project = await Project.findByIdAndUpdate(body.id, { $set: body }, { new: true });
    if (!project) {
      return NextResponse.json({ error: "Project niet gevonden" }, { status: 404 });
    }

    await recordActivity({
      type: "update",
      entityType: "project",
      entityId: project._id.toString(),
      entityName: project.title,
      performedBy: session.user.id || "unknown",
      performedByName: session.user.name || "Onbekend",
    });

    return NextResponse.json(project);
  } catch (err: any) {
    console.error("Error updating project:", err);
    return NextResponse.json(
      { error: "Fout bij bijwerken van project", details: err.message },
      { status: 500 }
    );
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