import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "../../../lib/authOptions"
import dbConnect from '../../../lib/mongodb'
import Newsletter from '../../../lib/models/Newsletter'

// Middleware to check admin access
async function checkAdminAccess(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== 'beheerder' && session.user.role !== 'developer')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  
  return null
}

// GET single newsletter post
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    const post = await Newsletter.findById(params.id)
    
    if (!post) {
      return NextResponse.json({ error: 'Newsletter post not found' }, { status: 404 })
    }
    
    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching newsletter post:', error)
    return NextResponse.json({ error: 'Failed to fetch newsletter post' }, { status: 500 })
  }
}

// PUT update an existing newsletter post
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin access
  const authCheck = await checkAdminAccess(req)
  if (authCheck) return authCheck

  try {
    await dbConnect()
    
    // Parse multipart form data
    const formData = await req.formData()
    
    // Prepare update data
    const updateData: any = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      content: formData.get('content') as string,
      type: formData.get('type') as 'article' | 'video',
      link: formData.get('link') as string,
      videoUrl: formData.get('videoUrl') as string,
    }

    // Handle image upload
    const imageFile = formData.get('image') as File | null
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      updateData.image = {
        filename: imageFile.name,
        contentType: imageFile.type,
        data: buffer.toString('base64')
      }
    }

    // Auto-detect YouTube videos and set embed URL
    if (updateData.link && updateData.link.includes('youtube.com/watch')) {
      const videoIdMatch = updateData.link.match(/v=([^&]+)/)
      if (videoIdMatch) {
        updateData.type = 'video'
        updateData.videoUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`
      }
    } else if (updateData.link && updateData.link.includes('youtu.be/')) {
      const videoIdMatch = updateData.link.match(/youtu\.be\/([^?]+)/)
      if (videoIdMatch) {
        updateData.type = 'video'
        updateData.videoUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`
      }
    }

    // Update the post
    const updatedPost = await Newsletter.findByIdAndUpdate(
      params.id, 
      updateData, 
      { new: true, runValidators: true }
    )
    
    if (!updatedPost) {
      return NextResponse.json({ error: 'Newsletter post not found' }, { status: 404 })
    }
    
    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating newsletter post:', error)
    return NextResponse.json({ error: 'Failed to update newsletter post' }, { status: 500 })
  }
}

// DELETE a newsletter post
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check admin access
  const authCheck = await checkAdminAccess(req)
  if (authCheck) return authCheck

  try {
    await dbConnect()
    
    // Delete the post
    const deletedPost = await Newsletter.findByIdAndDelete(params.id)
    
    if (!deletedPost) {
      return NextResponse.json({ error: 'Newsletter post not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Newsletter post deleted successfully' })
  } catch (error) {
    console.error('Error deleting newsletter post:', error)
    return NextResponse.json({ error: 'Failed to delete newsletter post' }, { status: 500 })
  }
}