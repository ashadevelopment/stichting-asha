// app/api/projects/[id]/pin/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import Project from "../../../../lib/models/Project";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/authOptions";

// PUT toggle pin status
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !session.user.role || !["beheerder", "developer"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Geen toegang. Alleen beheerders kunnen projecten pinnen." }, 
        { status: 403 }
      );
    }
    
    await dbConnect();
    
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const projectId = pathParts[pathParts.indexOf('projects') + 1];
    const { pinned } = await req.json();
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return NextResponse.json({ error: "Project niet gevonden" }, { status: 404 });
    }
    
    // If trying to pin, check limit
    if (pinned && !project.pinned) {
      const pinnedCount = await Project.countDocuments({ pinned: true });
      if (pinnedCount >= 3) {
        return NextResponse.json(
          { error: "Maximaal 3 projecten kunnen vastgepind worden" },
          { status: 400 }
        );
      }
    }
    
    project.pinned = pinned;
    await project.save();
    
    return NextResponse.json({ 
      message: pinned ? "Project vastgepind" : "Project losgemaakt",
      pinned: project.pinned 
    });
    
  } catch (err) {
    console.error("Error updating pin status:", err);
    return NextResponse.json({ error: "Fout bij bijwerken van pin status" }, { status: 500 });
  }
}