// app/api/notices/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import dbConnect from "../../../lib/mongodb"
import Notice from "../../../lib/models/Notice"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import { recordActivity } from "../../../lib/middleware/activityTracking"

// DELETE a specific notice
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  // Check if user is authenticated and has appropriate role
  if (!session || !['beheerder', 'mede-beheerder'].includes(session.user.role as string)) {
    return NextResponse.json(
      { error: "Niet geautoriseerd" },
      { status: 401 }
    )
  }
  
  try {
    await dbConnect()
    
    const { id } = params
    
    // Get notice before deletion to use name in activity log
    const notice = await Notice.findById(id)
    
    if (!notice) {
      return NextResponse.json(
        { error: "Notitie niet gevonden" },
        { status: 404 }
      )
    }
    
    // Store notice details before deletion
    const noticeTitle = notice.title
    
    // Delete the notice
    await Notice.findByIdAndDelete(id)
    
    // Record activity
    await recordActivity({
      type: 'delete',
      entityType: 'notice',
      entityId: id,
      entityName: noticeTitle,
      performedBy: session?.user?.id || 'unknown',
      performedByName: session.user.name || 'Onbekend'
    })
    
    return NextResponse.json({ message: "Notitie succesvol verwijderd" })
  } catch (error) {
    console.error("Failed to delete notice:", error)
    return NextResponse.json(
      { error: "Failed to delete notice" },
      { status: 500 }
    )
  }
}

// Update a specific notice
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  // Check if user is authenticated and has appropriate role
  if (!session || !['beheerder', 'mede-beheerder'].includes(session.user.role as string)) {
    return NextResponse.json(
      { error: "Niet geautoriseerd" },
      { status: 401 }
    )
  }
  
  try {
    await dbConnect()
    
    const { id } = params
    const data = await req.json()
    
    const notice = await Notice.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    )
    
    if (!notice) {
      return NextResponse.json(
        { error: "Notitie niet gevonden" },
        { status: 404 }
      )
    }
    
    // Record activity
    await recordActivity({
      type: 'update',
      entityType: 'notice',
      entityId: id,
      entityName: notice.title,
      performedBy: session?.user?.id || 'unknown',
      performedByName: session.user.name || 'Onbekend'
    })
    
    return NextResponse.json(notice)
  } catch (error) {
    console.error("Failed to update notice:", error)
    return NextResponse.json(
      { error: "Failed to update notice" },
      { status: 500 }
    )
  }
}