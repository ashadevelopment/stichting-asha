import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import Notice from '../../../lib/models/Notice'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET() {
  try {
    await dbConnect()
    // Get all notices sorted by created date (newest first)
    const notices = await Notice.find({}).sort({ createdAt: -1 })
    return NextResponse.json(notices)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    await dbConnect()
    const data = await req.json()
    
    // Check if there's already an active notice
    const activeNotice = await Notice.findOne({ isActive: true })
    
    if (activeNotice) {
      // Deactivate the current active notice
      activeNotice.isActive = false
      await activeNotice.save()
    }
    
    // Create the new notice
    const notice = await Notice.create(data)
    return NextResponse.json(notice, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create notice' }, { status: 500 })
  }
}