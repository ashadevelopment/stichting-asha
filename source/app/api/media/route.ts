import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/authOptions";
import { getMediaModel } from "../../lib/models/Media";
import dbConnect from "../../lib/mongodb";
import ActivityModel from "../../lib/models/Activity";

// Helper function to create thumbnail
function createThumbnail(base64Data: string, contentType: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!base64Data || !contentType.startsWith('image/')) {
      resolve('');
      return;
    }

    try {
      // For now, just return a cropped version of the original
      // In production, you might want to use a proper image processing library
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = 200;
        canvas.height = 200;
        ctx?.drawImage(img, 0, 0, 200, 200);
        resolve(canvas.toDataURL(contentType, 0.7));
      };
      
      img.onerror = () => resolve('');
      img.src = `data:${contentType};base64,${base64Data}`;
    } catch (error) {
      resolve('');
    }
  });
}

// GET - Fetch media with pagination and size limits
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // 'image' or 'video'
    const includeData = searchParams.get('includeData') === 'true';
    
    const MediaModel = await getMediaModel();
    
    // Build query
    const query: any = {};
    if (type) {
      query['media.type'] = type;
    }
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    let mediaItems;
    
    if (includeData) {
      // Only load full data when explicitly requested (e.g., for admin page)
      mediaItems = await MediaModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } else {
      // For display purposes, only load metadata and thumbnails
      mediaItems = await MediaModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title description media.type media.contentType author createdAt updatedAt thumbnail')
        .lean();
    }
    
    // Get total count for pagination
    const totalItems = await MediaModel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    
    return NextResponse.json({
      items: mediaItems,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Fout bij het ophalen van media', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Add new media
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const file = formData.get('file') as File;
    const mediaType = formData.get('mediaType') as string;

    if (!title || !file) {
      return NextResponse.json({ error: 'Title and file are required' }, { status: 400 });
    }

    // File size limits
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    const maxSize = mediaType === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` 
      }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // Create thumbnail for images
    let thumbnail = '';
    if (mediaType === 'image') {
      // For server-side thumbnail generation, you might want to use a library like 'sharp'
      // For now, we'll store the full image and generate thumbnails client-side
      thumbnail = base64; // In production, create a smaller version
    }

    const MediaModel = await getMediaModel();

    const newMedia = new MediaModel({
      title,
      description,
      media: {
        filename: file.name,
        contentType: file.type,
        data: base64,
        type: mediaType,
        size: file.size
      },
      author: session.user?.name || 'Unknown',
      thumbnail: thumbnail ? {
        data: thumbnail,
        contentType: file.type
      } : undefined
    });

    await newMedia.save();

    // Log activity
    await dbConnect();
    await ActivityModel.create({
      type: 'create',
      entityType: 'media',
      entityId: newMedia._id,
      entityName: title,
      performedBy: session.user?.email || 'Unknown',
      performedByName: session.user?.name || 'Unknown'
    });

    return NextResponse.json({ 
      message: 'Media uploaded successfully',
      id: newMedia._id 
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: 'Error uploading media', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}