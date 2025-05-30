import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "../../lib/authOptions"
import dbConnect from '../../lib/mongodb'
import Newsletter from '../../lib/models/Newsletter'

// Middleware to check admin access
async function checkAdminAccess(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== 'beheerder' && session.user.role !== 'developer')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  
  return null
}

// GET all newsletter posts
export async function GET(req: NextRequest) {
  try {
    await dbConnect()
    
    // Optional query parameter for sorting
    const searchParams = req.nextUrl.searchParams
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    // Fetch posts, sorted by most recent first
    const posts = await Newsletter.find({})
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
    
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching newsletter posts:', error)
    return NextResponse.json({ error: 'Failed to fetch newsletter posts' }, { status: 500 })
  }
}

// POST create a new newsletter post
export async function POST(req: NextRequest) {
  // Check admin access
  const authCheck = await checkAdminAccess(req)
  if (authCheck) return authCheck

  try {
    await dbConnect()
    
    // Parse multipart form data
    const formData = await req.formData()
    
    // Prepare newsletter post data
    const newsletterPost: any = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      content: formData.get('content') as string,
      type: formData.get('type') as 'article' | 'video',
      link: formData.get('link') as string,
      videoUrl: formData.get('videoUrl') as string,
      author: formData.get('author') || 'Admin',
    }

    // Handle image upload
    const imageFile = formData.get('image') as File | null
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      newsletterPost.image = {
        filename: imageFile.name,
        contentType: imageFile.type,
        data: buffer.toString('base64')
      }
    }

    // Auto-detect YouTube videos and set embed URL
    if (newsletterPost.link && newsletterPost.link.includes('youtube.com/watch')) {
      const videoIdMatch = newsletterPost.link.match(/v=([^&]+)/)
      if (videoIdMatch) {
        newsletterPost.type = 'video'
        newsletterPost.videoUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`
      }
    } else if (newsletterPost.link && newsletterPost.link.includes('youtu.be/')) {
      const videoIdMatch = newsletterPost.link.match(/youtu\.be\/([^?]+)/)
      if (videoIdMatch) {
        newsletterPost.type = 'video'
        newsletterPost.videoUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}`
      }
    }

    // Create new newsletter post
    const newPost = await Newsletter.create(newsletterPost)
    
    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error('Error creating newsletter post:', error)
    return NextResponse.json({ error: 'Failed to create newsletter post' }, { status: 500 })
  }
}