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

function getIdFromRequest(req: NextRequest): string | null {
  const urlParts = req.nextUrl.pathname.split('/')
  return urlParts[urlParts.length - 1] || null
}


export async function GET(req: NextRequest) {
  const id = getIdFromRequest(req)
  if (!id) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    await dbConnect()

    const post = await Newsletter.findById(id)

    if (!post) {
      return NextResponse.json({ error: 'Newsletter post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching newsletter post:', error)
    return NextResponse.json({ error: 'Failed to fetch newsletter post' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const id = getIdFromRequest(req)
  if (!id) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const authCheck = await checkAdminAccess(req)
  if (authCheck) return authCheck

  try {
    await dbConnect()
    const formData = await req.formData()

    const updateData: any = {
      title: formData.get('title'),
      description: formData.get('description'),
      content: formData.get('content'),
      type: formData.get('type'),
      link: formData.get('link'),
      videoUrl: formData.get('videoUrl'),
    }

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

    // YouTube handling
    if (updateData.link?.includes('youtube.com/watch')) {
      const match = updateData.link.match(/v=([^&]+)/)
      if (match) {
        updateData.type = 'video'
        updateData.videoUrl = `https://www.youtube.com/embed/${match[1]}`
      }
    } else if (updateData.link?.includes('youtu.be/')) {
      const match = updateData.link.match(/youtu\.be\/([^?]+)/)
      if (match) {
        updateData.type = 'video'
        updateData.videoUrl = `https://www.youtube.com/embed/${match[1]}`
      }
    }

    const updatedPost = await Newsletter.findByIdAndUpdate(
      id,
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

export async function DELETE(req: NextRequest) {
  const id = getIdFromRequest(req)
  if (!id) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const authCheck = await checkAdminAccess(req)
  if (authCheck) return authCheck

  try {
    await dbConnect()

    const deletedPost = await Newsletter.findByIdAndDelete(id)

    if (!deletedPost) {
      return NextResponse.json({ error: 'Newsletter post not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Newsletter post deleted successfully' })
  } catch (error) {
    console.error('Error deleting newsletter post:', error)
    return NextResponse.json({ error: 'Failed to delete newsletter post' }, { status: 500 })
  }
}