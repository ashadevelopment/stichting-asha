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
      .select('-image.data') // Exclude large image data from initial fetch
    
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

    // Create new newsletter post
    const newPost = await Newsletter.create(newsletterPost)
    
    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error('Error creating newsletter post:', error)
    return NextResponse.json({ error: 'Failed to create newsletter post' }, { status: 500 })
  }
}

// PUT update an existing newsletter post
export async function PUT(req: NextRequest) {
  // Check admin access
  const authCheck = await checkAdminAccess(req)
  if (authCheck) return authCheck

  try {
    await dbConnect()
    
    // Parse multipart form data
    const formData = await req.formData()
    
    // Get post ID from URL
    const postId = req.nextUrl.pathname.split('/').pop()
    if (!postId) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

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

    // Update the post
    const updatedPost = await Newsletter.findByIdAndUpdate(
      postId, 
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
export async function DELETE(req: NextRequest) {
  // Check admin access
  const authCheck = await checkAdminAccess(req)
  if (authCheck) return authCheck

  try {
    await dbConnect()
    
    // Get post ID from URL
    const postId = req.nextUrl.pathname.split('/').pop()
    if (!postId) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }

    // Delete the post
    const deletedPost = await Newsletter.findByIdAndDelete(postId)
    
    if (!deletedPost) {
      return NextResponse.json({ error: 'Newsletter post not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Newsletter post deleted successfully' })
  } catch (error) {
    console.error('Error deleting newsletter post:', error)
    return NextResponse.json({ error: 'Failed to delete newsletter post' }, { status: 500 })
  }
}