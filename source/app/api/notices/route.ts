import { NextRequest, NextResponse } from "next/server"
import dbConnect from "../../lib/mongodb"
import Notice from "../../lib/models/Notice"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

// GET all notices
export async function GET(req: NextRequest) {
  try {
    await dbConnect()
    
    // Get current date
    const now = new Date()
    
    // Find all active notices that haven't expired
    const notices = await Notice.find({
      isActive: true,
      expirationDate: { $gt: now }
    }).sort({ createdAt: -1 })
    
    return NextResponse.json(notices)
  } catch (error) {
    console.error("Failed to get notices:", error)
    return NextResponse.json(
      { error: "Failed to fetch notices" },
      { status: 500 }
    )
  }
}

// POST create a new notice
export async function POST(req: NextRequest) {
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
    
    const data = await req.json()
    
    // Validate required fields
    if (!data.title || !data.message || !data.expirationDate) {
      return NextResponse.json(
        { error: "Titel, bericht en verloopdatum zijn verplicht" },
        { status: 400 }
      )
    }
    
    // Create new notice
    const notice = await Notice.create({
      title: data.title,
      message: data.message,
      roles: data.roles || ['gebruiker'],
      expirationDate: new Date(data.expirationDate),
      author: data.author || session.user.name
    })
    
    return NextResponse.json(notice, { status: 201 })
  } catch (error) {
    console.error("Failed to create notice:", error)
    return NextResponse.json(
      { error: "Failed to create notice" },
      { status: 500 }
    )
  }
}

// Cleanup expired notices (could be called by a cron job)
export async function DELETE() {
  try {
    await dbConnect()
    
    // Get current date
    const now = new Date()
    
    // Find and update all expired notices
    const result = await Notice.updateMany(
      { expirationDate: { $lt: now }, isActive: true },
      { isActive: false }
    )
    
    return NextResponse.json({ 
      message: `Marked ${result.modifiedCount} expired notices as inactive`, 
    })
  } catch (error) {
    console.error("Failed to clean up expired notices:", error)
    return NextResponse.json(
      { error: "Failed to clean up expired notices" },
      { status: 500 }
    )
  }
}