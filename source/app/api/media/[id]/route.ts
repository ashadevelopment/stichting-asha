// app/api/media/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/authOptions";
import { getMediaModel } from "../../../lib/models/Media";
import dbConnect from "../../../lib/mongodb";
import ActivityModel from "../../../lib/models/Activity";

// GET - Get single media item with full data
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const MediaModel = await getMediaModel();
    const mediaItem = await MediaModel.findById(params.id).lean();

    if (!mediaItem) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    return NextResponse.json(mediaItem);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Error fetching media', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete media item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const MediaModel = await getMediaModel();
    
    // Get the media item before deletion for activity logging
    const mediaItem = await MediaModel.findById(params.id);
    if (!mediaItem) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete the media item
    await MediaModel.findByIdAndDelete(params.id);

    // Log activity
    await dbConnect();
    await ActivityModel.create({
      type: 'delete',
      entityType: 'media',
      entityId: params.id,
      entityName: mediaItem.title,
      performedBy: session.user?.email || 'Unknown',
      performedByName: session.user?.name || 'Unknown'
    });

    return NextResponse.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Error deleting media', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}